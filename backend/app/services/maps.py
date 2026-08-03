"""Google Maps Static API proxy.

The key is restricted (GCP `payintelli` project) to the Static Maps API and
to this backend's VM IP — it's never sent to the frontend. This module
fetches the tile server-side and the route below streams the image bytes
back, so the frontend never needs the key at all.
"""

import httpx

from app.core.db import get_pool
from app.core.config import settings

STATIC_MAPS_URL = "https://maps.googleapis.com/maps/api/staticmap"
MAX_SIZE_PX = 640


class MapsError(Exception):
    pass


async def get_enterprise_location(enterprise_id: str) -> dict | None:
    """`enterprises.lat`/`lon` are NOT absolute coordinates — they're small
    degree offsets from the district centroid (`district_geo`), the same
    convention `v_officer_worklist.km_from_centre` relies on. Absolute
    position is district centroid + offset."""
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT e.enterprise_id, g.lat + e.lat AS lat, g.lon + e.lon AS lon
            FROM dhansetu.v_enterprises_safe e
            LEFT JOIN dhansetu.district_geo g ON g.district_id = e.district_id
            WHERE e.enterprise_id = $1
            """,
            enterprise_id,
        )
        return dict(row) if row else None


def _clamp_size(size: str) -> str:
    try:
        width, height = (int(part) for part in size.lower().split("x"))
    except (ValueError, AttributeError):
        return f"{MAX_SIZE_PX}x{MAX_SIZE_PX}"
    width = max(1, min(width, MAX_SIZE_PX))
    height = max(1, min(height, MAX_SIZE_PX))
    return f"{width}x{height}"


async def fetch_static_map(
    lat: float, lon: float, zoom: int = 15, size: str = "400x400"
) -> bytes:
    params = {
        "center": f"{lat},{lon}",
        "zoom": str(max(1, min(zoom, 20))),
        "size": _clamp_size(size),
        "markers": f"color:red|{lat},{lon}",
        "key": settings.google_maps_static_key,
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(STATIC_MAPS_URL, params=params)
        except httpx.HTTPError as exc:
            raise MapsError(f"Google Maps request failed: {exc}") from exc

    if response.status_code != 200:
        raise MapsError(f"Google Maps returned {response.status_code}: {response.text[:200]}")
    return response.content
