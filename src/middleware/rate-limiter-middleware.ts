import rateLimit from "express-rate-limit"

export const rateLimiterMiddleware = (reqTimeLimit: number, reqMaxCount: number) => rateLimit(
    {
        windowMs: reqTimeLimit * 1000,
        max: reqMaxCount,
        standardHeaders: true,
        legacyHeaders: false
    }
)