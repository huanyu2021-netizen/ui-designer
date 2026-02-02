import type { LYBasicResultCode } from '../../../http/error';
import type { LYAppHttpClient, LYBaseResponse } from '../../../http';
export type LYSessionAddResultCode = LYBasicResultCode | 'user_locked';
export interface LYSessionResponse extends LYBaseResponse {
    id: string;
    access_token: string;
    token_type: string;
    user_id: string;
    user_name: string;
    expires_in: number;
    claims: Record<string, any>;
    permission_codes: Record<string, any>;
    is_first_login?: boolean;
    display_name: string;
    email: string;
    phone: string;
    country_code: string;
}
export interface LYSessionPostRequest {
    name?: string;
    password?: string;
    email?: string;
    phone?: string;
    country_code?: string;
    account_type?: "email" | "phone";
    verification_code?: string;
    verification_code_id?: string;
}
export type SSOConfig = {
    id: string;
    name: string;
    description: string;
    authentication_type: string;
    icon: string;
    auth_url: string;
    enabled: boolean;
};
export interface LYLoginWays {
    allow_phone_login: boolean;
    allow_email_login: boolean;
    allow_username_login: boolean;
    sso_list: SSOConfig[];
}
export declare class LYSessionApi {
    private _httpClient;
    constructor(httpClient: LYAppHttpClient);
    create(request: LYSessionPostRequest): Promise<LYSessionResponse>;
    update(id: string): Promise<LYSessionResponse>;
    delete(id: string): Promise<number>;
    getLoginWays(): Promise<LYLoginWays>;
}
