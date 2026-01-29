import React, { useState, useEffect } from 'react';
import { Modal, Button, Progress, Typography, Space, List, Tag, Message } from '@arco-design/web-react';
import { IconCheckCircle, IconCloseCircle, IconLoading, IconSync } from '@arco-design/web-react/icon';
import { invoke } from '@tauri-apps/api/tauri';
import './WorkspaceInitModal.css';

const { Text } = Typography;

type StepStatus = 'pending' | 'running' | 'success' | 'error';

interface InitStep {
  key: string;
  title: string;
  description: string;
  status: StepStatus;
  error?: string;
}

interface WorkspaceInitModalProps {
  visible: boolean;
  workspacePath: string;
  onComplete: (success: boolean) => void;
}

function WorkspaceInitModal({ visible, workspacePath, onComplete }: WorkspaceInitModalProps) {
  const [steps, setSteps] = useState<InitStep[]>([
    { key: 'clone-main', title: '克隆主仓库', description: '克隆 laiye-monorepo-scaffold', status: 'pending' },
    { key: 'clone-app', title: '克隆应用仓库', description: '克隆 laiye-adp 到 apps 目录', status: 'pending' },
    { key: 'copy-resources', title: '复制资源文件', description: '复制 packages 资源到项目', status: 'pending' },
    { key: 'install-deps', title: '安装依赖', description: '运行 pnpm install:all', status: 'pending' },
    { key: 'config-env', title: '配置环境', description: '复制环境配置文件', status: 'pending' },
  ]);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const updateStepStatus = (key: string, status: StepStatus, error?: string): void => {
    setSteps(prev => prev.map(step =>
      step.key === key ? { ...step, status, error } : step
    ));
  };

  const calculateProgress = (): number => {
    const completedSteps = steps.filter(s => s.status === 'success' || s.status === 'error').length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  const initializeWorkspace = async (): Promise<void> => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // 步骤1: 克隆主仓库
      updateStepStatus('clone-main', 'running');
      setCurrentProgress(10);
      await invoke('clone_main_repo', { workspacePath });
      updateStepStatus('clone-main', 'success');
      setCurrentProgress(30);

      // 步骤2: 克隆应用仓库
      updateStepStatus('clone-app', 'running');
      setCurrentProgress(40);
      await invoke('clone_app_repo', { workspacePath });
      updateStepStatus('clone-app', 'success');
      setCurrentProgress(55);

      // 步骤3: 复制资源文件
      updateStepStatus('copy-resources', 'running');
      setCurrentProgress(60);
      await invoke('copy_resources', { workspacePath });
      updateStepStatus('copy-resources', 'success');
      setCurrentProgress(70);

      // 步骤4: 安装依赖
      updateStepStatus('install-deps', 'running');
      setCurrentProgress(75);
      await invoke('install_dependencies', { workspacePath });
      updateStepStatus('install-deps', 'success');
      setCurrentProgress(90);

      // 步骤5: 配置环境
      updateStepStatus('config-env', 'running');
      setCurrentProgress(95);
      await invoke('config_environment', { workspacePath });
      updateStepStatus('config-env', 'success');
      setCurrentProgress(100);

      Message.success('工作空间初始化完成！');
      setTimeout(() => {
        onComplete(true);
      }, 1000);
    } catch (error) {
      console.error('初始化失败:', error);
      Message.error(`初始化失败: ${error}`);

      // 找到当前正在运行的步骤并标记为失败
      const failedStep = steps.find(s => s.status === 'running');
      if (failedStep) {
        updateStepStatus(failedStep.key, 'error', String(error));
      }

      setTimeout(() => {
        onComplete(false);
      }, 2000);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (visible && !isProcessing) {
      // 重置状态
      setSteps(steps.map(step => ({ ...step, status: 'pending' as StepStatus, error: undefined })));
      setCurrentProgress(0);

      // 开始初始化
      initializeWorkspace();
    }
  }, [visible]);

  const getStepIcon = (status: StepStatus): React.ReactNode => {
    switch (status) {
      case 'running':
        return <IconLoading className="step-icon-running" />;
      case 'success':
        return <IconCheckCircle className="step-icon-success" />;
      case 'error':
        return <IconCloseCircle className="step-icon-error" />;
      default:
        return <div className="step-icon-pending" />;
    }
  };

  const getStepStatusText = (status: StepStatus): string => {
    switch (status) {
      case 'running':
        return '进行中...';
      case 'success':
        return '完成';
      case 'error':
        return '失败';
      default:
        return '等待中';
    }
  };

  const hasError = steps.some(step => step.status === 'error');
  const allSuccess = steps.every(step => step.status === 'success');

  return (
    <Modal
      title="初始化工作空间"
      visible={visible}
      footer={null}
      closable={!isProcessing}
      onCancel={() => !isProcessing && onComplete(false)}
      style={{ width: '700px' }}
      className="workspace-init-modal"
    >
      <div className="init-container">
        <div className="init-header">
          <Text>正在初始化工作空间: {workspacePath}</Text>
        </div>

        <div className="progress-section">
          <Progress
            percent={currentProgress}
            status={hasError ? 'error' : allSuccess ? 'success' : 'normal'}
            animation={!hasError && !allSuccess}
          />
          <Text style={{ marginTop: 8, display: 'block', textAlign: 'center' }}>
            {hasError ? '初始化失败' : allSuccess ? '初始化完成' : '正在初始化...'}
          </Text>
        </div>

        <List
          className="steps-list"
          dataSource={steps}
          render={(item: InitStep) => (
            <List.Item
              key={item.key}
              className={`step-item step-${item.status}`}
            >
              <Space size="large" style={{ width: '100%' }}>
                <div className="step-icon-wrapper">
                  {getStepIcon(item.status)}
                </div>
                <div className="step-content" style={{ flex: 1 }}>
                  <div className="step-header">
                    <Text bold>{item.title}</Text>
                    <Tag
                      color={item.status === 'success' ? 'green' : item.status === 'error' ? 'red' : item.status === 'running' ? 'blue' : 'gray'}
                    >
                      {getStepStatusText(item.status)}
                    </Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {item.description}
                  </Text>
                  {item.error && (
                    <Text type="error" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                      错误: {item.error}
                    </Text>
                  )}
                </div>
              </Space>
            </List.Item>
          )}
        />

        {hasError && !isProcessing && (
          <div className="modal-actions">
            <Space>
              <Button
                type="primary"
                size="large"
                icon={<IconSync />}
                onClick={() => {
                  setSteps(steps.map(step => ({ ...step, status: 'pending' as StepStatus, error: undefined })));
                  setCurrentProgress(0);
                  initializeWorkspace();
                }}
              >
                重试
              </Button>
              <Button
                size="large"
                onClick={() => onComplete(false)}
              >
                取消
              </Button>
            </Space>
          </div>
        )}

        {allSuccess && !isProcessing && (
          <div className="modal-actions">
            <Button
              type="primary"
              size="large"
              onClick={() => onComplete(true)}
            >
              完成
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default WorkspaceInitModal;
