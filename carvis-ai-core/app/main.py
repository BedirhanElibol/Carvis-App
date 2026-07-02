from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.routers import diagnose, route

app = FastAPI(
    title="Carvis AI Core API",
    description="AI Diagnostics and Smart Routing Microservice for Carvis",
    version="1.0.0"
)

limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(diagnose.router)
app.include_router(route.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "carvis-ai-core"}
