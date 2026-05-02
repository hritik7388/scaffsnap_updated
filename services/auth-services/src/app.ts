import express from "express";
import subAdminRoutes from "./routes/auth-routes";
import { corsMiddleware } from "./middleware/cores-middleware";
import { reqLogger } from "./middleware/request-middleware";
import { errorHandler } from "./middleware/error-middleware";

const app = express();

// 🔥 core middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 cors
app.use(corsMiddleware);

// 🔥 request logger
app.use(reqLogger);

// 🔥 routes
app.use("/api/auth", subAdminRoutes);

// 🔍 health check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        service: "auth-service",
    });
});

// ❌ error handler MUST be last
app.use(errorHandler);

export default app;