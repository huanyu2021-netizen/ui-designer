import type { LYBasicResultCode } from '../../../http/error';
import type { LYAppHttpClient, LYBaseResponse, LYListResponse } from '../../../http';
export type LYLicenseResultCode = LYBasicResultCode | 'not_match';
interface LYLicenseFileResponse extends LYBaseResponse {
    id: string;
    file_name: string;
}
interface LYLicenseContentResponse extends LYBaseResponse {
    signature: string;
    id: string;
    app_name: string;
    app_version: string;
    name: string;
    activation_at: string;
    expiration_at: string;
    usage_period: number;
    quantity: number;
    counter: number;
}
interface LYLicenseFileContentResponse extends LYBaseResponse {
    id: string;
    file_name: string;
    customer: string;
    env_code: string;
    items: LYLicenseContentResponse[];
}
interface LYLicensePostRequest {
    content: string;
}
interface LYLicenseTokenResponse extends LYBaseResponse {
    id: string;
    license_id: string;
    ordinal: number;
    acquire_id: string;
    expire_at: string;
    message: string;
}
interface LYLicenseLogResponse extends LYBaseResponse {
    id: string;
    action: string;
    failed: boolean;
    message: string;
    inner_message: string;
    license_id: string;
    license_token_id: string;
}
export declare class LYLicenseApi {
    private _httpClient;
    constructor(httpClient: LYAppHttpClient);
    queryFiles(): Promise<LYListResponse<LYLicenseFileResponse>>;
    getFileContent(id: string): Promise<LYLicenseFileContentResponse | undefined>;
    add(license: LYLicensePostRequest): Promise<string>;
    getAll(): Promise<LYListResponse<LYLicenseContentResponse>>;
    get(id: string): Promise<LYLicenseContentResponse | undefined>;
    remove(id: string): Promise<number>;
    getTokens(): Promise<LYListResponse<LYLicenseTokenResponse>>;
    getToken(id: string): Promise<LYLicenseTokenResponse | undefined>;
    getLogs(licenseId: string, tokenId?: string): Promise<LYListResponse<LYLicenseLogResponse>>;
}
export {};
