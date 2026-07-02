from pydantic import BaseModel
from typing import Optional

class DiagnosisRequest(BaseModel):
    user_id: str
    image_url: Optional[str] = None
    description: str

class DiagnosisResponse(BaseModel):
    diagnosis_id: str
    predicted_issue: str
    confidence_score: float
    recommended_action: str
    severity: str

class RouteRequest(BaseModel):
    user_id: str
    latitude: float
    longitude: float
    vehicle_type: str
    issue_type: str

class RouteResponse(BaseModel):
    route_id: str
    assigned_partner_id: str
    estimated_arrival_minutes: int
    distance_km: float
