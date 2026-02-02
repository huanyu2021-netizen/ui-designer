import { LYBaseAuthorizer, type LYSigninArgs, type LYSignoutArgs } from './base';
interface LYDirectSigninArgs extends LYSigninArgs {
    authentication_name: string;
    user_name: string;
    password: string;
}
export declare class LYDirectAuthorizer extends LYBaseAuthorizer {
    _signin(args: LYDirectSigninArgs): Promise<void>;
    _signout(args: LYSignoutArgs): Promise<void>;
}
export {};
