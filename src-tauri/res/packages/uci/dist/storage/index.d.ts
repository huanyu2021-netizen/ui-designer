import type { ILYEvents, LYEvents } from '../object';
import { LYObject } from '../object';
type LYStorageEvents = {
    changed(event: {
        key: string;
        value: any;
        isCrossWindow?: boolean;
    }): void;
};
export interface ILYStorage extends ILYEvents<LYStorageEvents> {
    init(): Promise<void>;
    flush(): Promise<void>;
    get<T>(key: string): Promise<T>;
    set(key: string, value: any): Promise<void>;
    has(key: string): Promise<boolean>;
    update(key: string, func: (value: any) => Promise<any>): Promise<void>;
    remove(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
    values(): Promise<any[]>;
    entries(): Promise<[string, any][]>;
}
export interface ILYStorageSync extends ILYEvents<LYStorageEvents> {
    initSync(): void;
    flushSync(): void;
    getSync<T>(key: string): T;
    setSync(key: string, value: any): void;
    hasSync(key: string): boolean;
    updateSync(key: string, func: (value: any) => any): void;
    removeSync(key: string): void;
    clearSync(): void;
    keysSync(): string[];
    valuesSync(): any[];
    entriesSync(): [string, any][];
}
declare class LYBaseLocalStorage extends LYObject implements ILYStorageSync {
    on: LYEvents<LYStorageEvents>['on'];
    off: LYEvents<LYStorageEvents>['on'];
    once: LYEvents<LYStorageEvents>['on'];
    emit: LYEvents<LYStorageEvents>['emit'];
    protected _storage: Storage;
    protected _prefix: string;
    constructor(prefix: string, storage: Storage);
    initSync(): void;
    flushSync(): void;
    getSync<T>(key: string): T;
    setSync(key: string, value: any): void;
    hasSync(key: string): boolean;
    /**
     * 为了更新原子化，譬如我要在原来的基础上+1，如果是先get，在set，而get和set是异步的话，那么get和set中间可能出现对这个值再进行了操作的情况，导致不符合预期
     */
    updateSync(key: string, func: (value: any) => any): void;
    removeSync(key: string): boolean;
    clearSync(): void;
    keysSync(): string[];
    valuesSync(): any[];
    entriesSync(): [string, any][];
}
export declare class LYLocalStorage extends LYBaseLocalStorage implements ILYStorageSync {
    constructor(prefix: string);
}
export declare class LYSessionStorage extends LYBaseLocalStorage implements ILYStorageSync {
    constructor(prefix: string);
}
export interface ILYCloudStorage {
    setValue(key: string, value: string): Promise<void>;
    getValue(key: string): Promise<string>;
    remove(keys: string[]): Promise<void>;
    clear(prefix?: string): Promise<void>;
    getAll(): Promise<Record<string, any>>;
    getKeys(): Promise<string[]>;
}
export declare function setCloudStorageImpl(value: ILYCloudStorage): void;
export declare class LYCloudStorage extends LYObject implements ILYStorage {
    on: LYEvents<LYStorageEvents>['on'];
    off: LYEvents<LYStorageEvents>['on'];
    once: LYEvents<LYStorageEvents>['on'];
    addListener: LYEvents<LYStorageEvents>['on'];
    removeListener: LYEvents<LYStorageEvents>['on'];
    emit: LYEvents<LYStorageEvents>['emit'];
    protected _prefix: string;
    constructor(prefix: string);
    get keyValueImpl(): ILYCloudStorage;
    init(): Promise<void>;
    flush(): Promise<void>;
    get<T>(key: string): Promise<T>;
    set(key: string, value: any): Promise<void>;
    has(key: string): Promise<boolean>;
    update(key: string, func: (value: any) => Promise<any>): Promise<void>;
    remove(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
    values(): Promise<any[]>;
    entries(): Promise<[string, any][]>;
}
export declare const sharedLocalStorage: LYLocalStorage;
export declare const sharedCloudStorage: LYCloudStorage;
export {};
