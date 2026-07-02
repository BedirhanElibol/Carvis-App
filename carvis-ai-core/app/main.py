from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import diagnose, route

app = FastAPI(
    title="Carvis AI Core API",
    description="AI Diagnostics and Smart Routing Microservice for Carvis",
    version="1.0.0"
)

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
