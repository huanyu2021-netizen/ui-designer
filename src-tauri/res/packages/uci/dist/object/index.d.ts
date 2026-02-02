import events from 'events';
import { LYLogger } from '../logger';
export type LYConstructor<T> = new (...args: any[]) => T;
type LYClassDesc = {
    name: string;
    Construct: LYConstructor<LYObject>;
};
export declare class LYObject extends events.EventEmitter {
    private _logger;
    private static _instances;
    static registerClass(name: string, Construct: LYConstructor<LYObject>): void;
    protected static autoRegister(this: LYConstructor<LYObject>): void;
    static getInstance<T extends LYObject>(obj: LYConstructor<T> | string, ...args: unknown[]): T;
    static getClassName<T extends LYObject>(obj: T | LYConstructor<T>, def?: string): string;
    static getClass<T extends LYObject>(name: string, def?: LYConstructor<T>): LYConstructor<T>;
    static getDerivedClasses<T extends LYObject>(name: string | LYConstructor<T>): LYConstructor<T>[];
    static get classes(): {
        [key: string]: LYClassDesc;
    };
    constructor();
    get className(): string;
    is(className: string): boolean;
    get logger(): LYLogger;
}
export declare function register(name: string): (Construct: LYConstructor<LYObject>) => void;
type LYEventsDefinition = {
    [event: string]: (...args: any[]) => void;
};
type LYAny<T> = {
    [key: string]: T;
};
type LYValueType<T> = T extends LYAny<infer U> ? U : never;
type LYUnionToIntersection<Union> = (Union extends any ? (argument: Union) => void : never) extends (argument: infer Intersection) => void ? Intersection : never;
export type LYEventsWithoutAny<T extends {
    [event: string]: (...args: any[]) => void;
}> = {
    on: LYUnionToIntersection<LYValueType<{
        [K in keyof T]: (event: K, listener: T[K]) => any;
    }>>;
    emit: LYUnionToIntersection<LYValueType<{
        [K in keyof T]: (event: K, ...args: Parameters<T[K]>) => boolean;
    }>>;
};
export type LYEvents<T extends LYEventsDefinition> = LYEventsWithoutAny<T> & {
    on(event: string, listener: (...args: any[]) => void): any;
    emit(event: string, ...args: any[]): any;
};
export interface ILYEvents<T extends LYEventsDefinition> {
    on: LYEventsWithoutAny<T>['on'];
    off: LYEventsWithoutAny<T>['on'];
    once: LYEventsWithoutAny<T>['on'];
    addListener: LYEventsWithoutAny<T>['on'];
    removeListener: LYEventsWithoutAny<T>['on'];
    emit: LYEventsWithoutAny<T>['emit'];
}
export declare function wait(interval?: number): Promise<void>;
export {};
