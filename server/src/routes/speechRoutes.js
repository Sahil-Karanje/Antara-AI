// routes/speechRoutes.js
import express from "express";
import multer from "multer";
import { correctGrammar, speechToText, textToSpeech } from "../controllers/speechController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/stt", upload.single("audio"), speechToText);
router.post("/tts", textToSpeech);
router.post("/grammar", correctGrammar);

export default router;
