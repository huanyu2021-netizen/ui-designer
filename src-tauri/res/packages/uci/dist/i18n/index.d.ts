import type { TOptions } from 'i18next';
import type { ILYEvents, LYEvents } from '../object';
import { LYObject } from '../object';
type LYTranslateOptions = TOptions;
export type LYTranslateMethod = (key: string, options?: LYTranslateOptions) => string;
type LYi18nEvents = {
    ['lang-changed'](lang: string): void;
};
export declare enum LYLangEnum {
    'zh-CN' = "\u7B80\u4F53\u4E2D\u6587",
    'en-US' = "English"
}
export type LYKeyofLang = keyof typeof LYLangEnum;
export declare const langKeys: LYKeyofLang[];
export declare const languages: Partial<Record<LYKeyofLang, string>>;
export interface ILYi18n extends ILYEvents<LYi18nEvents> {
    readonly lang: LYKeyofLang;
    readonly languages: Partial<Record<LYKeyofLang, string>>;
    getUrlResource(url: string): Promise<Object | undefined>;
    loadResource(urlOrJson: string | object, lang?: LYKeyofLang): Promise<void>;
    changeLanguage(lang: LYKeyofLang): Promise<void>;
    t: LYTranslateMethod;
}
export declare const LANG_KEY = "lang";
export declare class LYi18n extends LYObject implements ILYi18n {
    on: LYEvents<LYi18nEvents>['on'];
    off: LYEvents<LYi18nEvents>['on'];
    once: LYEvents<LYi18nEvents>['on'];
    emit: LYEvents<LYi18nEvents>['emit'];
    private _namespace;
    private _lang;
    constructor(namespace?: string);
    get t(): LYTranslateMethod;
    get lang(): LYKeyofLang;
    get languages(): Partial<Record<LYKeyofLang, string>>;
    get namespace(): string;
    initialize(): Promise<void>;
    private fallbackLng;
    /**
     * 解析当前环境语言
     * @returns 解析得到的语言
     * @private
     */
    private resolveLanguage;
    loadResource(urlOrJson: string | object, lang?: LYKeyofLang, namespace?: string): Promise<void>;
    getUrlResource(resourceUrl: string): Promise<object | undefined>;
    changeLanguage(lang: LYKeyofLang): Promise<void>;
    getResource(key: string, lang?: string): Record<string, string>;
}
export {};
