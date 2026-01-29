import { useContext, useEffect, useReducer } from "react";
import { AppContext } from "./app";


export function useI18n() {
    const appContext = useContext(AppContext);
    if (!appContext) {
        throw new Error("useApp must be used within AppContext.Provider");
    }
    const i18n = appContext.app.i18n;
    const [_, rerender] = useReducer((i: number) => i + 1, 0);

    useEffect(() => {
        const handleLangChanged = () => {
            rerender();
        };
        i18n.on('lang-changed', handleLangChanged);
        return () => {
            i18n.off('lang-changed', handleLangChanged);
        };
    }, []);

    return i18n;
}
