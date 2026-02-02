import { LYEvents } from '../object';
import { type LYBasicResultCode } from './error';
import { LYHttpClient, LYHttpRequestConfig } from './base';
import { AxiosResponse } from 'axios';
export interface LYSSEConfig {
    data?: Record<string, any>;
    delimiter?: string;
    signal?: AbortSignal;
    headers?: Record<string, string>;
}
export type LYSortQueryParams = {
    sort: string[];
};
export type LYRangeQueryParams = {
    offset: number;
    size: number;
    sort: string[];
};
export interface LYBaseResponse {
}
export interface LYBaseDataResponse extends LYBaseResponse {
    id: string;
    created_at: string;
    updated_at: string;
    updated_by?: string;
}
interface LYRangeResponse extends LYBaseResponse {
    offset: number;
    size: number;
    total?: number;
}
interface LYBaseResultResponse extends LYBaseResponse {
    message: string;
    tips?: string;
}
export interface LYIdentifierResponse extends LYBaseResponse {
    id: string;
}
export interface LYCountResponse extends LYBaseResponse {
    count: number;
}
export interface LYResultResponse<T extends LYBaseResponse, C = LYBasicResultCode> extends LYBaseResultResponse {
    code: C;
    data?: T;
}
export interface LYListResponse<T extends LYBaseResponse> extends LYBaseResponse {
    range?: LYRangeResponse;
    list: T[];
}
export interface IHeaderProvider {
    headers?: Record<string, string>;
}
export interface LYUploadResponse {
    id: string;
    state: LYUploadState;
}
export interface LYUploadParams {
    id?: string;
    ref_id?: string;
    ref_type?: string;
    expire?: number | string;
    ignore_session?: boolean;
    extra?: Record<string, any>;
    encryption?: boolean;
    state?: LYUploadState;
    level?: 'default' | 'low';
    chunk?: File;
    total_size?: number;
}
type LYUploadState = {
    bucket: string;
    key: string;
    completed_size: number;
    upload_id: string;
    part_number: number;
    parts: {
        PartNumber: number;
        ETag: string;
    }[];
};
export interface LYDeleteResponse {
    count: number;
}
type LYUploadFailedEvent = {
    file: File;
    error: Error;
    fileId: string;
    state: LYUploadState;
    params: LYUploadParams;
    failedChunkIndex: number;
    uploadedChunks: number;
};
type LYDownloadFailedEvent = {
    error: Error;
    fileId: string;
    fileName?: string;
    blob?: Blob;
};
type LYUploadEvents = {
    upload_failed(event: LYUploadFailedEvent): void;
    download_failed(event: LYDownloadFailedEvent): void;
};
export interface LYDownloadResult {
    blob: Blob;
    fileName: string;
    contentType: string;
    totalSize: number;
}
export declare class LYAppHttpClient extends LYHttpClient {
    on: LYEvents<LYUploadEvents>['on'];
    off: LYEvents<LYUploadEvents>['on'];
    once: LYEvents<LYUploadEvents>['on'];
    addListener: LYEvents<LYUploadEvents>['on'];
    removeListener: LYEvents<LYUploadEvents>['on'];
    emit: LYEvents<LYUploadEvents>['emit'];
    private _headerProvider;
    constructor(app_name: string, headerProvider: IHeaderProvider);
    protected _getUrl(url: string): string;
    protected _get_headers(): Record<string, string> | undefined;
    _request<T extends LYBaseResponse>(config?: LYHttpRequestConfig): Promise<LYResultResponse<T> | AxiosResponse<any> | undefined>;
    /**
     * 上传文件
     */
    uploadFile(params: LYUploadParams, config?: LYHttpRequestConfig): Promise<LYResultResponse<LYUploadResponse>>;
    /**
     * 分块上传文件
     */
    uploadFileInChunks(params: LYUploadParams, config?: LYHttpRequestConfig & {
        chunkSize?: number;
        onProgress?: (progress: number) => void;
        startChunkIndex?: number;
    }): Promise<LYUploadResponse>;
    download(fileId: string, fileName?: string, config?: LYHttpRequestConfig & {
        chunkSize?: number;
        onProgress?: (progress: number) => void;
        resumeFromByte?: number;
    }): Promise<LYDownloadResult>;
    downloadFile(fileId: string, fileName?: string, config?: LYHttpRequestConfig): Promise<void>;
    /**
     * SSE流式请求 - 字符串格式
     * @param url 请求URL
     * @param config SSE配置选项
     * @returns AsyncGenerator<string>，生成原始字符串数据
     */
    stream(url: string, config?: LYSSEConfig): AsyncGenerator<string>;
    /**
     * SSE流式请求 - Uint8Array格式
     * @param url 请求URL
     * @param config SSE配置选项
     * @returns AsyncGenerator<Uint8Array>，生成字节数组数据
     */
    stream(url: string, config?: LYSSEConfig): AsyncGenerator<Uint8Array>;
    /**
     * SSE流式请求 - JSON格式
     * @param url 请求URL
     * @param config SSE配置选项
     * @returns AsyncGenerator<T>，生成JSON解析后的数据
     */
    stream<T>(url: string, config?: LYSSEConfig): AsyncGenerator<T>;
    /**
     * 智能解析数据块
     * 根据调用上下文的泛型类型自动选择解析方式
     */
    private parseChunk;
}
export declare class LYTenantHttpClient extends LYAppHttpClient {
    static getTenantName(): string;
    protected _getUrl(url: string): string;
}
export {};
