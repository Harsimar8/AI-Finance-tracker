import {ErrorRequestHandler } from "express";
import { Response } from "express";
import {z, ZodError} from "zod";
import {HTTPSTATUS} from "../config/http.config";
import { AppError } from "../utils/app-error";
import { ErrorCodeEnum } from "../enums/error-code.enum";

const formatZodError = (res: Response, error: z.ZodError) =>{
    const errors = error?.issues?.map((err) => ({
        field: err.path.join("."),
        message: err.message,
    }));
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "Validation failed",
        errors: errors,
        errorCode: ErrorCodeEnum.VALIDATION_ERROR,
    })
}
import { format } from "date-fns";
import { MulterError } from "multer";


const handleMulterError = (error: MulterError)=> {
    const message = {
        LIMIT_EXPECTED_FILE : "Invalid file field name. please use 'file'",
        LIMIT_FILE_SIZE: "File size exceeds the limit",
        LIMIT_FILE_COUNT: "Too many files uploaded",
        default: "File upload error",
    };

    return {
        status:HTTPSTATUS.BAD_REQUEST,
        message: message[error.code as keyof typeof message] ||
        message.default,
        error: error.message,
    };
};
export const errorHandler: ErrorRequestHandler = (
    error,
    req,
    res,
    next
): any => {
    console.log("Error occurred on PATH" , req.path, "Error:", error);

    if(error instanceof ZodError) {
        return formatZodError(res,error);
    }

    if(error instanceof MulterError){
        const { status, message, error:err} = handleMulterError(error);
        return res.status(status).json({
            message,
            error:err,
            errorCode: ErrorCodeEnum.FILE_UPLOAD_ERROR, 
        })
    }

    if(error instanceof AppError) {
        return res.status(error.statusCode).json({
            message: error.message,
            errorCode: error.errorCode,
        });
    }

    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        error: error?.message || "Unknown error occured",
    });
};