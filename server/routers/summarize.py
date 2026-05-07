from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services import llm

router = APIRouter(prefix="/api", tags=["summarize"])


class SummarizeRequest(BaseModel):
    transcript: str


class SummarizeResponse(BaseModel):
    summary: str
    keyPoints: list[str]
    decisions: list[str]


@router.post("/summarize", response_model=SummarizeResponse)
def summarize_endpoint(req: SummarizeRequest):
    if not req.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript is required")

    try:
        result = llm.summarise(req.transcript)
        return SummarizeResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception:
        raise HTTPException(
            status_code=502, detail="LLM service returned an error"
        )
