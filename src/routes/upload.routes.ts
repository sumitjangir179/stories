import { generatePreSignedUrl } from "@/controllers/upload.controller.ts";
import { verifyJWT } from "@/middlewares/auth.middleware.ts";
import { Router } from "express";

const router = Router();

router.route("/presigned").post(verifyJWT, generatePreSignedUrl);

export default router;