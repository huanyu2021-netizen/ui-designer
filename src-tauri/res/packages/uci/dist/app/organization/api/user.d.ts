import type { LYRangeQueryParams, LYAppHttpClient, LYBaseResponse, LYListResponse } from '../../../http';
type LYSourceType = 'builtin' | 'web' | 'sso' | string;
interface LYUserQueryParams extends LYRangeQueryParams {
    name?: string;
    role_id?: string;
    email?: string;
    phone?: string;
    department_id?: string;
    manager_only?: boolean;
}
interface LYAccountCheckRequest {
    email?: string;
    phone?: string;
    account_type?: "email" | "phone";
    country_code?: string;
}
interface LYUserRegisterResonse extends LYBaseResponse {
    user_id: string;
    message: string;
    email_verified: boolean;
    phone_verified: boolean;
}
interface LYUserResponse extends LYBaseResponse {
    id: string;
    name: string;
    role_id: string;
    source: LYSourceType;
    email: string;
    phone: string;
    is_super_admin: boolean;
    description: string;
    is_locked: boolean;
    locked_at: string;
    locked_by: string;
    login_failures: number;
    last_login_at: string;
    last_login_ip: string;
    last_login_location: string;
    last_login_device: string;
    last_login_browser: string;
    last_login_os: string;
}
interface LYUserListResponse extends LYListResponse<LYUserResponse> {
}
interface LYUserPostRequest {
    name: string;
    password: string;
    description?: string;
    role_id?: string;
    email?: string;
    phone?: string;
}
interface LYUserPatchRequest {
    password?: string;
    description?: string;
    is_locked?: boolean;
    role_id?: string;
    email?: string;
    phone?: string;
}
interface LYRegisterRequest {
    email?: string;
    phone?: string;
    country_code?: string;
    account_type: string;
    password: string;
    display_name?: string;
}
interface LYResetPasswordRequest {
    account_type: "email" | "phone";
    verification_code_id: string;
    new_password: string;
    email?: string;
    country_code?: string;
    phone?: string;
}
export declare class LYUserApi {
    private _httpClient;
    constructor(httpClient: LYAppHttpClient);
    query(params: LYUserQueryParams): Promise<LYUserListResponse>;
    get(name: string): Promise<LYUserResponse | undefined>;
    add(user: LYUserPostRequest): Promise<string>;
    update(name: string, user: LYUserPatchRequest): Promise<number>;
    remove(name: string): Promise<number>;
    accountCheck(request: LYAccountCheckRequest): Promise<boolean>;
    register(request: LYRegisterRequest): Promise<LYUserRegisterResonse>;
    userNameCheck(name: string): Promise<boolean>;
    changePassword(currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    resetPassword(request: LYResetPasswordRequest): Promise<{
        message: string;
    }>;
}
export {};
