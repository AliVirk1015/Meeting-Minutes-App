from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services import llm

router = APIRouter(prefix="/api", tags=["search"])


class SearchRequest(BaseModel):
    query: str
    context: list[str] = []


class SearchResponse(BaseModel):
    answer: str = ""
    relevantExcerpts: list[str] = []
    noAnswer: bool = False


@router.post("/search", response_model=SearchResponse)
def search_endpoint(req: SearchRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Search query is required")

    if not req.context:
        return SearchResponse(
            answer="No meeting transcripts available to search.",
            noAnswer=True,
        )

    try:
        result = llm.rag_search(req.query.strip(), req.context)
        return SearchResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception:
        raise HTTPException(
            status_code=502, detail="LLM service returned an error"
        )
