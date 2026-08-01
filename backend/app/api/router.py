from fastapi import APIRouter

from app.api.routes import auth, enterprise, health, outcome, worklist

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(worklist.router)
api_router.include_router(enterprise.router)
api_router.include_router(outcome.router)
