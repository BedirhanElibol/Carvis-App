from fastapi import APIRouter, HTTPException
from app.schemas.ai_schemas import DiagnosisRequest, DiagnosisResponse
from app.database import db
import uuid
import random
from functools import lru_cache

router = APIRouter(prefix="/api/v1", tags=["Diagnostics"])

@lru_cache(maxsize=1000)
def analyze_issue(description: str):
    # Mock AI Logic
    issues = [
        {"issue": "Akü Bitmesi", "severity": "Medium", "action": "Takviye Aracı Gönder"},
        {"issue": "Motor Harareti", "severity": "High", "action": "Çekici Yönlendir"},
        {"issue": "Lastik Patlaması", "severity": "Low", "action": "Mobil Lastikçi Gönder"},
        {"issue": "Şanzıman Arızası", "severity": "High", "action": "Çekici Yönlendir"}
    ]
    prediction = random.choice(issues)
    confidence = round(random.uniform(0.75, 0.99), 2)
    return prediction, confidence

@router.post("/diagnose", response_model=DiagnosisResponse)
async def diagnose_vehicle(request: DiagnosisRequest):
    """
    Mock AI endpoint that analyzes the vehicle issue based on description and image.
    In the future, this can be integrated with OpenAI GPT-4 Vision.
    """
    
    prediction, confidence = analyze_issue(request.description)
    diag_id = str(uuid.uuid4())

    response_data = DiagnosisResponse(
        diagnosis_id=diag_id,
        predicted_issue=prediction["issue"],
        confidence_score=confidence,
        recommended_action=prediction["action"],
        severity=prediction["severity"]
    )

    # Save to Supabase
    try:
        data = {
            "id": diag_id,
            "user_id": request.user_id,
            "description": request.description,
            "predicted_issue": prediction["issue"],
            "confidence_score": confidence,
            "recommended_action": prediction["action"],
            "severity": prediction["severity"]
        }
        # Assuming request.image_url is available
        if request.image_url:
            data["images"] = [request.image_url]

        db.table("ai_diagnostics").insert(data).execute()
        print(f"✅ Successfully inserted AI diagnosis {diag_id} into Supabase")
    except Exception as e:
        print(f"❌ Supabase error: {e}")

    return response_data
