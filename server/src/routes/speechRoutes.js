// routes/speechRoutes.js
import express from "express";
import multer from "multer";
import { handleConversation } from "../controllers/speechController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/conversation", upload.single("audio"), handleConversation);

export default router;
