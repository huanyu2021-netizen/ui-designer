import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Button, Typography, Space, List, Divider, Message } from '@arco-design/web-react';
import { IconCheckCircle, IconExclamationCircle, IconRefresh, IconLink } from '@arco-design/web-react/icon';
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/shell';
import './EnvironmentCheckModal.css';

const { Text } = Typography;

interface EnvironmentCheck {
  node_installed: boolean;
  node_version?: string;
  node_version_valid: boolean;
  pnpm_installed: boolean;
  pnpm_version?: string;
  git_embedded: boolean;  // Git is now embedded in the application
  claude_installed: boolean;
  claude_version?: string;
  missing_tools: string[];
}

interface ToolItem {
  name: string;
  installed: boolean;
  version?: string;
  valid: boolean;
  required: string;
  embedded?: boolean;  // 标记是否为内置工具
}

interface EnvironmentCheckModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCheckComplete?: (result: EnvironmentCheck) => void;
}

function EnvironmentCheckModal({ visible, onConfirm, onCheckComplete }: EnvironmentCheckModalProps) {
  const [envCheck, setEnvCheck] = useState<EnvironmentCheck | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [installingTool, setInstallingTool] = useState<string | null>(null);

  const checkEnvironment = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const result = await invoke<EnvironmentCheck>('check_environment');
      console.log('环境检测结果:', result);
      setEnvCheck(result);
      // 通知父组件环境检测完成
      if (onCheckComplete) {
        onCheckComplete(result);
      }
    } catch (error) {
      console.error('环境检测失败:', error);
    } finally {
      setLoading(false);
    }
  }, [onCheckComplete]);

  useEffect(() => {
    if (visible) {
      checkEnvironment();
    }
  }, [visible, checkEnvironment]);

  const handleInstallSingle = async (toolName: string): Promise<void> => {
    setInstallingTool(toolName);
    try {
      const result = await invoke<{ message: string }>('install_tool', { toolName });
      Message.success(result.message);
      // 重新检测环境
      setTimeout(() => {
        checkEnvironment();
      }, 1000);
    } catch (error) {
      Message.error(`安装 ${toolName} 失败: ${error}`);
    } finally {
      setInstallingTool(null);
    }
  };

  const renderEnvironmentStatus = (): React.ReactNode => {
    if (loading) {
      return <div className="loading-text">正在检测环境...</div>;
    }

    if (!envCheck) {
      return <div className="error-text">环境检测失败</div>;
    }

    const allToolsInstalled = envCheck.missing_tools.length === 0;

    return (
      <div className="environment-status">
        <div className={`status-badge ${allToolsInstalled ? 'success' : 'warning'}`}>
          {allToolsInstalled ? <IconCheckCircle /> : <IconExclamationCircle />}
          {allToolsInstalled ? ' 环境检查通过' : ' 缺少必要的开发工具'}
        </div>

        <Divider />

        <List
          dataSource={[
            {
              name: 'Node.js',
              installed: envCheck.node_installed,
              version: envCheck.node_version,
              valid: envCheck.node_version_valid,
              required: '版本 >= 20'
            },
            {
              name: 'pnpm',
              installed: envCheck.pnpm_installed,
              version: envCheck.pnpm_version,
              valid: true,
              required: '最新版本'
            },
            {
              name: 'Git',
              installed: envCheck.git_embedded,
              version: '内置版本',
              valid: true,
              required: '已内置在应用中',
              embedded: true  // 标记为内置工具
            },
            {
              name: 'Claude',
              installed: envCheck.claude_installed,
              version: envCheck.claude_version,
              valid: true,
              required: '必要工具'
            }
          ]}
          render={(item: ToolItem) => (
            <List.Item
              key={item.name}
              className={`tool-item ${item.installed && item.valid ? 'installed' : 'missing'}`}
              actions={
                !item.installed || !item.valid
                  ? item.name === 'Claude'
                    ? [<Button key="install" type="text" size="small" icon={<IconLink />} onClick={() => open('https://laiye-tech.feishu.cn/wiki/QS9qwKjAMiG4SmkFxquc1FUdnFg')}>
                        查看安装指南
                      </Button>]
                    : !item.embedded ? [<Button
                        key="install"
                        type="primary"
                        size="small"
                        loading={installingTool === item.name}
                        disabled={installingTool !== null}
                        onClick={() => handleInstallSingle(item.name)}
                      >
                        {installingTool === item.name ? `正在安装 ${item.name}...` : `安装 ${item.name}`}
                      </Button>] : undefined
                  : undefined
              }
            >
              <Space>
                <span className="tool-name">{item.name}</span>
                <span className="tool-required">({item.required})</span>
                {item.embedded ? (
                  <Text type="success">✓ 内置版本</Text>
                ) : item.installed && item.valid ? (
                  <Text type="success">✓ 已安装 {item.version}</Text>
                ) : item.installed && !item.valid ? (
                  <Text type="warning">⚠ 版本过低 {item.version}</Text>
                ) : (
                  <Text type="error">✗ 未安装</Text>
                )}
              </Space>
            </List.Item>
          )}
        />

        {!allToolsInstalled && (
          <>
            <Divider />
            <div className="missing-tools">
              <Text bold>缺少以下工具:</Text>
              <ul>
                {envCheck.missing_tools.map((tool: string, index: number) => (
                  <li key={index}>{tool}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    );
  };

  const allToolsInstalled = envCheck && envCheck.missing_tools.length === 0;

  return (
    <Modal
      title="环境检测"
      visible={visible}
      onCancel={onConfirm}
      footer={null}
      style={{ width: '600px' }}
      className="environment-check-modal"
    >
      {renderEnvironmentStatus()}

      {!loading && (
        <div className="modal-actions">
          <Space>
            <Button
              type="outline"
              size="large"
              icon={<IconRefresh />}
              onClick={checkEnvironment}
            >
              刷新检测
            </Button>
{/*
            {!allToolsInstalled && (
              <Button type="primary" size="large" onClick={handleInstallAll}>
                一键安装所有工具
              </Button>
            )} */}

            {allToolsInstalled && (
              <Button type="primary" size="large" onClick={onConfirm}>
                继续
              </Button>
            )}
          </Space>
        </div>
      )}
    </Modal>
  );
}

export default EnvironmentCheckModal;
