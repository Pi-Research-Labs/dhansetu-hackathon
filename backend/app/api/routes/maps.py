from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response

from app.core.deps import get_token_claims
from app.services.maps import MapsError, fetch_static_map, get_enterprise_location

router = APIRouter(tags=["maps"])


@router.get("/enterprise/{enterprise_id}/map-tile")
async def enterprise_map_tile(
    enterprise_id: str,
    zoom: int = Query(15, ge=1, le=20),
    size: str = Query("400x400", pattern=r"^\d+x\d+$"),
    claims: dict = Depends(get_token_claims),
) -> Response:
    if claims.get("role") == "merchant" and claims["sub"] != enterprise_id:
        raise HTTPException(status_code=403, detail="Cannot view another enterprise")

    location = await get_enterprise_location(enterprise_id)
    if location is None:
        raise HTTPException(status_code=404, detail="Enterprise not found")
    if location["lat"] is None or location["lon"] is None:
        raise HTTPException(status_code=404, detail="Enterprise has no recorded location")

    try:
        image_bytes = await fetch_static_map(location["lat"], location["lon"], zoom, size)
    except MapsError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return Response(content=image_bytes, media_type="image/png")
