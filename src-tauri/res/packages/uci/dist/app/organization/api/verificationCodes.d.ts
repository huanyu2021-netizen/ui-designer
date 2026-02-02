import type { LYAppHttpClient, LYBaseResponse } from '../../../http';
interface LYVerificationCodeRequest {
    email?: string;
    phone?: string;
    country_code?: string;
    account_type: "email" | "phone";
    purpose: 'register' | 'login' | 'reset_password';
    verification_code_id?: string;
    verification_code?: string;
}
interface LYVerificationCodesResponse extends LYBaseResponse {
    message: string;
    cooldown_seconds: number;
    expires_in: number;
    verification_code_id: string;
}
export declare class LYVerificationCodesApi {
    private _httpClient;
    constructor(httpClient: LYAppHttpClient);
    send(request: LYVerificationCodeRequest): Promise<LYVerificationCodesResponse>;
    check(request: LYVerificationCodeRequest): Promise<{
        verified: boolean;
        verification_code_id: string;
        expires_at: string;
    }>;
}
export {};
