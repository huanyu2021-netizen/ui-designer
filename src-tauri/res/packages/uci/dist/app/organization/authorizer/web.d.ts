import type { LYBaseApp } from '../../base';
import { LYBaseAuthorizer, type LYSigninArgs, type LYSignoutArgs } from './base';
import type { LYSessionApi } from '../api/session';
export interface LYWebSigninArgs extends LYSigninArgs {
    name?: string;
    password?: string;
    email?: string;
    phone?: string;
    country_code?: string;
    account_type?: "email" | "phone";
    verification_code?: string;
    verification_code_id?: string;
}
export interface LYWebSignoutArgs extends LYSignoutArgs {
}
export declare class LYWebAuthorizer extends LYBaseAuthorizer<LYWebSigninArgs, LYWebSignoutArgs> {
    private _sessionApi;
    constructor(app: LYBaseApp, name: string, sessionApi: LYSessionApi);
    _signin(args: LYWebSigninArgs): Promise<void>;
    _signout(args: LYWebSignoutArgs): Promise<void>;
    /**
     * 刷新session
     */
    private _refreshSession;
}
