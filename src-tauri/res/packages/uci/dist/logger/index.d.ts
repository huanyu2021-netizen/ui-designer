/**
 * 日志模块，提供默认日志格式化、默认IndexDB存储
 * 说明：
 * 1. 在IndexDB不可用的时候，允许日志不记录或丢失情况，也无需降级处理
 *    - IndexDB不可用场景：隐私模式、存储空间不足、浏览器不支持等
 *    - 日志丢失影响：仅影响问题排查，不影响核心业务功能
 * 2. 浏览器日志仅用于辅助分析问题，对于日志的健壮性要求不高，无需重试和备用策略
 *    - 适用场景：开发调试、线上问题排查
 *    - 不适用场景：业务审计、关键操作记录等
 */
export declare enum LYLogLevel {
    NONE = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4
}
export interface ILYLogFormatter {
    format(level: string, namespace: string, args: unknown[]): string;
}
export interface ILYLogStorage {
    printToConsole?: boolean;
    write(level: string, message: string, meta?: any): Promise<void>;
    download(filename: string): Promise<void>;
}
export interface ILYLogger {
    readonly level: LYLogLevel;
    setLevel(level: LYLogLevel): void;
    error(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    info(...args: unknown[]): void;
    debug(...args: unknown[]): void;
    download(): Promise<void>;
}
export declare class LYDefaultLogFormatter implements ILYLogFormatter {
    format(level: string, namespace: string, args: unknown[]): string;
    private formatArgs;
}
export declare class LYIndexedDBLogStorage implements ILYLogStorage {
    private _db;
    private _maxLogs;
    private _logBuffer;
    private _bufferSize;
    private _flushInterval;
    private _isFlushing;
    private _printToConsole;
    constructor();
    get printToConsole(): boolean;
    set printToConsole(value: boolean);
    private init;
    private generateId;
    private getMicroTimestamp;
    write(level: string, message: string, meta?: any): Promise<void>;
    private flushBuffer;
    private cleanupOldLogs;
    private getAllLogs;
    download(filename: string): Promise<void>;
}
export declare function setFormatter(formatter: ILYLogFormatter): void;
export declare function setStorage(storage: ILYLogStorage): void;
export declare function setPrintToConsole(enabled: boolean): void;
export declare class LYLogger implements ILYLogger {
    private _level;
    private _namespace;
    constructor(namespace: string, level?: LYLogLevel);
    get level(): LYLogLevel;
    setLevel(level: LYLogLevel): void;
    private log;
    error(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    info(...args: unknown[]): void;
    debug(...args: unknown[]): void;
    download(): Promise<void>;
}
export declare const logger: LYLogger;
