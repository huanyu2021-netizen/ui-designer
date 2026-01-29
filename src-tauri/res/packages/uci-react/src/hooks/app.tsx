import { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { LYBaseApp, LYKeyofLang, ILYStorage, ILYStorageSync } from '@monorepo/uci';

export interface LYAppContext {
    app: LYBaseApp;
}

export const AppContext = createContext<LYAppContext | undefined>(undefined);

export function useAppContext() {
    const appContext = useContext(AppContext);
    if (!appContext) {
        throw new Error("useAppContext must be used within AppContext.Provider");
      }
    const i18n = appContext.app.i18n;
    const [_, rerender] = useReducer((i: number) => i + 1, 0);

    useEffect(() => {
        const handleLangChanged = (lang: LYKeyofLang) => {
            rerender();
        };
        i18n.on('lang-changed', handleLangChanged);
        return () => {
            i18n.off('lang-changed', handleLangChanged);
        };
    }, []);

    return appContext;
}

export function useApp<T extends LYBaseApp = LYBaseApp>() {
    const appContext = useContext(AppContext);
    if (!appContext) {
        throw new Error("useApp must be used within AppContext.Provider");
    }
    const app = appContext.app as T;
    const i18n = app.i18n;
    const [_, rerender] = useReducer((i: number) => i + 1, 0);

    useEffect(() => {
        const handleLangChanged = (lang: LYKeyofLang) => {
            rerender();
        };
        i18n.on('lang-changed', handleLangChanged);
        return () => {
            i18n.off('lang-changed', handleLangChanged);
        };
    }, []);

    return app;
}

