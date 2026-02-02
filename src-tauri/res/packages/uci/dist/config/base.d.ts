import { LYObject } from '../object';
export declare function model<T extends typeof LYBaseConfigModel>(modelType: T): (target: any, key: string) => void;
export declare function array<T extends typeof LYBaseConfigModel>(modelType: T): (target: any, key: string) => void;
export declare function object<T extends typeof LYBaseConfigModel>(modelType: T): (target: any, key: string) => void;
export declare class LYBaseConfigModel {
    clone(): this;
    load(config: Record<string, any>): void;
}
export declare class LYBaseConfig extends LYObject {
    static load<T extends typeof LYBaseConfig>(this: T, config_url: string): Promise<InstanceType<T>>;
    static get<T extends typeof LYBaseConfig>(this: T): InstanceType<T>;
    private _load_from_url;
    private _load_from_element;
    load(config_url: string): Promise<void>;
}
