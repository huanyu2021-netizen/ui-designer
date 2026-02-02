import type { LYAppHttpClient } from '../../../http';
export declare class LYConfigurationApi {
    private _httpClient;
    constructor(httpClient: LYAppHttpClient);
    get_meta(): Promise<Record<string, any>>;
    get(): Promise<Record<string, any>>;
    set(value: Record<string, any>): Promise<number>;
}
