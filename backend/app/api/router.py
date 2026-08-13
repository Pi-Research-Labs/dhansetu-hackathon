from fastapi import APIRouter

from app.api.routes import (
    auth,
    enterprise,
    evidence,
    health,
    maps,
    market,
    outcome,
    risk,
    task,
    voice,
    weather,
    worklist,
)

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(worklist.router)
api_router.include_router(enterprise.router)
api_router.include_router(task.router)
api_router.include_router(outcome.router)
api_router.include_router(risk.router)
api_router.include_router(voice.router)
api_router.include_router(maps.router)
api_router.include_router(evidence.router)
api_router.include_router(market.router)
api_router.include_router(weather.router)

