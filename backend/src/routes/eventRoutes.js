import { Router } from "express";
import { createEvent } from "../controllers/eventController.js";

const router = Router();

router.post("/", createEvent);

export default router;
