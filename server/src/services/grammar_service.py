from fastapi import FastAPI, Form
import requests
import os
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

# ---------- Ollama settings ----------
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:4b")  # ✅ use gemma3:4b

# ---------- Use Ollama to generate smart replies ----------
def generate_reply_via_ollama(user_text: str, username: str) -> str:
    prompt = f"""
You are "Ava", a smart and conversational English tutor chatbot.
Your tone should be natural, helpful, and direct — like Alexa or Siri — unless the user seems frustrated or is making repeated mistakes, in which case you may gently encourage them.

User said: "{user_text}"

Instructions:
1. If the user asks a factual question (e.g. grammar, vocabulary), answer clearly and concisely.
2. If the user seems confused, discouraged, or makes multiple mistakes, offer brief encouragement.
3. If appropriate, ask a follow-up question to keep the conversation going (e.g. "Would you like to learn more past tenses, {username}?").
4. Keep replies short (1–2 sentences), natural, and conversational.
5. Use the user's name ({username}) when it feels natural.

Now write the reply:
"""

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "temperature": 0.7
    }

    try:
        r = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=90)
        r.raise_for_status()
        return r.json().get("response", "").strip()
    except Exception as e:
        print("Ollama generation error:", e)
        return f"The past tense of 'do' is 'did'. Would you like to learn more past tenses, {username}?"

# ---------- FastAPI endpoint ----------
@app.post("/grammar")
async def grammar(text: str = Form(...), username: str = Form("User")):
    reply = generate_reply_via_ollama(text, username)
    return {
        "ai_reply": reply
    }
