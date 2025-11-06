from fastapi import FastAPI, Form
from gramformer import Gramformer
from transformers import pipeline
import torch

app = FastAPI()

# Initialize Gramformer (grammar correction only)
gf = Gramformer(models=1, use_gpu=torch.cuda.is_available())

# Initialize T5 fallback model
t5_corrector = pipeline("text2text-generation", model="flexudy/t5-base-multi-sentence-doctor")

def correct_with_gramformer(text: str) -> str:
    try:
        corrected = list(gf.correct(text))
        return corrected[0] if corrected else text
    except Exception as e:
        print(f"Gramformer error: {e}")
        return text

def correct_with_t5(text: str) -> str:
    try:
        result = t5_corrector(text)
        return result[0]['generated_text']
    except Exception as e:
        print(f"T5 error: {e}")
        return text

@app.post("/grammar")
async def grammar(text: str = Form(...)):
    # First try Gramformer
    corrected = correct_with_gramformer(text)

    # If no change or fallback needed, try T5
    if corrected.strip().lower() == text.strip().lower():
        corrected = correct_with_t5(text)

    return {"corrected_text": corrected}
