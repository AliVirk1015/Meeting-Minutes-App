import json

from openai import OpenAI

from config import settings

client = OpenAI(
    api_key=settings.groq_api_key,
    base_url=settings.groq_base_url,
)

SYSTEM_PROMPT = (
    "You are an expert meeting assistant."
    " Extract action items from the given transcript.\n"
    "\n"
    "For each action item, identify:\n"
    "1. The concrete task that needs to be done\n"
    "2. Who is assigned to do it"
    " (if mentioned \u2014 set to null if unclear)\n"
    "\n"
    "Return ONLY valid JSON in this exact format:\n"
    '{"action_items":'
    ' [{"text": "the task description",'
    ' "assignee": "person name or null"}]}\n'
    "\n"
    "Be thorough \u2014 capture every actionable item mentioned."
    " If no action items are found, return an empty list."
    " Do NOT include any text outside the JSON object."
)


def extract_action_items(transcript: str) -> list[dict]:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": transcript},
        ],
        response_format={"type": "json_object"},
        temperature=0.1,
    )

    raw = response.choices[0].message.content
    if not raw:
        raise ValueError("LLM returned empty response")

    parsed = json.loads(raw)
    items = parsed.get("action_items", [])
    if not isinstance(items, list):
        raise ValueError("Unexpected response format from LLM")

    return items
