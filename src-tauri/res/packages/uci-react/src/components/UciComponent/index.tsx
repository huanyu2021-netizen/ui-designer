import React, { FunctionComponent, useEffect, useReducer, useState } from 'react';
import { AppContext } from '../../hooks';
import { i18n } from '../../Locales';
import { Button, Result, Spin } from '@arco-design/web-react';
import { logger, LYBaseApp } from '@monorepo/uci';
import styles from './index.module.less';


export interface IUciComponent<T extends {} = {}> extends FunctionComponent<T> {
    // 应用名称，如：Commander
    appName: string;
    // 组件名称，如:QueueList
    componentName: string;
    // 功能权限Id
    functionId?: string;
    // 自定义数据
    [key: string]: any;
}

export type UciComponentProps<T> = React.PropsWithChildren<{
    appName: string;
    componentName: string;
    remoteProps?: T;
}>;

export function UciComponent<T extends {}>(
    props: UciComponentProps<T>,
): React.ReactElement<any, any> | null {
    const { appName, componentName, remoteProps, children } = props;
    const [Comp, setComp] = useState<IUciComponent<T>>();
    const [error, setError] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [_, rerender] = useReducer((i) => i + 1, 0);

    const loadComponent = async () => {
        logger.debug(`loadComponent ${appName} ${componentName}`);
        setLoading(true);
        setError(false);
        try {
            const findApp = LYBaseApp.get(appName)
            const Component: IUciComponent<T> = await findApp.getComponent(componentName);
            setComp(() => Component)
        } catch (error) {
            logger.error(`load ${appName} ${componentName} error`);
            logger.error(error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadComponent();
    }, [appName, componentName, _]);

    const handleClick = () => {
        rerender();
    };

    const renderContent = () => {
        if (error) {
            return (
                <div className={styles['uci-error-container']}>
                    <Result
                        status="error"
                        title={i18n.t('error')}
                        subTitle={i18n.t('loadError')}
                        extra={
                            <Button type="primary" onClick={handleClick}>
                                {i18n.t('reload')}
                            </Button>
                        }
                    />
                </div>
            );
        } else if (Comp) {
            return (
                <div
                    data-app={appName}
                    data-component={componentName}
                    style={{
                        height: '100%',
                        width: '100%',
                    }}
                >
                    <Comp {...(remoteProps as T)}>{children}</Comp>
                </div>
            );
        } else {
            return (
                <div className={styles['uci-error-container']}>
                    <Result status="500" title={i18n.t('error')} subTitle={i18n.t('notFind')} />
                </div>
            );
        }
    };

    return loading ? (
        <div
            style={{
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Spin />
        </div>
    ) : (
        <>{renderContent()}</>
    );
}

type UciComponentOptions = {
    app: LYBaseApp;
    Container: (children: React.ReactNode) => React.ReactNode;
};

/**
 * 将本地组件包裹后导出成远程组件供其他应用使用
 * @param options 远程组件选项
 * @returns 导出的远程组件
 */
export function UciComponentWrapper<T extends {} = {}>(
    Component: IUciComponent<T>,
    options: UciComponentOptions,
): IUciComponent<T> {
    const { app, Container } = options;

    const RemoteComponent: IUciComponent<T> = (props: T) => {
        let Comp: React.ReactNode  = <Component {...props} />;
        if (Container) {
            Comp = Container(Comp);
        }
        if (app) {
            Comp = <AppContext.Provider value={{ app }}>{Comp}</AppContext.Provider>;
        }
        return Comp;
    };

    RemoteComponent.appName = Component.appName;
    RemoteComponent.componentName = Component.componentName;
    RemoteComponent.functionId = Component.functionId;

    return RemoteComponent;
}