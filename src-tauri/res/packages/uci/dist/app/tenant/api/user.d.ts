import type { LYAppHttpClient, LYBaseResponse, LYListResponse } from '../../../http';
interface LYUserResponse extends LYBaseResponse {
    id: string;
    name: string;
    description: string;
}
interface LYUserListResponse extends LYListResponse<LYUserResponse> {
}
interface LYUserPostRequest {
    name: string;
    password: string;
    description?: string;
}
interface LYUserPatchRequest {
    password?: string;
    description?: string;
}
export declare class LYUserApi {
    private _httpClient;
    constructor(httpClient: LYAppHttpClient);
    query(): Promise<LYUserListResponse>;
    get(name: string): Promise<LYUserResponse>;
    create(user: LYUserPostRequest): Promise<string>;
    update(name: string, user: LYUserPatchRequest): Promise<number>;
    delete(name: string): Promise<number>;
}
export {};
