import { LYObject } from '../../../object';
export declare class LYTenantSession extends LYObject {
    private static _session?;
    private _id;
    private _token;
    private _user_id;
    private _user_name;
    private _expires_in;
    private _claims;
    private _created_at;
    private static _refreshCallback?;
    private static _refreshTimer?;
    private static readonly _CHECK_INTERVAL;
    static get(): LYTenantSession | undefined;
    static create(id: string, token: string, user_id: string, user_name: string, expires_in: number, claims: Record<string, any>): LYTenantSession;
    static clear(): void;
    constructor(id: string, token: string, user_id: string, user_name: string, expires_in: number, claims: Record<string, any>, created_at: number);
    get id(): string;
    get token(): string;
    get user_id(): string;
    get user_name(): string;
    get expires_in(): number;
    get claims(): Record<string, any>;
    get created_at(): number;
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
    static setRefreshCallback(callback: (session: LYTenantSession) => Promise<void>): void;
    /**
     * 获取有效的session，如果过期则尝试刷新
     */
    static getValid(): Promise<LYTenantSession | undefined>;
    /**
     * 更新session信息
     */
    static update(id: string, token: string, user_id: string, user_name: string, expires_in: number, claims: Record<string, any>): void;
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
