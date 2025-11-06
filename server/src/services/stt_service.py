import os
import tempfile
from fastapi import FastAPI, File, UploadFile
import whisper

app = FastAPI()
model = whisper.load_model("base")

@app.post("/stt")
async def transcribe(audio: UploadFile = File(...)):
    # Create a temporary file (not auto-deleted)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(await audio.read())
        tmp_path = tmp.name

    # Now ffmpeg can access it safely
    result = model.transcribe(tmp_path)

    # Clean up manually
    os.remove(tmp_path)
    return {"text": result["text"]}
