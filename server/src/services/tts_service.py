from fastapi import FastAPI, Form
from fastapi.responses import FileResponse
from gtts import gTTS
import tempfile
import os
import asyncio

app = FastAPI()

@app.post("/tts")
async def tts(text: str = Form(...)):
    # Create a temporary file for the MP3
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
    tmp_path = tmp.name
    tmp.close()

    # Generate speech using gTTS
    tts = gTTS(text=text, lang="en")
    tts.save(tmp_path)

    # Instead of call_on_close, schedule async cleanup
    async def cleanup_file(path: str):
        # Wait a few seconds so the response is fully sent before deletion
        await asyncio.sleep(5)
        if os.path.exists(path):
            os.remove(path)

    # Start cleanup in the background
    asyncio.create_task(cleanup_file(tmp_path))

    # Return the file
    return FileResponse(tmp_path, media_type="audio/mpeg", filename="speech.mp3")
