import { ApiError } from "@/utils/ApiError.ts";
import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let statusCode = 500;
    let message = "Internal Server Error";

    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err.statusCode) {
        statusCode = err.statusCode;
        message = err.message;
    }

    res.status(statusCode).json({
        success: false,
        message,
    });
};
