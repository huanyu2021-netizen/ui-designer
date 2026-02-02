import type { LYRangeQueryParams, LYAppHttpClient, LYBaseResponse, LYListResponse } from '../../../http';
export type LYChannelType = 'email' | 'inbox' | 'external';
interface LYChannelQueryParams extends LYRangeQueryParams {
    name?: string;
    type?: LYChannelType;
    enabled?: boolean;
}
interface LYChannelResponse extends LYBaseResponse {
    id: string;
    created_at: Date;
    updated_at: Date;
    updated_by: string;
    name: string;
    description: string;
    type: LYChannelType;
    config: Record<string, any>;
    enabled: boolean;
}
interface LYChannelPostRequest {
    name: string;
    description: string;
    type: string;
    config: Record<string, any>;
    enabled: boolean;
}
interface LYChannelPatchRequest {
    name: string;
    description: string;
    type: string;
    config: Record<string, any>;
    enabled: boolean;
}
export declare class LYChannelApi {
    private _httpClient;
    constructor(httpClient: LYAppHttpClient);
    query(params: LYChannelQueryParams): Promise<LYListResponse<LYChannelResponse>>;
    get(id: string): Promise<LYChannelResponse | undefined>;
    add(channel: LYChannelPostRequest): Promise<string>;
    update(id: string, channel: LYChannelPatchRequest): Promise<number>;
    remove(id: string): Promise<number>;
}
interface LYNotificationVariableResponse extends LYBaseResponse {
    name: string;
    caption: string;
    description: string;
}
interface LYNotificationMetaInfoResponse extends LYBaseResponse {
    type_caption: string;
    variables: LYNotificationVariableResponse[];
}
interface LYNotificationMetaResponse extends LYBaseResponse {
    id: string;
    created_at: Date;
    updated_at: Date;
    updated_by: string;
    type: string;
    meta: LYNotificationMetaInfoResponse;
}
interface LYNotificationTemplateQueryParams extends LYRangeQueryParams {
    user_id: string;
    name?: string;
    type?: string;
    language?: string;
}
interface LYNotificationTemplateResponse extends LYBaseResponse {
    user_id: string;
    name: string;
    description: string;
    type: string;
    language: string;
    content: string;
}
interface LYNotificationTemplatePostRequest {
    user_id: string;
    name: string;
    description: string;
    type: string;
    language: string;
    content: string;
}
interface LYNotificationTemplatePatchRequest {
    name: string;
    description: string;
    type: string;
    language: string;
    content: string;
}
export declare class LYNotificationApi {
    private _httpClient;
    constructor(httpClient: LYAppHttpClient);
    getMeta(): Promise<LYNotificationMetaResponse | undefined>;
    queryTemplates(params: LYNotificationTemplateQueryParams): Promise<LYListResponse<LYNotificationTemplateResponse>>;
    getTemplate(id: string): Promise<LYNotificationTemplateResponse | undefined>;
    addTemplate(template: LYNotificationTemplatePostRequest): Promise<string>;
    updateTemplate(id: string, template: LYNotificationTemplatePatchRequest): Promise<number>;
    removeTemplate(id: string): Promise<number>;
}
export {};
