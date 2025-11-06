// routes/speechRoutes.js
import express from "express";
import multer from "multer";
import { speechToText } from "../controllers/speechController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/stt", upload.single("audio"), speechToText);

export default router;
