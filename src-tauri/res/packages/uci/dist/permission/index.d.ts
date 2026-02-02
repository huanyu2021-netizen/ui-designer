import { LYObject } from '../object';
export type LYAction = 'none' | 'create' | 'read' | 'update' | 'delete' | 'execute';
export declare class LYAppPermission extends LYObject {
    private _app_name;
    private _codes;
    constructor(app_name: string, codes: Record<string, LYAction[]>);
    get app_name(): string;
    getActions(code: string): LYAction[];
}
