# tts_service.py
from fastapi import FastAPI, Form
from fastapi.responses import FileResponse
from gtts import gTTS
import tempfile
import os

app = FastAPI()

@app.post("/tts")
async def tts(text: str = Form(...)):
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
    tts = gTTS(text=text, lang="en")
    tts.save(tmp.name)
    tmp.close()
    response = FileResponse(tmp.name, media_type="audio/mpeg", filename="speech.mp3")

    @response.call_on_close
    def cleanup():
        os.remove(tmp.name)

    return response
