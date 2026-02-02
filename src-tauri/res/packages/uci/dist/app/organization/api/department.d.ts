import type { LYRangeQueryParams, LYAppHttpClient, LYBaseResponse, LYListResponse } from '../../../http';
interface LYDepartmentQueryParams extends LYRangeQueryParams {
    name_or_code?: string;
    parent_id?: string;
    user_id?: string;
    manager_only?: boolean;
}
interface LYDepartmentResponse extends LYBaseResponse {
    id: string;
    name: string;
    description: string;
    parent_id: string;
    path: string;
    code: string;
    sort: number;
}
interface LYDepartmentParentRequest {
    id: string;
    path: string;
}
interface LYDepartmentPostRequest {
    name: string;
    description?: string;
    code?: string;
    sort?: number;
    parent?: LYDepartmentParentRequest;
}
interface LYDepartmentPatchRequest {
    name?: string;
    description?: string;
    code?: string;
    sort?: number;
    parent?: LYDepartmentParentRequest;
}
export declare class LYDepartmentApi {
    private _httpClient;
    constructor(httpClient: LYAppHttpClient);
    query(params: LYDepartmentQueryParams): Promise<LYListResponse<LYDepartmentResponse>>;
    get(id: string): Promise<LYDepartmentResponse | undefined>;
    add(department: LYDepartmentPostRequest): Promise<string>;
    update(id: string, department: LYDepartmentPatchRequest): Promise<number>;
    remove(id: string): Promise<number>;
}
export {};
