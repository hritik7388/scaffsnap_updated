import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

export const User = {
    SUPER_ADMIN: "SUPER ADMIN",
    SUB_ADMIN: "SUB ADMIN",
    TRADESMAN: "TRADESMAN",
    PROJECT_MANAGER: "PROJECT MANAGER",
    COMPETENT_PERSON: "COMPETENT PERSON",
}


// Use a Set for O(1) lookup
const publicRoutes = new Set([
    '/',
    '/health',
    '/api/v1/auth/register',
    '/api/v1/auth/login',
].map(route => route.toLowerCase()));


export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {

    if (publicRoutes.has(req.path.toLowerCase())) {
        return next();
    }

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(403).json({ message: "Authorization header missing" });
        }

        const token = authHeader.split(" ")[1];

        const decoded: any = jwt.verify(token, config.JWT_REFRESH_SECRET);

        if (!decoded?.sub) {
            return res.status(401).json({ message: "Invalid token" });
        }

        req.userId = Number(decoded.sub);
        req.userRole = decoded.role;
        req.token = token;

        next();

    } catch (error) {
        console.log("Auth middleware error:", error);
        return res.status(401).json({ message: "Unauthorized" });
    }
};

export const requireSubAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.userRole !== User.SUB_ADMIN) { return res.status(403).json({ message: 'Only SubAdmin can perform this action' }); } next();

}