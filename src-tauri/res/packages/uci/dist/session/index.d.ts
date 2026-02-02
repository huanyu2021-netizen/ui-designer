import { LYObject } from '../object';
import { type LYAction, LYAppPermission } from '../permission';
type LYSessionType = 'web' | 'direct' | 'gateway' | 'redirect';
export declare class LYSession extends LYObject {
    private static _session?;
    private _type;
    private _authentication_name;
    private _id;
    private _token;
    private _user_id;
    private _user_name;
    private _expires_in;
    private _permissions;
    private _created_at;
    private static _refreshCallback?;
    private static _refreshTimer?;
    private static readonly _CHECK_INTERVAL;
    private _is_first_login;
    private _display_name;
    private _email;
    private _phone;
    private _country_code;
    static get(): LYSession | undefined;
    static create(type: LYSessionType, authentication_name: string, id: string, token: string, user_id: string, user_name: string, expires_in: number, permissions: Record<string, Record<string, LYAction[]>>, is_first_login?: boolean, display_name?: string, email?: string, phone?: string, country_code?: string): LYSession;
    static clear(): void;
    constructor(type: LYSessionType, authentication_name: string, id: string, token: string, user_id: string, user_name: string, expires_in: number, permissions: Record<string, Record<string, LYAction[]>>, created_at: number, is_first_login?: boolean, display_name?: string, email?: string, phone?: string, country_code?: string);
    get type(): LYSessionType;
    get authentication_name(): string;
    get id(): string;
    get token(): string;
    get user_id(): string;
    get user_name(): string;
    get expires_in(): number;
    get permissions(): Record<string, LYAppPermission>;
    get created_at(): number;
    get is_first_login(): boolean | undefined;
    get display_name(): string;
    get email(): string;
    get phone(): string;
    get country_code(): string;
    /**
     * 检查session是否已过期
     */
    isExpired(): boolean;
    /**
     * 检查session是否即将过期（在过期前15秒）
     */
    isNearExpiration(): boolean;
    /**
     * 设置刷新回调函数
     */
    static setRefreshCallback(callback: (session: LYSession) => Promise<void>): void;
    /**
     * 获取有效的session，如果过期则尝试刷新
     */
    static getValid(): Promise<LYSession | undefined>;
    /**
     * 更新session信息
     */
    static update(id: string, token: string, user_id: string, user_name: string, expires_in: number, permissions: Record<string, Record<string, LYAction[]>>, display_name?: string, email?: string, phone?: string, country_code?: string): void;
    /**
     * 启动定时器监控session过期
     */
    private static _startRefreshTimer;
    /**
     * 停止定时器
     */
    private static _stopRefreshTimer;
    /**
     * 检查并刷新session
     */
    private static _checkAndRefreshSession;
}
export {};
