import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

// 🎙️ 1. Speech-to-Text (Whisper)
export const speechToText = async (req, res) => {
  const filePath = req.file?.path;

  if (!filePath) {
    return res.status(400).json({ error: "No audio file uploaded" });
  }

  try {
    // Prepare form data for Python service
    const formData = new FormData();
    formData.append("audio", fs.createReadStream(filePath));

    // Send to Python FastAPI service (Whisper)
    const response = await axios.post("http://localhost:5001/stt", formData, {
      headers: formData.getHeaders(),
    });

    // Return transcribed text to frontend
    res.json({ text: response.data.text });
  } catch (error) {
    console.error("Speech-to-text error:", error.message);
    res.status(500).json({ error: "Failed to transcribe audio" });
  } finally {
    // 🧹 Delete uploaded audio file to free disk space
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (cleanupErr) {
      console.error("Failed to delete temp file:", cleanupErr.message);
    }
  }
};

// 🔊 2. Text-to-Speech (TTS)
export const textToSpeech = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const formData = new FormData();
    formData.append("text", text);

    // Call Python TTS microservice
    const response = await axios.post("http://localhost:5002/tts", formData, {
      headers: formData.getHeaders(),
      responseType: "stream", // to handle binary audio data
    });

    // Save the audio response stream
    const filePath = path.join("uploads", `tts_${Date.now()}.mp3`);
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    writer.on("finish", () => {
      res.json({ audioUrl: `/${filePath}` });
    });

    // 🧩 Handle file write errors properly
    writer.on("error", (err) => {
      console.error("File write error:", err);
      res.status(500).json({ error: "Failed to save audio file" });
    });
  } catch (error) {
    console.error("TTS error:", error.message);
    res.status(500).json({ error: "Failed to generate speech" });
  }
};

// ✍️ 3. Grammar Correction
export const correctGrammar = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const formData = new FormData();
    formData.append("text", text);

    const response = await axios.post("http://localhost:5003/grammar", formData, {
      headers: formData.getHeaders(),
    });

    res.json({ corrected_text: response.data.corrected_text });
  } catch (error) {
    console.error("Grammar correction error:", error.message);
    res.status(500).json({ error: "Failed to correct grammar" });
  }
};
