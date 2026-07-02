from fastapi import APIRouter
from app.schemas.ai_schemas import RouteRequest, RouteResponse
from app.database import db
import uuid
import random

router = APIRouter(prefix="/api/v1", tags=["Routing"])

@router.post("/route", response_model=RouteResponse)
async def calculate_best_route(request: RouteRequest):
    """
    Mock AI endpoint to find the optimal partner (tow truck / mechanic) 
    based on coordinates and issue type.
    """
    
    # In a real scenario, we would:
    # 1. Query Supabase for active partners near the lat/lon.
    # 2. Use a routing API (Google Maps, OSRM) to calculate distances.
    # 3. Apply ML to predict availability and ETA.

    mock_partner_id = str(uuid.uuid4())
    eta = random.randint(10, 45)
    dist = round(random.uniform(2.5, 15.0), 1)

    return RouteResponse(
        route_id=str(uuid.uuid4()),
        assigned_partner_id=mock_partner_id,
        estimated_arrival_minutes=eta,
        distance_km=dist
    )
