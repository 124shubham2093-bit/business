from fastapi import APIRouter
from app.config.settings import settings

router = APIRouter()

@router.get("/health")
async def health_check():
    cognee_ok = False
    try:
        import cognee
        cognee_ok = True
    except ImportError:
        pass

    openai_ok = settings.OPENAI_API_KEY not in ["your-openai-api-key-here", "mock", ""]

    return {
        "status": "ok",
        "cognee": cognee_ok,
        "openai": openai_ok
    }
