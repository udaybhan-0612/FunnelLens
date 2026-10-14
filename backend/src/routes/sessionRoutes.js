import { Router } from "express";
import {
  getSessions,
  getSessionEvents
} from "../controllers/sessionController.js";

const router = Router();

router.get("/", getSessions);
router.get("/:sessionId/events", getSessionEvents);

export default router;
