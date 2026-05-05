import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile

from config import settings
from services.whisper import transcribe_audio

router = APIRouter()
upload_dir = Path(settings.upload_dir)
max_bytes = settings.max_file_size_mb * 1024 * 1024


@router.post("/api/transcribe")
async def transcribe(audio: UploadFile):
    if not audio:
        raise HTTPException(status_code=400, detail="No audio file provided")

    if not audio.content_type or not audio.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File must be an audio file")

    ext = Path(audio.filename or "audio").suffix or ".webm"
    file_path = upload_dir / f"{uuid.uuid4()}{ext}"

    size = 0
    with file_path.open("wb") as f:
        while chunk := await audio.read(8192):
            size += len(chunk)
            if size > max_bytes:
                file_path.unlink(missing_ok=True)
                raise HTTPException(
                    status_code=413,
                    detail=(
                        f"File too large ({size / 1024 / 1024:.1f} MB)."
                        f" Maximum size is {settings.max_file_size_mb} MB."
                    ),
                )
            f.write(chunk)
        f.flush()

    try:
        text = transcribe_audio(str(file_path))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        file_path.unlink(missing_ok=True)

    return {"text": text}
