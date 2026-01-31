import { currentUser, signIn, signOut, updateUser } from "@/controllers/user.controller.ts";
import { verifyJWT } from "@/middlewares/auth.middleware.ts";
import { Router } from "express";

const router = Router();

router.route("/signin").post(signIn);
router.route("/profile").get(verifyJWT, currentUser);
router.route("/update").put(verifyJWT, updateUser);
router.route("/signout").delete(verifyJWT, signOut);

export default router;