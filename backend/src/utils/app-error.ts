
import { HTTPSTATUS , HttpStatusCodeType } from "../config/http.config";
import { ErrorCodeEnum, ErrorCodeEnumType } from "../enums/error-code.enum";

export class AppError extends Error {
         public statuscode: HttpStatusCodeType
         public errorCode? : ErrorCodeEnumType

         constructor(
                  message: string,
                  statuscode = HTTPSTATUS.INTERNAL_SERVER_ERROR,
                  errorCode?: ErrorCodeEnumType
         ) {
                  super(message);
                  this.statuscode = statuscode;
                  this.errorCode = errorCode;
                  Error.captureStackTrace(this, this.constructor);
         }
}

export class InternalServerException extends AppError {
         constructor(
                  message = "Internal Server Error",
                  statuscode = HTTPSTATUS.INTERNAL_SERVER_ERROR,
                  errorCode?: ErrorCodeEnumType
         ) {
                  super(message, statuscode, errorCode || ErrorCodeEnum.INTERNAL_SERVER_ERROR);
         }
}

export class BadRequestException extends AppError {
         constructor(
                  message = "Bad Request",
                  statuscode = HTTPSTATUS.BAD_REQUEST,
                  errorCode?: ErrorCodeEnumType
         ) {
                  super(message, statuscode, errorCode || ErrorCodeEnum.VALIDATION_ERROR);
         }
}

export class UnauthorizedException extends AppError {
         constructor(
                  message = "Unauthorized",
                  statuscode = HTTPSTATUS.UNAUTHORIZED,
                  errorCode?: ErrorCodeEnumType
         ) {
                  super(message, statuscode, errorCode || ErrorCodeEnum.AUTH_NOT_FOUND);
         }
}

export class NotFoundException extends AppError {
         constructor(
                  message = "Not Found",
                  statuscode = HTTPSTATUS.NOT_FOUND,
                  errorCode?: ErrorCodeEnumType
         ) {
                  super(message, statuscode, errorCode || ErrorCodeEnum.RESOURCE_NOT_FOUND);
         }
}