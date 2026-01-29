import React from 'react';
import { LYKeyofLang } from '@monorepo/uci';
import zhCN from '@arco-design/web-react/es/locale/zh-CN';
import enUS from '@arco-design/web-react/es/locale/en-US';
import { ConfigProvider } from '@arco-design/web-react';

const locales = {
    'zh-CN': zhCN,
    'en-US': enUS,
};

type Props = {
    lang: LYKeyofLang;
    children?: React.ReactNode;
};

export const UciConfigProvider: React.FC<Props> = props => {
    const { lang, children } = props;

    return (
        <ConfigProvider locale={locales[lang]}>{children}</ConfigProvider>
    );
};
