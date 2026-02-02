import { LYBaseApp } from '../../base';
import { LYTenantApi } from '../api/tenant';
import { LYUserApi } from '../api/user';
import { LYConfigurationApi } from '../api/configuration';
import { LYTenantAuthorizer } from '../authorizer';
declare class LYTenantApp extends LYBaseApp {
    static _instance?: LYTenantApp;
    private _tenantApi;
    private _userApi;
    private _configuration;
    private _authorizer;
    constructor(name: string, version: string, description: string);
    static get instance(): LYTenantApp;
    get tenantApi(): LYTenantApi;
    get userApi(): LYUserApi;
    get configuration(): LYConfigurationApi;
    get authorizer(): LYTenantAuthorizer;
    protected doLoad(): Promise<void>;
}
export { LYTenantApp };
