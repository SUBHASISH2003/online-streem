import express from "express";
import { createMeeting, joinMeeting, getMeetings } from "../controllers/metting.controller.js";
import authMiddleware from "../middleware/auth.middleware.js"; // Protect routes

const router = express.Router();

router.post("/create", authMiddleware, createMeeting);
router.post("/join/:meetingId", authMiddleware, joinMeeting);
router.get("/my-meetings", authMiddleware, getMeetings);

export default router;
