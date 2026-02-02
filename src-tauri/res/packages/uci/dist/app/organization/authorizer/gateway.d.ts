import { LYBaseAuthorizer, type LYSigninArgs, type LYSignoutArgs } from './base';
export declare class LYGatewayAuthorizer extends LYBaseAuthorizer {
    _signin(args: LYSigninArgs): Promise<void>;
    _signout(args: LYSignoutArgs): Promise<void>;
}
