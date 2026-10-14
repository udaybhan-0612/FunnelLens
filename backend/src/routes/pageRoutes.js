import { Router } from "express";
import {
  getPages,
  getPageClicks
} from "../controllers/pageController.js";

const router = Router();

router.get("/", getPages);
router.get("/clicks", getPageClicks);

export default router;
