import { LYObject } from '../../object';
import { LYAppHttpClient, LYTenantHttpClient, type IHeaderProvider } from '../../http';
import type { LYAppPermission } from '../../permission';
import { LYi18n, ILYi18n, LYKeyofLang } from '../../i18n';
import { ILYStorageSync, ILYStorage } from '../../storage';
import { LYEnv } from '../../env';
export declare const TENANT_APP_NAME = "tenant";
export declare const ORGANIZATION_APP_NAME = "organization";
export interface LYAppRemoteModule<Host, LYComponents> {
    default(host: Host): LYComponents | Promise<LYComponents>;
}
export type ILanguageResources = {
    [key in LYKeyofLang]: Object;
};
export interface ILYAppProvider {
    provideI18nResource: (app: LYBaseApp) => Promise<ILanguageResources>;
    provideI18nResourcePath: (app: LYBaseApp, lang?: string) => string;
}
export declare class LYDefaultAppProvider extends LYObject implements ILYAppProvider {
    provideI18nResourcePath(app: LYBaseApp, lang?: string): string;
    provideI18nResource(app: LYBaseApp): Promise<ILanguageResources>;
}
export declare class LYBaseApp extends LYObject {
    private static _apps;
    private static _headerProvider;
    private static _initLock;
    static get apps(): Record<string, LYBaseApp>;
    /**
     * 根据应用名称动态生成对应的类名
     * 例如: agent_system -> LYAgentSystemApp
     */
    private static getAppClassName;
    static init(config_url?: string): Promise<void>;
    protected _name: string;
    protected _version: string;
    protected _description: string;
    protected _httpClient: LYAppHttpClient;
    protected _isLoaded: boolean;
    protected _i18n: LYi18n;
    protected _localStore: ILYStorageSync;
    protected _sessionStore: ILYStorageSync;
    protected _cloudStore: ILYStorage;
    protected _provider: ILYAppProvider;
    protected _env: LYEnv;
    protected _tenantName: string;
    protected _isLoadingComponent: boolean;
    protected _remoteComponents: {
        [name: string]: any;
    };
    static getAll(): Record<string, LYBaseApp>;
    static get<T extends LYBaseApp = LYBaseApp>(name: string): T;
    static setHeaderProvider(headerProvider: IHeaderProvider): void;
    static getHeaderProvider(): IHeaderProvider;
    constructor(name: string, version: string, description: string);
    get location(): string;
    get name(): string;
    get tenantName(): string;
    get version(): string;
    get description(): string;
    get httpClient(): LYAppHttpClient;
    get permission(): LYAppPermission;
    get provider(): ILYAppProvider;
    get i18n(): ILYi18n;
    get localStore(): ILYStorageSync;
    get sessionStore(): ILYStorageSync;
    get cloudStore(): ILYStorage;
    get isLoaded(): boolean;
    get env(): LYEnv;
    protected _createHttpClient(): LYAppHttpClient;
    load(): Promise<void>;
    private getBaseUrl;
    protected doLoad(): Promise<void>;
    private initI18n;
    getI18nResourceUrl(relativeUrl: string, lang?: LYKeyofLang): string;
    getComponent<T>(componentName: string): Promise<T>;
    private loadRemoteComponents;
}
export declare class LYBaseTenantApp extends LYBaseApp {
    protected _createHttpClient(): LYTenantHttpClient;
}
