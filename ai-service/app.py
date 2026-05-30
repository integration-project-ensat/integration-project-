from typing import List

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from model import CareerRecommendationModel


app = FastAPI(title="PheraCore AI Career Recommendation Service", version="1.0.0")
model = CareerRecommendationModel()


class CareerRecommendationRequest(BaseModel):
    targetCareer: str = Field(..., examples=["DevOps"])
    skills: List[str] = []
    projects: List[str] = []
    technologies: List[str] = []
    badges: List[str] = []
    stages: List[str] = []


@app.get("/health")
def health():
    return {"success": True, "message": "AI service is running"}


@app.post("/recommend")
def recommend(payload: CareerRecommendationRequest):
    try:
        return model.recommend(payload.model_dump())
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail="AI recommendation failed") from error
