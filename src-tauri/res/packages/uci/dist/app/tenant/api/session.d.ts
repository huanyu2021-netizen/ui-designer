import type { LYAppHttpClient, LYBaseResponse } from '../../../http';
interface LYSessionResponse extends LYBaseResponse {
    id: string;
    access_token: string;
    token_type: string;
    user_id: string;
    user_name: string;
    expires_in: number;
    claims: Record<string, any>;
}
interface LYSessionPostRequest {
    name: string;
    password: string;
}
export declare class LYSessionApi {
    private _httpClient;
    constructor(httpClient: LYAppHttpClient);
    get(id: string): Promise<LYSessionResponse>;
    create(session: LYSessionPostRequest): Promise<LYSessionResponse>;
    update(id: string): Promise<LYSessionResponse>;
    delete(id: string): Promise<number>;
}
export {};
