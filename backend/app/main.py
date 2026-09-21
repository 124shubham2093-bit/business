import app.memory.cognee_patch
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import investigations, health, predictions, analytics
from app.config.settings import settings

app = FastAPI(
    title="InvestIQ API",
    description="Python backend running Cognee semantic memory and agent analyzers.",
    version="1.0.0"
)

# Enable CORS for React frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register endpoints
app.include_router(health.router, tags=["Health Check"])
app.include_router(investigations.router, prefix="/api", tags=["Investigations"])
app.include_router(predictions.router, prefix="/api", tags=["Predictions"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])

if __name__ == "__main__":
    import uvicorn
    # Boot server using configs
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
