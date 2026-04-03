import { Router } from "express";
import { liveController } from "../controllers/liveController";

const router = Router();

// POST /api/live/create
router.post("/create", liveController.createSession);

export default router;
