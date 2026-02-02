import { LYError } from '../error';
export type LYBasicResultCode = 'success' | 'failed' | 'invalid_params' | 'exists' | 'not_exists' | 'forbidden' | 'timeout' | 'expired';
export declare class LYBaseHttpError extends LYError {
    private _url;
    private _method;
    private _inner_error;
    constructor(message: string, url: string, method: string, inner_error: Error);
    get url(): string;
    get method(): string;
    get inner_error(): Error;
}
export declare class LYConfigError extends LYBaseHttpError {
}
export declare class LYNetworkError extends LYBaseHttpError {
}
export declare enum LYHttpStatus {
    SUCCESS = 200,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    TOO_MANY_REQUESTS = 429,
    INTERNAL_SERVER_ERROR = 500
}
export declare class LYHttpStatusError extends LYBaseHttpError {
    private _status;
    constructor(message: string, url: string, method: string, inner_error: Error, status: number);
    get status(): number;
    getStatus(): LYHttpStatus | undefined;
}
export declare class LYAppHttpError extends LYBaseHttpError {
    constructor(message: string, url: string, method: string, inner_error: Error, code: string);
    getCode<T extends LYBasicResultCode = LYBasicResultCode>(): T;
}
