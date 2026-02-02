import { LYAppHttpClient, LYBaseResponse } from "../../../http";
interface LYTerm {
    language: string;
    name: string;
}
interface LYGetTermRequest {
    name?: string;
}
interface LYGetTermResponse extends LYTerm, LYBaseResponse {
    content: string;
}
interface LYCreateTermRequest extends LYTerm {
    content: string;
}
interface LYCreateTermResponse extends LYTerm, LYBaseResponse {
    content: string;
}
interface LYBaseResource extends LYTerm {
    content_type: string;
    url: string;
}
export declare class LYOEMApi {
    private _httpClient;
    constructor(httpClient: LYAppHttpClient);
    getTerm(request?: LYGetTermRequest): Promise<LYGetTermResponse>;
    createTerm(request: LYCreateTermRequest): Promise<LYCreateTermResponse>;
    batchUpdate(request: Record<string, string>): Promise<LYCreateTermResponse>;
    update(request: LYCreateTermRequest): Promise<LYCreateTermResponse>;
    delete(request: LYTerm): Promise<{
        count: number;
    }>;
    getResource(request?: LYGetTermRequest): Promise<LYBaseResource>;
    createResource(request: LYBaseResource): Promise<LYBaseResource>;
    updateResource(request: LYBaseResource): Promise<LYBaseResource>;
    deleteResource(request: LYTerm): Promise<{
        count: number;
    }>;
}
export {};
