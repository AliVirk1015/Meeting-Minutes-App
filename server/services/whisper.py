from openai import OpenAI

from config import settings

client = OpenAI(
    api_key=settings.groq_api_key,
    base_url=settings.groq_base_url,
)


def transcribe_audio(file_path: str) -> str:
    with open(file_path, "rb") as audio_file:
        transcript = client.audio.transcriptions.create(
            model="whisper-large-v3",
            file=audio_file,
        )
    return transcript.text
