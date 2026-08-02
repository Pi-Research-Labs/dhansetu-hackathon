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


async def authenticate_officer(phone_number: str, password: str) -> dict | None:
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT a.account_id, a.officer_id, a.password_hash, o.officer_name, o.district_id
            FROM dhansetu.officer_accounts a
            JOIN dhansetu.officers o USING (officer_id)
            WHERE a.phone_number = $1
            """,
            phone_number,
        )
        if row is None or not verify_password(password, row["password_hash"]):
            return None

        await conn.execute(
            "UPDATE dhansetu.officer_accounts SET last_login_at = now() WHERE account_id = $1",
            row["account_id"],
        )
        return {
            "officer_id": row["officer_id"],
            "officer_name": row["officer_name"],
            "district_id": row["district_id"],
        }


async def get_merchant_identity(enterprise_id: str) -> dict | None:
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT enterprise_id, proprietor_name FROM dhansetu.v_enterprises_safe WHERE enterprise_id = $1",
            enterprise_id,
        )
        return dict(row) if row else None


async def get_officer_identity(officer_id: str) -> dict | None:
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT officer_id, officer_name, district_id FROM dhansetu.officers WHERE officer_id = $1",
            officer_id,
        )
        return dict(row) if row else None
