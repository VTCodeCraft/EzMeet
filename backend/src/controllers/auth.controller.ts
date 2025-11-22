import { HTTPSTATUS } from "../config/http.config";
import { Request, Response } from "express";
import { asyncHandleAndValidate } from "../middlewares/withValidation.middleware";
import { LoginDto, RegisterDto } from "../database/dto/auth.dto";
import { loginService, registerService } from "../services/auth.service";


export const registerController = asyncHandleAndValidate(
        RegisterDto,
        'body',
        async (req: Request, res: Response, registerDto) => {

                const { user } = await registerService(registerDto)

                return res.status(HTTPSTATUS.CREATED).json({
                        message: "User registered successfully",
                        user,
                });
        }
);

export const loginController = asyncHandleAndValidate(
        LoginDto,
        'body',
        async (req: Request, res: Response, loginDto) => {

                const {user,accessToken,expiresAt} = await loginService(loginDto);
                return res.status(HTTPSTATUS.CREATED).json({
                        message: "User logged in successfully",
                        user,
                        accessToken,
                        expiresAt,
                });
        }
)
