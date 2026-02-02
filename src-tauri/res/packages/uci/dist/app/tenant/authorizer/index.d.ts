import { LYObject } from '../../../object';
import type { LYAppHttpClient } from '../../../http';
export declare class LYTenantAuthorizer extends LYObject {
    private _sessionApi;
    constructor(httpClient: LYAppHttpClient);
    signin(userName: string, password: string): Promise<void>;
    signout(): Promise<void>;
    update(): Promise<void>;
    /**
     * 刷新session
     */
    private _refreshSession;
}
