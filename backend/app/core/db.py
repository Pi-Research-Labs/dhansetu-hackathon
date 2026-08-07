import asyncpg

from app.core.config import settings

_pool: asyncpg.Pool | None = None


async def connect() -> None:
    global _pool
    try:
        _pool = await asyncpg.create_pool(settings.database_url, min_size=1, max_size=10, timeout=3.0)
    except Exception as e:
        print(f"⚠️  Database connection skipped ({e}). Operating with service fallbacks.")


async def disconnect() -> None:
    global _pool
    if _pool is not None:
        try:
            await _pool.close()
        except Exception:
            pass
        _pool = None


def get_pool() -> asyncpg.Pool:
    if _pool is None:
        raise RuntimeError("Database pool is not initialised")
    return _pool

