from fastapi import FastAPI, File, UploadFile
import whisper

app = FastAPI()
model = whisper.load_model("base")

@app.post("/stt")
async def transcribe(audio: UploadFile = File(...)):
    audio_path = "temp.wav"
    with open(audio_path, "wb") as f:
        f.write(await audio.read())
    result = model.transcribe(audio_path)
    return {"text": result["text"]}
