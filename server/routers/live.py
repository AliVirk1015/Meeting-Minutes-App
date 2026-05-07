import asyncio
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from services.whisper import transcribe_bytes

router = APIRouter()

logger = logging.getLogger("uvicorn")

MIN_BYTES = 2000
FLUSH_INTERVAL = 6
MAX_BUFFER_BYTES = 360_000


@router.websocket("/ws/transcribe/{session_id}")
async def live_transcribe(websocket: WebSocket, session_id: str):
    await websocket.accept()
    logger.info("[live] Client connected: %s", session_id)

    buffer = bytearray()
    first_header = bytearray()
    header_saved = False
    previous_text = ""
    lock = asyncio.Lock()

    async def flush():
        nonlocal previous_text, header_saved
        async with lock:
            if len(buffer) < MIN_BYTES:
                return

            # Trim buffer if too large (keep last ~2 min)
            if len(buffer) > MAX_BUFFER_BYTES:
                overflow = len(buffer) - MAX_BUFFER_BYTES
                buffer[:] = buffer[overflow:]
                header_saved = False

            # Prepend header if missing (for chunks after first)
            payload = bytes(buffer)
            if first_header and not header_saved:
                payload = bytes(first_header) + payload
                header_saved = True

            try:
                text = transcribe_bytes(payload)
                delta = text
                if previous_text and text.startswith(previous_text):
                    delta = text[len(previous_text):]
                previous_text = text

                if delta.strip():
                    await websocket.send_json(
                        {
                            "text": delta,
                            "isFinal": False,
                            "sessionId": session_id,
                        }
                    )
                    logger.info(
                        "[live] Flushed %d bytes → +%d chars  (%s)",
                        len(payload),
                        len(delta),
                        session_id,
                    )
                buffer.clear()
                header_saved = False
            except Exception as exc:
                logger.error("[live] Whisper error: %s", exc)
                await websocket.send_json(
                    {
                        "error": "Transcription chunk failed — retrying",
                        "sessionId": session_id,
                    }
                )

    async def periodic_flush():
        while True:
            await asyncio.sleep(FLUSH_INTERVAL)
            try:
                await flush()
            except Exception:
                break

    flush_task = asyncio.create_task(periodic_flush())

    try:
        while True:
            message = await websocket.receive()
            if "bytes" in message:
                chunk = message["bytes"]
                async with lock:
                    if not first_header and chunk:
                        first_header[:] = chunk[:800]
                    buffer.extend(chunk)
            elif "text" in message:
                if message["text"] == '{"action":"stop"}':
                    logger.info("[live] Stop signal received: %s", session_id)
                    flush_task.cancel()
                    await flush()
                    break
    except WebSocketDisconnect:
        logger.info("[live] Client disconnected: %s", session_id)
        flush_task.cancel()
        await flush()
    except Exception:
        logger.exception("[live] Unexpected error: %s", session_id)
        flush_task.cancel()
