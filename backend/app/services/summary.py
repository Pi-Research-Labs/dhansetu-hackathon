"""LLM-written situation summaries for the enterprise card.

Sarvam's chat-completions API, verified against the live endpoint rather than
guessed at (docs.sarvam.ai/api-reference-docs/chat/chat-completions):

  POST https://api.sarvam.ai/v1/chat/completions
  header: api-subscription-key: <same key the speech-to-text path uses;
          one Sarvam subscription key covers all their APIs>
  body:   {"model", "messages": [{"role", "content"}], "max_tokens"}

Model choice is deliberate. `sarvam-105b` is a REASONING model: it fills
`reasoning_content` first and only then `content`, so a short max_tokens
returns `content: null` with finish_reason "length" and looks exactly like the
API silently returning nothing. `sarvam-105b-conversations` answers directly
and came back in ~1.4s, which is what this needs.

WHAT THIS IS FOR, AND WHAT IT ISN'T
The summary explains WHY an enterprise looks the way it does. It deliberately
does NOT recommend anything: the recommended actions beside it come from the
rule engine through fixed templates, and those stay deterministic. Generating
financial advice for a farmer from a model that can hallucinate a number is a
different risk class from generating a description of numbers it was handed.

Every figure in the prompt is passed explicitly and the model is told to use
only those, so it is paraphrasing supplied values rather than recalling
anything. A failed or empty generation returns None; the caller renders the
card without a summary rather than failing.
"""

import re

import httpx

from app.core.config import settings
from app.core.db import get_pool

SARVAM_CHAT_URL = "https://api.sarvam.ai/v1/chat/completions"
SUMMARY_MODEL = "sarvam-105b-conversations"

# Enough for 2-3 sentences with headroom; this model does not spend the budget
# on reasoning the way sarvam-105b does.
_MAX_TOKENS = 220
_TIMEOUT_SECONDS = 25.0

_LANG_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "te": "Telugu",
    "mr": "Marathi",
    "gu": "Gujarati",
}

_SYSTEM_PROMPT = (
    "You brief rural field officers in India who visit small businesses. "
    "Write 2-3 short sentences explaining what is happening to this business "
    "and why, in plain language an officer can say out loud to the owner. "
    "Use ONLY the facts given to you -- never invent or estimate a number, "
    "and never mention a figure that was not provided. "
    "Do not quote ratios, decimals, percentages of unclear meaning, or "
    "technical terms; the facts are already written in plain words, so use "
    "them as written. "
    "Write every number using digits exactly as given (57, 22, Rs 31,000). "
    "Never spell a number out in words and never round or change it. "
    "Describe the situation only: do NOT recommend actions, the officer "
    "already has those. No preamble, no bullet points, no headings."
)

# The model writes what it is handed. Given net_buffer_days = -63.0 it says
# "a negative cash buffer of -63.0 days"; given margin_gap_90d = 0.1479 it says
# "the margin gap is 0.1479", which is meaningless to a field officer and is
# exactly the jargon this feature exists to remove. So every fact is turned
# into a plain phrase HERE, deterministically, and the model only has to join
# them into readable sentences -- the numbers stay ours, the prose is its job.
_REASON_PHRASES = {
    "margin_squeeze": "costs are rising faster than the prices they get",
    "working_capital_erosion": "everyday working money is draining away",
    "debt_overhang": "loan repayments are heavy relative to what comes in",
    "receivable_stretch": "buyers are taking a long time to pay",
    "demand_trough": "demand has dropped off",
}


def _rupees(value) -> str:
    return f"Rs {int(round(float(value))):,}"


def _fact_lines(card: dict, alert: dict | None) -> list[str]:
    """Plain-language facts. Anything NULL is omitted rather than sent as
    "None" -- a model handed "days sales outstanding: None" will happily write
    a sentence about it."""
    facts: list[str] = []

    def add(text: str | None) -> None:
        if text:
            facts.append(f"- {text}")

    add(f"It is a {card.get('sub_type')} in {card.get('block')}, {card.get('district')}")

    reasons = [
        _REASON_PHRASES.get(r, str(r).replace("_", " "))
        for r in (card.get("reason_1"), card.get("reason_2"), card.get("reason_3"))
        if r
    ]
    if reasons:
        add("The main problems, most serious first: " + "; ".join(reasons))

    buffer_days = card.get("net_buffer_days")
    if buffer_days is not None:
        days = int(round(float(buffer_days)))
        if days < 0:
            add(f"Their cash ran out about {abs(days)} days ago; they are running on borrowed or delayed money")
        elif days < 30:
            add(f"They have only about {days} days of cash left before they run short")
        else:
            add(f"They have about {days} days of cash cover, which is comfortable")

    dso = card.get("dso_days")
    if dso is not None:
        add(f"Buyers take about {int(round(float(dso)))} days on average to pay them")

    overdue = card.get("overdue_share")
    if overdue is not None:
        add(f"About {int(round(float(overdue) * 100))} percent of the money buyers owe them is already overdue")

    margin_gap = card.get("margin_gap_90d")
    if margin_gap is not None and float(margin_gap) != 0:
        add(f"Over the last 3 months their costs rose about {int(round(float(margin_gap) * 100))} percent faster than their prices")

    zero_days = card.get("zero_inflow_days_30d")
    if zero_days:
        add(f"In the last 30 days there were {int(zero_days)} days with no money coming in at all")

    missed = card.get("missed_emis_90d")
    if missed:
        add(f"They have missed {int(missed)} loan instalments in the last 3 months")

    digital = card.get("digital_share")
    if digital is not None:
        # digital_share is upi_share + wallet_share, each clamped separately by
        # the simulator, so the sum can exceed 1.0 -- without this the model
        # cheerfully writes "about 102 percent of sales are digital".
        pct = min(100, max(0, int(round(float(digital) * 100))))
        add(f"About {pct} percent of their sales are taken digitally rather than in cash")

    if alert:
        shortfall = alert.get("projected_shortfall")
        week = alert.get("shortfall_week_of")
        # Only describe a shortfall that was still ahead at the time of this
        # assessment. v_alert_actions returns the most recent alert, which for
        # a healthy enterprise can be years old -- and "expected to fall short
        # in the week of 2023-12-30" reads as a forecast, not history.
        # v_alert_actions hands shortfall_week_of back as text while as_of is
        # a date, so compare them in one form. ISO dates sort correctly as
        # strings, so normalising to str is enough and avoids a parse that
        # could raise on unexpected input.
        as_of = card.get("as_of")
        upcoming = (
            week is not None
            and as_of is not None
            and str(week) >= as_of.isoformat()
        )
        if shortfall is not None and upcoming:
            add(f"They are expected to fall short by about {_rupees(shortfall)} in the week of {week}")

    return facts


def _build_messages(card: dict, alert: dict | None, lang: str) -> list[dict]:
    language = _LANG_NAMES.get(lang, "English")
    facts = "\n".join(_fact_lines(card, alert))
    return [
        {"role": "system", "content": _SYSTEM_PROMPT},
        {
            "role": "user",
            "content": (
                f"Write the summary in {language}.\n\n"
                f"Owner: {card.get('proprietor_name')}\n"
                f"{facts}"
            ),
        },
    ]


_NUMBER_RE = re.compile(r"\d[\d,]*")


def _numbers_in(text: str) -> set[str]:
    return {m.group(0).replace(",", "").lstrip("0") or "0" for m in _NUMBER_RE.finditer(text)}


def _numbers_are_faithful(summary: str, facts: str) -> bool:
    """Every number in the summary must have come from the facts.

    Not paranoia: asked for these summaries in Gujarati the model wrote "55
    days" where the facts said 57, and in Hindi "23 percent" where they said
    22 -- spelling numbers out in Indic scripts is where it drifts. These
    figures get read aloud to a farmer, so a wrong number is worse than no
    summary at all, and this check is what makes "use only the facts given"
    enforced rather than merely requested.
    """
    return _numbers_in(summary) <= _numbers_in(facts)


async def _generate(card: dict, alert: dict | None, lang: str) -> str | None:
    """Generate, then verify the numbers survived. One retry, then give up."""
    facts = "\n".join(_fact_lines(card, alert))
    for _ in range(2):
        text = await _generate_once(card, alert, lang)
        if text is None:
            return None
        if _numbers_are_faithful(text, facts):
            return text
    return None


async def _generate_once(card: dict, alert: dict | None, lang: str) -> str | None:
    if not settings.sarvam_api_key:
        return None
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT_SECONDS) as client:
            response = await client.post(
                SARVAM_CHAT_URL,
                headers={"api-subscription-key": settings.sarvam_api_key},
                json={
                    "model": SUMMARY_MODEL,
                    "messages": _build_messages(card, alert, lang),
                    "max_tokens": _MAX_TOKENS,
                },
            )
        if response.status_code != 200:
            return None
        body = response.json()
        # content can be present-but-null on this API (see module docstring),
        # so this checks the value rather than the key.
        content = (body.get("choices") or [{}])[0].get("message", {}).get("content")
        return content.strip() if content and content.strip() else None
    except (httpx.HTTPError, ValueError, KeyError, IndexError):
        # A summary is a nice-to-have on the card; never fail the request for it.
        return None


async def get_enterprise_summary(
    enterprise_id: str, lang: str = "en", refresh: bool = False
) -> dict | None:
    """Cached summary for the enterprise's current assessment vintage.

    Returns None when there is no assessment to describe, or when generation
    failed -- the caller shows the card without it.
    """
    pool = get_pool()
    async with pool.acquire() as conn:
        card = await conn.fetchrow(
            "SELECT * FROM dhansetu.v_enterprise_card WHERE enterprise_id = $1",
            enterprise_id,
        )
        if card is None:
            return None
        card = dict(card)
        as_of = card["as_of"]

        if not refresh:
            cached = await conn.fetchrow(
                """
                SELECT summary, model, generated_at FROM dhansetu.enterprise_summaries
                WHERE enterprise_id = $1 AND as_of = $2 AND lang = $3
                """,
                enterprise_id,
                as_of,
                lang,
            )
            if cached is not None:
                return {
                    "enterprise_id": enterprise_id,
                    "as_of": as_of,
                    "lang": lang,
                    "summary": cached["summary"],
                    "model": cached["model"],
                    "generated_at": cached["generated_at"],
                    "cached": True,
                }

        alert = await conn.fetchrow(
            """
            SELECT projected_shortfall, shortfall_week_of FROM dhansetu.v_alert_actions
            WHERE enterprise_id = $1 ORDER BY raised_at DESC LIMIT 1
            """,
            enterprise_id,
        )

    text = await _generate(card, dict(alert) if alert else None, lang)
    if text is None:
        return None

    async with pool.acquire() as conn:
        # ON CONFLICT because two requests for the same enterprise can race;
        # both generations are equally valid, so the first to land wins rather
        # than one of them erroring.
        row = await conn.fetchrow(
            """
            INSERT INTO dhansetu.enterprise_summaries
                (enterprise_id, as_of, lang, summary, model)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (enterprise_id, as_of, lang) DO UPDATE
                SET summary = EXCLUDED.summary,
                    model = EXCLUDED.model,
                    generated_at = now()
            RETURNING summary, model, generated_at
            """,
            enterprise_id,
            as_of,
            lang,
            text,
            SUMMARY_MODEL,
        )

    return {
        "enterprise_id": enterprise_id,
        "as_of": as_of,
        "lang": lang,
        "summary": row["summary"],
        "model": row["model"],
        "generated_at": row["generated_at"],
        "cached": False,
    }
