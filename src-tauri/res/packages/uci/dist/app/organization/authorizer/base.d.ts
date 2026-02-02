import { LYObject, type LYEvents } from '../../../object';
import { LYBaseApp } from '../../base';
import { SSOConfig } from '../api/session';
export declare const ORGANIZATION_APP_NAME = "organization";
export type LYAuthorizerStatus = 'signed-in' | 'signed-out';
type LYAuthorizerEvents = {
    'status-change': (status: LYAuthorizerStatus) => void;
};
export interface LYSigninArgs {
    redirect_uri: string;
    sso_config?: SSOConfig;
}
export interface LYSignoutArgs {
    redirect_uri?: string;
}
export interface ILYAuthorizer<TSigninArgs extends LYSigninArgs = LYSigninArgs, TSignoutArgs extends LYSignoutArgs = LYSignoutArgs> {
    on: LYEvents<LYAuthorizerEvents>['on'];
    off: LYEvents<LYAuthorizerEvents>['on'];
    once: LYEvents<LYAuthorizerEvents>['on'];
    emit: LYEvents<LYAuthorizerEvents>['emit'];
    signin: (args: TSigninArgs) => Promise<void>;
    signout: (args: TSignoutArgs) => Promise<void>;
}
export declare abstract class LYBaseAuthorizer<TSigninArgs extends LYSigninArgs = LYSigninArgs, TSignoutArgs extends LYSignoutArgs = LYSignoutArgs> extends LYObject implements ILYAuthorizer<TSigninArgs, TSignoutArgs> {
    private _app;
    private _name;
    constructor(app: LYBaseApp, name: string);
    get app(): LYBaseApp;
    get name(): string;
    signin(args: TSigninArgs): Promise<void>;
    signout(args: TSignoutArgs): Promise<void>;
    protected abstract _signin(args: TSigninArgs): Promise<void>;
    protected abstract _signout(args: TSignoutArgs): Promise<void>;
}
export {};
