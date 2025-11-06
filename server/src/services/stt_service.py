import os
import tempfile
from fastapi import FastAPI, File, UploadFile
import whisper

app = FastAPI()
model = whisper.load_model("base")

@app.post("/stt")
async def transcribe(audio: UploadFile = File(...)):
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    try:
        tmp.write(await audio.read())
        tmp_path = tmp.name
        tmp.close()  # Close before ffmpeg uses it
        result = model.transcribe(tmp_path)
        return {"text": result["text"]}
    finally:
        os.remove(tmp_path)
