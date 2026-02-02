import { type AxiosInstance } from 'axios';
import { LYObject } from '../object';
import { type LYHttpRetryConfig } from '../config/http';
export type LYHttpRequestConfig = {
    method?: LYHttpRequestMethod;
    url?: string;
    baseURL?: string;
    headers?: Record<string, string>;
    params?: Record<string, any>;
    data?: Record<string, any>;
    timeout?: number;
    withCredentials?: boolean;
    onUploadProgress?: (progress: number) => void;
    onDownloadProgress?: (progress: number) => void;
    signal?: AbortSignal;
    responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream' | 'formdata';
};
export interface ILYHttpClient {
    get<T>(url: string, query?: Record<string, any>): Promise<T>;
    post<T>(url: string, data?: Record<string, any>): Promise<T>;
    put<T>(url: string, data?: Record<string, any>): Promise<T>;
    delete<T>(url: string, query?: Record<string, any>): Promise<T>;
    patch<T>(url: string, data?: Record<string, any>): Promise<T>;
}
export type LYHttpRequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export interface LYKeyConverter {
    convert_request(key: string): string;
    convert_response(key: string): string;
}
export declare class LYSnakeCaseDataConverter implements LYKeyConverter {
    convert_request(key: string): string;
    convert_response(key: string): string;
}
export declare class LYHttpClient extends LYObject implements ILYHttpClient {
    private _baseUrl;
    private _key_converter?;
    protected _client: AxiosInstance;
    constructor(baseUrl?: string);
    get baseUrl(): string;
    get key_converter(): LYKeyConverter | undefined;
    set key_converter(converter: LYKeyConverter | undefined);
    private _convert_request;
    private _convert_response;
    protected _get_headers(): Record<string, string> | undefined;
    protected _request(config: LYHttpRequestConfig): Promise<any>;
    withRetry(fn: (config: LYHttpRetryConfig) => LYHttpRetryConfig): Promise<this>;
    get<TResponse = Record<string, any>, TQuery = Record<string, any>>(url: string, query?: TQuery, config?: LYHttpRequestConfig): Promise<TResponse>;
    post<TResponse = Record<string, any>, TData = Record<string, any>>(url: string, data?: TData, config?: LYHttpRequestConfig): Promise<TResponse>;
    put<TResponse = Record<string, any>, TData = Record<string, any>>(url: string, data?: TData, config?: LYHttpRequestConfig): Promise<TResponse>;
    delete<TResponse = Record<string, any>, TQuery = Record<string, any>>(url: string, query?: TQuery, config?: LYHttpRequestConfig): Promise<TResponse>;
    patch<TResponse = Record<string, any>, TData = Record<string, any>>(url: string, data?: TData, config?: LYHttpRequestConfig): Promise<TResponse>;
}
