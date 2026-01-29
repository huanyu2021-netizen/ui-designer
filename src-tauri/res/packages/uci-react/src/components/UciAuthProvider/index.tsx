import React, { useEffect, useState } from 'react';
import { logger, LYBaseApp, LYOrganizationApp, LYSession, LYTenantSession, ORGANIZATION_APP_NAME, LYRedirectAuthorizer, TENANT_APP_NAME, SSOConfig } from '@monorepo/uci';
import { initI18n } from '../../Locales';
import { i18n } from '../../Locales';
import { Button, Result, Spin } from '@arco-design/web-react';
import { UciConfigProvider } from '../UciConfigProvider'
import { AppContext } from '../../hooks';

/**
 * 构建认证URL的工具函数
 * @param baseUrl 基础URL
 * @param returnUrl 返回URL
 * @returns 完整的认证URL
 */
const buildAuthUrl = (baseUrl: string, returnUrl: string): string => {
    try {
        const url = new URL(baseUrl);
        url.searchParams.set('returnUrl', returnUrl);
        return url.toString();
    } catch {
        // 如果 baseUrl 不是完整URL，降级到字符串拼接
        const separator = baseUrl.includes('?') ? '&' : '?';
        return `${baseUrl}${separator}returnUrl=${encodeURIComponent(returnUrl)}`;
    }
};

const ErrorPage: React.FC = () => {
    const t = i18n.t;

    const handleClick = async () => {
        window.location.reload();
    };

    return (
        <Result
            status="500"
            title={t('uci-react:error')}
            subTitle={t('uci-react:errorTip')}
            extra={
                <Button type="primary" onClick={handleClick}>
                    {t('uci-react:reload')}
                </Button>
            }
        />
    );
};

const Loading: React.FC = () => {
    return (
        <div
            style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Spin />
        </div>
    );
};

type Props = {
    appName: string;
    inTenant?: boolean; // 是否在租户内
    children?: React.ReactNode;
    returnUrl?: string; // 登录成功后跳转的url
};

export const UciAuthProvider: React.FC<Props> = props => {
    const { appName, children, returnUrl, inTenant } = props;
    const [passed, setPassed] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [app, setApp] = useState<LYBaseApp | null>(null);

    // 统一的 SSO 处理函数
    const handleSSO = async (ssoConfig?: SSOConfig): Promise<boolean> => {
        const orgApp = LYBaseApp.get(ORGANIZATION_APP_NAME) as LYOrganizationApp;
        const redirectAuthorizer = orgApp.getAuthorizer('redirect') as LYRedirectAuthorizer;

        try {
            // 传递 sso_config 则启动 SSO 登录，不传则尝试处理 SSO 回调
            const signinArgs: { redirect_uri: string; sso_config?: SSOConfig } = {
                redirect_uri: returnUrl || window.location.href
            };

            if (ssoConfig) {
                signinArgs.sso_config = ssoConfig;
            }

            await redirectAuthorizer.signin(signinArgs);
            return true; // 成功处理
        } catch (error) {
            return false;
        }
    };

    useEffect(() => {
        (async () => {
            try {
                if (passed || error) {
                    return;
                }
                // 初始化uci-react中内置的词条
                await initI18n();
                await LYBaseApp.init();

                // 检查是否有有效会话
                const session = inTenant ? LYTenantSession.get() : LYSession.get();
                if (session) {
                    // 已登录，直接加载应用
                    const targetApp = LYBaseApp.get(appName);
                    await targetApp.load();
                    setApp(targetApp);
                    setPassed(true);
                    return;
                }

                // 未登录，只有在 ORGANIZATION_APP_NAME 模式下才处理 SSO
                if (!inTenant) {
                    const orgApp = LYBaseApp.get(ORGANIZATION_APP_NAME) as LYOrganizationApp;
                    // 先获取登录方式配置
                    const loginWays = await orgApp.sessionApi.getLoginWays();
                    console.log("loginways", loginWays);
                    if (loginWays.sso_list.some(sso => sso.enabled)) {
                        let ssoConfig: SSOConfig | undefined;
                        if (loginWays.sso_list.length === 1 && !loginWays.allow_email_login && !loginWays.allow_phone_login && !loginWays.allow_username_login) {
                            ssoConfig = loginWays.sso_list[0];
                        }
                        const ssoHandled = await handleSSO(ssoConfig);
                        if (ssoHandled) return; // SSO 回调成功，自动跳转
                    }
                }
                // TENANT_APP_NAME 或其他应用保持原有登录方式
                const authApp = LYBaseApp.get(inTenant ? TENANT_APP_NAME : ORGANIZATION_APP_NAME);
                const authUrl = buildAuthUrl(authApp.env.baseUrl + '/', returnUrl || window.location.href);
                window.location.href = authUrl;
            } catch (error) {
                logger.error(`UciAuthProvider error`);
                logger.error(error);
                setError(true);
            }
        })();
    }, [passed, error, appName, inTenant, returnUrl]);

    if (!app) {
        return null;
    }

    return (
        <AppContext.Provider value={{ app }}>
            <UciConfigProvider lang={app.i18n.lang}>{error ? <ErrorPage /> : passed ? <>{children}</> : <Loading />}</UciConfigProvider>
        </AppContext.Provider>
    );
};
