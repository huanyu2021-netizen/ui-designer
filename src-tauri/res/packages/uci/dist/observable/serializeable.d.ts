import { EventEmitter } from 'events';
import { type IObjectDidChange, type IArrayDidChange, type IMapDidChange } from 'mobx';
import { LYObject, type LYEventsWithoutAny } from '../object';
/**
 * 序列化管理基类
 * 已实现按所有key进行遍历进行序列化操作，不包含原型上的属性
 * 不支持function、symbol的序列化
 * 支持递归序列化，支持循环引用对象的序列化
 * 考虑到构造函数的特异性，支持自定义构造方式
 * 自定义构造：
 * 1、重写getConstructorArguments实例方法，返回需要的构造函数参数数组
 * 2、重写create静态方法，可获取构造函数、构造对象的所有者（数组对象的所有者不是数组本身，而是上层对象）、对应的所有者的属性名、构造函数的参数（由getConstructorArguments提供）
 * 循环引用处理：
 * 1、deserializeObjects用于存储此次已序列化的对象，当出现循环引用时，直接从中获取已反序列化的对象
 * 2、addReentry、releaseReentry用于确定反序列化入口，releaseReentry过程中reentryCount为0时表示反序列化完成，此时清除deserializeObjects
 * 自定义序列化：
 * 1、可遵从规范重写doSerialize、doDeserialize方法
 * 2、使用@serialize.include定义需序列化的属性
 */
export declare const UNIQUE_ID: unique symbol;
declare const SERIALIZE_CACHE: unique symbol;
declare const FREEZED_DATA: unique symbol;
declare const BACKUP_DATA: unique symbol;
declare const OBSERVABLE_DISPOSER: unique symbol;
export declare const SERIALIZING: unique symbol;
export declare const DESERIALIZING: unique symbol;
export declare const SERIALIZE_DATA: unique symbol;
export declare const SERIALIZE_CREATE: unique symbol;
export declare const SERIALIZE_GET_CONSTRUCT_ARGS: unique symbol;
export type LYCtorInfo = {
    Construct: new (...args: any) => LYSerializeable;
    owner: any;
    property: string;
};
export type IChange = IObjectDidChange | IArrayDidChange | IMapDidChange;
type LYSerializeableObserveEvents = {
    ['before-serialize'](target: LYSerializeable): void;
    ['before-deserialize'](target: LYSerializeable): void;
    ['after-serialize'](target: LYSerializeable): void;
    ['after-deserialize'](target: LYSerializeable): void;
    ['property-change'](target: LYSerializeable, property?: string): void;
};
export declare class LYSerializeableObserve extends EventEmitter {
    on: LYEventsWithoutAny<LYSerializeableObserveEvents>['on'];
    off: LYEventsWithoutAny<LYSerializeableObserveEvents>['on'];
    once: LYEventsWithoutAny<LYSerializeableObserveEvents>['on'];
    addListener: LYEventsWithoutAny<LYSerializeableObserveEvents>['on'];
    removeListener: LYEventsWithoutAny<LYSerializeableObserveEvents>['on'];
    emit: LYEventsWithoutAny<LYSerializeableObserveEvents>['emit'];
}
export declare class LYSerializeable extends LYObject {
    emit: LYEventsWithoutAny<any>['emit'];
    protected static [SERIALIZE_CREATE](ctor: LYCtorInfo, ...args: any[]): LYSerializeable;
    static get observe(): LYSerializeableObserve;
    static serialize(value: any): any | any[];
    static deserialize(data: any, owner?: any, property?: string): any | any[];
    private [UNIQUE_ID];
    private [SERIALIZING];
    private [DESERIALIZING];
    private [SERIALIZE_CACHE];
    private [BACKUP_DATA];
    private [FREEZED_DATA];
    private [OBSERVABLE_DISPOSER];
    protected [SERIALIZE_DATA]: any;
    constructor();
    protected [SERIALIZE_GET_CONSTRUCT_ARGS](): unknown[];
    get isSerializing(): boolean;
    get isDeserializing(): any;
    get freezed(): boolean;
    set freezed(value: boolean);
    backup(): void;
    restore(): void;
    get serializeCached(): boolean;
    clearSerializeCache(): void;
    protected onDataChange(change: IChange, path: string): void;
    protected onPropertyChange(property?: string): void;
    protected doSerialize(): any;
    serialize(): object;
    protected doDeserialize(data: any): void;
    deserialize(o: any): void;
    hasOwnProperty(key: string): any;
}
export declare const serialize: {
    include<T extends LYSerializeable>(target: T, property: string): void;
};
export {};
