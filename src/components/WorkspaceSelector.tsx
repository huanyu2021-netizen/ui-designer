import React, { useState, useEffect } from 'react';
import { Modal, Button, Typography, Space, Alert, Input, Card, Message } from '@arco-design/web-react';
import { IconCheckCircle, IconInfo, IconFolder } from '@arco-design/web-react/icon';
import { open } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api/tauri';
import { debounce } from '../utils/debounce';
import './WorkspaceSelector.css';

const { Text } = Typography;

interface WorkspaceValidation {
  valid: boolean;
  path: string;
  is_empty: boolean;
  is_laiye_scaffold: boolean;
  error?: string;
}

interface WorkspaceSelectorProps {
  visible: boolean;
  onConfirm: (path?: string) => void;
  onInit?: (path: string) => void;
  workspacePath: string;
}

function WorkspaceSelector({ visible, onConfirm, onInit, workspacePath }: WorkspaceSelectorProps) {
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [validation, setValidation] = useState<WorkspaceValidation | null>(null);

  const validatePath = debounce(async (path: string): Promise<void> => {
    try {
      const result = await invoke<WorkspaceValidation>('validate_workspace', { path });
      setValidation(result);

      if (result.valid) {
        Message.success('工作空间验证成功！');
        // 保存到 localStorage
        localStorage.setItem('workspace_path', path);
      }
    } catch (error) {
      Message.error(`验证失败: ${error}`);
      setValidation({
        valid: false,
        path,
        is_empty: false,
        is_laiye_scaffold: false,
        error: String(error)
      });
    }
  }, 300);

  const handleSelectFolder = async (): Promise<void> => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: '选择工作空间文件夹'
      });

      if (selected && typeof selected === 'string') {
        setSelectedPath(selected);
        await validatePath(selected);
      }
    } catch (error) {
      Message.error(`选择文件夹失败: ${error}`);
    }
  };

  useEffect(() => {
    if (workspacePath) {
      setSelectedPath(workspacePath);
      validatePath(workspacePath);
    }
  }, [workspacePath]);

  const handleConfirm = (): void => {
    if (validation && validation.valid) {
      // 如果是空文件夹，触发初始化
      if (validation.is_empty && onInit) {
        onInit(selectedPath);
      } else {
        onConfirm(selectedPath);
      }
    } else {
      Message.warning('请先选择一个有效的工作空间文件夹');
    }
  };

  const handleInit = (): void => {
    if (validation && validation.is_empty && onInit) {
      onInit(selectedPath);
    }
  };

  const renderValidationStatus = (): React.ReactNode | null => {
    if (!validation) {
      return null;
    }

    if (validation.valid) {
      return (
        <Alert
          type="success"
          icon={<IconCheckCircle />}
          title="工作空间验证通过"
          content={
            <div>
              <p>路径: {validation.path}</p>
              {validation.is_laiye_scaffold && (
                <p>类型: laiye-monorepo-scaffold 项目</p>
              )}
              {validation.is_empty && (
                <p>类型: 空文件夹（将初始化新项目）</p>
              )}
            </div>
          }
        />
      );
    }

    return (
      <Alert
        type="error"
        title="工作空间验证失败"
        content={validation.error || '未知错误'}
      />
    );
  };

  return (
    <Modal
      title="选择工作空间"
      visible={visible}
      onCancel={() => onConfirm()}
      footer={null}
      style={{ width: '700px' }}
      className="workspace-selector-modal"
    >
      <div className="workspace-selector-content">
        <Alert
          type="info"
          icon={<IconInfo />}
          title="工作空间要求"
          content="请选择一个空文件夹，或者名为 laiye-monorepo-scaffold 的项目文件夹"
          style={{ marginBottom: 20 }}
        />

        <Card className="path-selector-card">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text bold>已选择的文件夹：</Text>
              <Input
                value={selectedPath}
                placeholder="点击下方按钮选择文件夹"
                readOnly
                addAfter={
                  <Button
                    type="outline"
                    icon={<IconFolder />}
                    onClick={handleSelectFolder}
                  >
                    浏览文件夹
                  </Button>
                }
                style={{ marginTop: 8 }}
              />
            </div>

            {renderValidationStatus()}
          </Space>
        </Card>

        <div className="workspace-actions">
          <Space>
            {validation && validation.is_empty ? (
              <>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleInit}
                >
                  初始化工作空间
                </Button>
                <Button
                  size="large"
                  onClick={() => onConfirm()}
                >
                  跳过
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="primary"
                  size="large"
                  disabled={!validation || !validation.valid}
                  onClick={handleConfirm}
                >
                  确认选择
                </Button>
                <Button
                  size="large"
                  onClick={() => onConfirm()}
                >
                  跳过
                </Button>
              </>
            )}
          </Space>
        </div>
      </div>
    </Modal>
  );
}

export default WorkspaceSelector;
