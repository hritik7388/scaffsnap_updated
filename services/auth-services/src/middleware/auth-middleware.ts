

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

export const User = {
    SUPER_ADMIN: "SUPER ADMIN",
    SUB_ADMIN: "SUB ADMIN",
    TRADESMAN: "TRADESMAN",
    PROJECT_MANAGER: "PROJECT MANAGER",
    COMPETENT_PERSON: "COMPETENT PERSON",
};

const publicRoutes = new Set([
    "/",
    "/health",
    "/api/v1/auth/register",
    "/api/v1/auth/login",
].map(r => r.toLowerCase()));

export const verifyToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (publicRoutes.has(req.path.toLowerCase())) {
            return next();
        }

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(403).json({ message: "Authorization header missing" });
        }

        const token = authHeader.split(" ")[1];

        // 🔥 IMPORTANT: use ACCESS secret (NOT refresh)
        const decoded: any = jwt.verify(token, config.JWT_REFRESH_SECRET);

        console.log("decoded ---------------", decoded);

        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" });
        }

        req.userId = decoded.sub;
        req.userRole = decoded.role;
        req.token = token;

        next();
    } catch (error) {
        console.log("Auth middleware error:", error);
        return res.status(401).json({ message: "Unauthorized" });
    }
};

// export const requireSubAdmin = (req: Request, res: Response, next: NextFunction) => {
//     if (req.userRole !== User.SUB_ADMIN) { return res.status(403).json({ message: 'Only SubAdmin can perform this action' }); } next();

// }