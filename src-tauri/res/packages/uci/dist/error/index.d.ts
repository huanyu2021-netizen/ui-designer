/**
 * LY系列错误基类
 */
export declare class LYError extends Error {
    private _details?;
    protected _code: string;
    constructor(message: string, code?: string, details?: any);
    get code(): string;
    get details(): any;
}
/**
 * 加密相关错误类
 */
export declare class LYCryptoError extends LYError {
    constructor(message: string, code?: string, details?: any);
}
