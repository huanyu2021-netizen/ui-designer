import { LYSerializeable, SERIALIZE_CREATE, LYCtorInfo } from './serializeable';
export declare class LYObservable extends LYSerializeable {
}
export declare class LYOwnerObservable<T> extends LYObservable {
    private _owner;
    protected static [SERIALIZE_CREATE](ctor: LYCtorInfo, ...args: any[]): LYSerializeable;
    constructor(owner: T);
    get owner(): T;
    set owner(value: T);
}
export declare const observe: {
    action: import("mobx").IActionFactory;
    include(target: any, propertyOrContext: any): any;
};
