from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.llm import extract_action_items

router = APIRouter()


class TranscriptRequest(BaseModel):
    transcript: str = Field(min_length=10)


@router.post("/api/extract-action-items")
async def extract(req: TranscriptRequest):
    try:
        items = extract_action_items(req.transcript)
        return {"action_items": items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
