import { Request, Response } from "express";
import { AuthService } from "../services/auth-services";

export class AuthController {

    private readonly authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    async register(req: Request, res: Response) {
        try {
            const result = await this.authService.register(req.body);


            return res.status(201).json({
                statusCode: 201,
                message: result.message,
                data: this.serialize(result.data)
            });

        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                message: error.message || "Internal Server Error"
            });
        }
    }

    async login(req: Request, res: Response) {
        try {

            const result = await this.authService.login(req.body);

            return res.status(200).json({
                statusCode: 200,
                message: result.message,
                data: this.serialize(result.data)
            });

        } catch (error: any) {

            return res.status(error.statusCode || 500).json({
                statusCode: error.statusCode || 500,
                message: error.message || "Internal Server Error"
            });
        }
    }
    async logout(req: Request, res: Response) {
        try {
            const userId = Number(req.userId);
            const { deviceToken } = req.body;


            const result = await this.authService.logout(userId, { deviceToken });

            return res.status(200).json({
                statusCode: 200,
                message: result.message,
                data: result.data
            });

        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                message: error.message || "Internal Server Error"
            });
        }
    }



    // 🔥 SAFE BIGINT FIX (LOCAL)
    private serialize(data: any) {
        return JSON.parse(
            JSON.stringify(data, (_, value) =>
                typeof value === "bigint" ? Number(value) : value
            )
        );
    }
}