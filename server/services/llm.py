import json
import re

from openai import OpenAI

from config import settings

client = OpenAI(
    api_key=settings.groq_api_key,
    base_url=settings.groq_base_url,
)

ACTION_ITEMS_PROMPT = (
    "You are an expert meeting assistant. "
    "Extract action items from the given transcript.\n"
    "\n"
    "For each action item, identify:\n"
    "1. The concrete task that needs to be done\n"
    "2. Who is assigned to do it"
    " (if mentioned \u2014 set to null if unclear)\n"
    "\n"
    "You MUST respond with ONLY a valid JSON object. "
    "Do NOT include any text, explanation, markdown formatting,"
    " or code blocks before or after the JSON.\n"
    "\n"
    'Expected JSON format: {"action_items":'
    ' [{"text": "the task description",'
    ' "assignee": "person name or null"}]}\n'
    "\n"
    "Be thorough \u2014 capture every actionable item mentioned."
    " If no action items are found, return an empty list."
    " Again: respond ONLY with the raw JSON object, nothing else."
)

SUMMARIZE_PROMPT = (
    "You are an expert meeting summarizer. "
    "Analyse the given meeting transcript and produce a clear,"
    " structured summary.\n"
    "\n"
    "Extract the following:\n"
    "1. summary: A concise 2-4 sentence overview of the meeting"
    " covering what was discussed and the outcome.\n"
    "2. keyPoints: A list of the most important points,"
    " decisions, or topics raised.\n"
    "3. decisions: A list of concrete decisions that were made"
    " during the meeting.\n"
    "\n"
    "You MUST respond with ONLY a valid JSON object. "
    "Do NOT include any text, explanation, markdown formatting,"
    " or code blocks before or after the JSON.\n"
    "\n"
    'Expected JSON format: {"summary": "the overall summary text",'
    ' "keyPoints": ["point 1", "point 2", ...],'
    ' "decisions": ["decision 1", "decision 2", ...]}\n'
    "\n"
    "If no key points or decisions are found,"
    " return empty lists for those fields."
    " Again: respond ONLY with the raw JSON object, nothing else."
)

MODEL = "llama-3.3-70b-versatile"


def _parse_json(raw: str) -> dict:
    raw = raw.strip()

    json_match = re.search(r"\{.*\}", raw, re.DOTALL)
    if json_match:
        raw = json_match.group()

    return json.loads(raw)


def extract_action_items(transcript: str) -> list[dict]:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": ACTION_ITEMS_PROMPT},
            {"role": "user", "content": transcript},
        ],
        temperature=0.1,
    )

    raw = response.choices[0].message.content
    if not raw:
        raise ValueError("LLM returned empty response")

    parsed = _parse_json(raw)
    items = parsed.get("action_items", [])
    if not isinstance(items, list):
        raise ValueError("Unexpected response format from LLM")

    return items


def summarise(transcript: str) -> dict:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SUMMARIZE_PROMPT},
            {"role": "user", "content": transcript},
        ],
        temperature=0.1,
    )

    raw = response.choices[0].message.content
    if not raw:
        raise ValueError("LLM returned empty response")

    parsed = _parse_json(raw)

    result = {
        "summary": parsed.get("summary", ""),
        "keyPoints": parsed.get("keyPoints", []),
        "decisions": parsed.get("decisions", []),
    }

    if not result["summary"]:
        raise ValueError("LLM response missing summary field")

    return result


RAG_SEARCH_PROMPT = (
    "You are a meeting knowledge assistant. "
    "Answer the user's question using ONLY the provided meeting transcripts."
    " Cite specific details from the context.\n"
    "\n"
    "If the provided context does not contain enough information to answer"
    " the question, say so clearly — do not make up facts.\n"
    "\n"
    "You MUST respond with ONLY a valid JSON object. "
    "Do NOT include any text, explanation, markdown formatting,"
    " or code blocks before or after the JSON.\n"
    "\n"
    'Expected JSON format: {"answer": "the answer text",'
    ' "relevantExcerpts": ["excerpt 1", "excerpt 2", ...],'
    ' "noAnswer": false}\n'
    "\n"
    "If the context is insufficient, set noAnswer to true."
    " Again: respond ONLY with the raw JSON object, nothing else."
)


def rag_search(query: str, context_documents: list[str]) -> dict:
    context_text = "\n\n---\n\n".join(
        f"[Document {i + 1}]\n{doc}"
        for i, doc in enumerate(context_documents)
    )

    user_message = (
        f"User question: {query}\n\n"
        f"Relevant meeting excerpts:\n\n{context_text}"
    )

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": RAG_SEARCH_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0.1,
    )

    raw = response.choices[0].message.content
    if not raw:
        raise ValueError("LLM returned empty response")

    parsed = _parse_json(raw)

    return {
        "answer": parsed.get("answer", ""),
        "relevantExcerpts": parsed.get("relevantExcerpts", []),
        "noAnswer": parsed.get("noAnswer", False),
    }
