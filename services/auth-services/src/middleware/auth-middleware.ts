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


export const verifyToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (publicRoutes.has(req.path.toLowerCase())) {
        return next();
    }

    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(403).json({ message: 'Authorization header missing' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) return res.status(403).json({ message: 'Token missing' });
        const decoded: any = jwt.verify(token, config.JWT_REFRESH_SECRET);
        const redisKey = `auth:${decoded.id}:${token}`;
        // const redisToken = await redisClient.get(redisKey);
        // if (!redisToken) return res.status(401).json({ message: 'Unauthorized' });
        req.userId = decoded.sub;
        req.userRole = decoded.role;
        req.token = token;

        next();
    } catch (error: any) {
        console.log(`Exception while doing something: ${error}`);
        return res.status(401).json({ message: 'Unauthorized' });
    }


};

export const requireSubAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.userRole !== User.SUB_ADMIN) { return res.status(403).json({ message: 'Only SubAdmin can perform this action' }); } next();

}