import { LYBaseAuthorizer, type LYSigninArgs, LYSignoutArgs } from './base';
export interface LYRedirectSessionPostRequest {
    authentication_name: string;
    query_params: {
        code: string;
        code_verifier: string;
        redirect_uri: string;
        state: string;
    };
}
export declare class LYRedirectAuthorizer extends LYBaseAuthorizer {
    _signin(args: LYSigninArgs): Promise<void>;
    signin(args: LYSigninArgs): Promise<void>;
    private _jumpToSSO;
    private _getQueryParams;
    signout(args?: LYSignoutArgs): Promise<void>;
    _signout(): Promise<void>;
}
