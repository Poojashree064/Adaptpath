from fastapi import APIRouter
from api.diagnostic_api import router as diagnostic_router
from api.tutor_api import router as tutor_router

api_router = APIRouter()

api_router.include_router(diagnostic_router)
api_router.include_router(tutor_router)
