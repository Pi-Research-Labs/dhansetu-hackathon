from app.core.db import get_pool
from app.core.security import verify_password


async def authenticate_merchant(phone_number: str, password: str) -> dict | None:
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT a.account_id, a.enterprise_id, a.password_hash, e.proprietor_name
            FROM dhansetu.merchant_accounts a
            JOIN dhansetu.v_enterprises_safe e USING (enterprise_id)
            WHERE a.phone_number = $1
            """,
            phone_number,
        )
        if row is None or not verify_password(password, row["password_hash"]):
            return None

        await conn.execute(
            "UPDATE dhansetu.merchant_accounts SET last_login_at = now() WHERE account_id = $1",
            row["account_id"],
        )
        return {"enterprise_id": row["enterprise_id"], "proprietor_name": row["proprietor_name"]}
