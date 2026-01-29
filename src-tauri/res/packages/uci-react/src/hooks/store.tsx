import { ILYStorage, ILYStorageSync } from "@monorepo/uci";
import { useEffect, useState } from "react";

type DispatchSync<A> = (value: A) => void;

export function useStoreSync<T>(
    store: ILYStorageSync,
    key: string,
    defaultValue: T
): [T, DispatchSync<T>] {
    const [value, setValue] = useState<T>(store.getSync(key) || defaultValue);

    const handleSetValue = (value: T): void => {
        store.setSync(key, value);
        setValue(value);
    };

    const handleChange = (event: { key: string; value: T }) => {
        if (event.key !== key) return;
        setValue(event.value);
    };

    useEffect(() => {
        store.on('changed', handleChange);
        return () => {
            store.off('changed', handleChange);
        };
    }, []);

    return [value, handleSetValue];
}

type Dispatch<A> = (value: A) => Promise<void>;

export function useStore<T>(
    store: ILYStorage,
    key: string,
    defaultValue: T
): [T, Dispatch<T>, boolean, Error | undefined] {
    const [value, setValue] = useState<T>(defaultValue);
    const [isPending, setIsPending] = useState<boolean>(true);
    const [error, setError] = useState<Error | undefined>();

    const handleSetValue = async (value: T): Promise<void> => {
        await store.set(key, value);
        setValue(value);
    };

    const handleChange = (event: { key: string; value: T }) => {
        if (event.key !== key) return;
        setValue(event.value);
    };

    useEffect(() => {
        (async () => {
            try {
                const val = (await store.get(key)) as T;
                val && setValue(val);
            } catch (err) {
                setError(err instanceof Error ? err : new Error(String(err)));
            } finally {
                setIsPending(false);
            }
        })();

        store.on('changed', handleChange);
        return () => {
            store.off('changed', handleChange);
        };
    }, []);

    return [value, handleSetValue, isPending, error];
}
