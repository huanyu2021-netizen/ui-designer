import { LYi18n } from '@monorepo/uci';
import * as enUS from './en-US.json';
import * as zhCN from './zh-CN.json';

export const ns = 'uci-react';
export const i18n = new LYi18n(ns);

let loaded = false;

export const initI18n = async () => {
    if (loaded) {
        return;
    }
    await i18n.initialize();
    await i18n.loadResource(enUS, 'en-US');
    await i18n.loadResource(zhCN, 'zh-CN');
    loaded = true;
};