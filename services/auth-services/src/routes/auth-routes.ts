import { Router } from "express";
import { AuthController } from "../controller/auth-controller";
import { verifyToken } from "../middleware/auth-middleware";

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

router.post(
    "/logout", verifyToken,
    controller.logout.bind(controller)
);


router.post("/forgot-password", controller.forgotPassword.bind(controller));


export default router;