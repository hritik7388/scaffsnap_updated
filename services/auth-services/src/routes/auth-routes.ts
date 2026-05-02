import { Router } from "express";
import { AuthController } from "../controller/auth-controller";

const router = Router();

const controller = new AuthController();

// 🔥 IMPORTANT: bind this
router.post(
    "/register",
    controller.register.bind(controller)
);

router.post(
    "/login",
    controller.login.bind(controller)
);


export default router;