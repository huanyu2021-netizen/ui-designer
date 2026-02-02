import type { LYAppHttpClient, LYBaseResponse } from '../../../http';
interface LYTenantResponse extends LYBaseResponse {
    id: string;
    name: string;
    description: string;
}
interface LYTenantPostRequest {
    name: string;
    description?: string;
    admin_name: string;
    admin_password: string;
}
interface LYTenantPatchRequest {
    description?: string;
}
export declare class LYTenantApi {
    private _httpClient;
    constructor(httpClient: LYAppHttpClient);
    query(): Promise<LYTenantResponse[]>;
    get(name: string): Promise<LYTenantResponse>;
    create(tenant: LYTenantPostRequest): Promise<string>;
    update(name: string, tenant: LYTenantPatchRequest): Promise<number>;
    delete(name: string): Promise<number>;
}
export {};
