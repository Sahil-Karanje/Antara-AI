import axios from "axios";
import fs from "fs";
import FormData from "form-data";

export const handleConversation = async (req, res) => {
  const audioPath = req.file?.path;

  if (!audioPath) {
    return res.status(400).json({ error: "No audio file uploaded" });
  }

  try {
    // 1️⃣ --- SPEECH TO TEXT (Send audio to FastAPI STT service) ---
    const sttForm = new FormData();
    sttForm.append("audio", fs.createReadStream(audioPath)); // match FastAPI field name

    const sttRes = await axios.post("http://localhost:5001/stt", sttForm, {
      headers: sttForm.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const userText = sttRes.data.text?.trim();
    if (!userText)
      throw new Error("Speech-to-text failed or returned empty text");

    // 2️⃣ --- GRAMMAR CORRECTION (Send as form-data, not JSON) ---
    const grammarForm = new FormData();
    grammarForm.append("text", userText);

    const grammarRes = await axios.post(
      "http://localhost:5002/grammar",
      grammarForm,
      {
        headers: grammarForm.getHeaders(),
      }
    );

    const correctedText = grammarRes.data.ai_reply;

    // 3️⃣ --- GENERATE AI REPLY ---
    const replyText = `${correctedText}`;

    // 4️⃣ --- TEXT TO SPEECH (Send as form-data, not JSON) ---
    const ttsForm = new FormData();
    ttsForm.append("text", replyText);

    const ttsRes = await axios.post("http://localhost:5003/tts", ttsForm, {
      headers: ttsForm.getHeaders(),
      responseType: "arraybuffer", // we expect a binary audio file
    });

    // Save TTS audio temporarily
    const ttsFilePath = `uploads/reply_${Date.now()}.mp3`;
    fs.writeFileSync(ttsFilePath, ttsRes.data);

    // 5️⃣ --- FINAL RESPONSE ---
    res.json({
      replyText: replyText,
      replyAudioUrl: `http://localhost:5000/${ttsFilePath}`, // or return as base64 if you prefer
    });
  } catch (error) {
    console.error("❌ Conversation pipeline failed:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error(error.message);
    }

    res.status(500).json({
      error: "Failed to process conversation",
      details: error.response?.data || error.message,
    });
  } finally {
    // Cleanup uploaded user audio
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
  }
};
