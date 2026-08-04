# DHANSETU — KPIs, in plain language, for the people who don't need to read `KPIS.md`

`KPIS.md` is the technical reference (which database column, which API route).
This is the same material translated for a board/investor/partner-bank
conversation: **what does each number mean for the business, and why should
anyone in that room care.** Every figure below is real and traceable back to
`STORY.md` / `KPIS.md` — nothing here is rounded up for effect.

## The one-line pitch these KPIs exist to support

> **A rural micro-business can be financially healthy on paper and still
> collapse in a predictable month — and by the time a bank's paperwork
> catches that, it's too late to help. DHANSETU sees it early enough to
> answer with money, not a rejection.**

Every KPI below is evidence for one piece of that sentence: that we can
*see* the problem early, that we can *act* on it efficiently, or that the
first two claims are *provably true* and not just a good story.

---

## 1. "Can we see risk before it becomes a loss?" — the merchant-side numbers

| What it's called internally | What it means in plain terms | Why a C-level audience should care |
|---|---|---|
| Risk tier (GREEN/AMBER/RED) | A traffic light per business, updated monthly | The simplest possible answer to "how many of our borrowers are in trouble right now" |
| Net buffer days | How many days a business can survive on the cash it actually has, after subtracting what it owes moneylenders | This is the number that catches people a bank's own systems miss. Lakshmiben, our lead demo case, looks fine on paper (12 days of buffer) but is actually **57 days underwater** once informal debt is counted. A credit system that can't see that isn't seeing the real risk. |
| Margin gap | The gap between what a business earns and what it costs to run, over the last 3 months | This is *why* someone is at risk, not just *that* they are — turns a red flag into a diagnosis |
| Cash flow forecast (with a range, not a single number) | Where a business's bank balance is headed over the next 1–6 months, shown as a likely range rather than a false-precision guess | Boards trust ranges more than point estimates once they know the range is honest — ours is right about 4 times out of 5 for an 80% confidence band, and we say so |
| Projected shortfall + deadline | The rupee amount a business will run short by, and the week it happens | Turns "this business is risky" into "this business needs ₹31,000 by August 29" — a number a credit committee can actually act on |
| **Credit headroom / bridge loan capacity** | How much money we could safely lend this business *right now*, calculated independently of the risk tier | **This is the single most important number in the whole product.** It's what turns a monitoring tool into a lending product. A business in trouble usually still has *some* safe lending capacity — ours finds it instead of defaulting to "no." |
| Receivables health (the "udhaar book") | How much money customers owe a business, and how much of that is never coming back | Catches a second, invisible way businesses fail: one of our demo cases looks perfectly healthy on the main risk score while quietly writing off 13% of what she's owed |
| Digital payment mix | What share of a business's money moves through UPI vs. cash | A leading indicator — a business sliding back toward cash-only is often a business starting to hide financial trouble |
| "We're not fully confident about this one" flag | The system tells you when its own answer is less reliable, instead of guessing confidently and being wrong | This is a trust feature, not a weakness — the businesses hardest to see (shared devices, phone-call-only, low literacy) are exactly the ones the product exists to serve, and pretending otherwise would make the tool worse for exactly the customers who need it most |
| "This information is never shared with credit bureaus" | A structural promise, not a policy memo — it's a setting in the system we can point to, not just a claim | A bad season doesn't permanently damage someone's ability to borrow — this is a customer-trust and retention feature as much as a compliance one |

**The business translation of this whole section:** most credit systems ask
"how risky is this person" and stop there. Ours asks that *and* "how much
can we safely lend them anyway" — which is the difference between a
monitoring cost center and a lending revenue engine. Across our full
demo book, the amount we could safely lend explains almost none of its
variation from the risk tier alone (about 8%) — meaning this isn't the
tier wearing a different hat, it's a genuinely separate, useful number.

---

## 2. "Can our field force act on this efficiently?" — the officer-side numbers

| What it's called internally | What it means in plain terms | Why it matters to the business |
|---|---|---|
| Ranked worklist | Instead of reviewing every business in his territory, a field officer sees only the ones that actually need a visit, ranked by urgency | This is the difference between an officer being useful and an officer drowning — turns "42 businesses to check" into a short, prioritized list |
| "Rupees at risk" ranking | The list is sorted by money at stake, not by an abstract score | Officers and their managers can answer "why this business first" in one sentence |
| District-wide shock detection | When one event (a flood, a price crash) hits a whole district, the system recognizes it as *one* event instead of showing the officer 14 separate identical-looking alerts | Prevents an officer from wasting a day treating a single regional event as 14 unrelated problems — this is an efficiency multiplier at scale, not just a UI nicety |
| Confirmation rate ("is this worth the fuel?") | Of the alerts officers actually acted on, what percentage turned out to be real problems | This is the system grading its own homework in public. Right now, confirmed-real-problem rates are 56% for medium-risk alerts and 73% for high-risk ones — both good enough to justify sending someone, and both numbers we're willing to show rather than hide |
| Early-warning lead time | How many days before a missed payment the system flagged the problem | Median of **121 days** of runway to intervene — but on only 9 measured cases so far, which we say out loud rather than let anyone assume it's a bigger, more settled number than it is |
| Explanation accuracy | When the system says "this business is stressed because X," how often is X actually the real cause | The true cause is the system's #1 guess about a third of the time, and in its top 3 guesses about 73% of the time — meaning the advice an officer gives a merchant is usually pointed at the right problem, not a plausible-sounding wrong one |

**The business translation of this whole section:** the same number of
field officers can responsibly cover more territory, spend less time on
false alarms, and give advice that's actually pointed at the right
problem — this is a unit-economics argument (cost to serve per merchant
goes down) as much as a customer-outcome one.

---

## 3. "Is any of this provably true?" — the numbers that exist to be checked, not believed

A skeptical investor, regulator, or bank partner's first question is
usually "how do I know this isn't just a good demo." This is the section
built specifically to survive that question — every number below is a live
query against real, held-out data, not a slide claim:

- **Forecast accuracy**: how far off our cash-flow predictions actually
  were, and what fraction of outcomes landed inside our stated confidence
  range — checked separately for each time horizon (30 days out through
  180 days out).
- **Headroom independence**: proof that the "how much can we lend" number
  isn't secretly just the risk tier relabeled.
- **Data provenance**: for every business, how much of its financial
  picture comes from real captured transactions vs. the synthetic data
  used to build and demo the system before rollout — an honest rollout
  progress meter, not a claim that everything is real yet.

**The business translation:** we built the audit trail before anyone asked
for it. That's a materially different pitch to a bank partner or a
regulator than "trust us."

---

## How this changes the pitch, in one paragraph

Without these KPIs, the pitch is "we can tell you which of your borrowers
are risky" — a monitoring tool, sold as a cost. With them, the pitch
becomes: *we can tell you which borrowers are risky, exactly why, how much
you can still safely lend them anyway, which of your field staff should
act on it today, and we can prove all of the above against real held-out
outcomes.* The first version is a compliance expense. The second is a
lending origination engine with its own evidence base — which is a
fundamentally different, and fundamentally more fundable, business.

## What we'd tell this same audience honestly, unprompted

A board or investor will eventually ask the hard questions anyway, so:
lead-time and missed-repayment statistics above are measured on small
sample sizes (single digits to low tens of episodes) and will firm up as
the book scales — this is the single highest-value thing more scale buys
us, more than any modeling improvement. Full detail: `KPIS.md`'s "Gaps
worth naming" section and `database/data/dhansetu_v1_2/SLIDE_CORRECTIONS.md`.
