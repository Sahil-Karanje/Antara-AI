// controllers/speechController.js
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

// Function called when frontend uploads audio to /stt route
export const speechToText = async (req, res) => {
  try {
    const filePath = req.file.path; // Multer saved the uploaded audio file

    // Prepare form data for Python service
    const formData = new FormData();
    formData.append("audio", fs.createReadStream(filePath));

    // Send to Python FastAPI service (Whisper)
    const response = await axios.post("http://localhost:5001/stt", formData, {
      headers: formData.getHeaders(),
    });

    // Return the text result to frontend
    res.json({ text: response.data.text });
  } catch (error) {
    console.error("Speech-to-text error:", error.message);
    res.status(500).json({ error: "Failed to transcribe audio" });
  }
};
