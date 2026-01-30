import React, { useState, useEffect } from 'react';
import { Modal, Button, Typography, Space, Input, Message, Form } from '@arco-design/web-react';
import { IconSave, IconDelete, IconCheckCircle } from '@arco-design/web-react/icon';

const { Text } = Typography;

interface GitCredentials {
  username: string;
  token: string;
}

interface GitCredentialsModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

function GitCredentialsModal({ visible, onClose, onSaved }: GitCredentialsModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [savedCredentials, setSavedCredentials] = useState<GitCredentials | null>(null);
  const [hasCredentials, setHasCredentials] = useState<boolean>(false);

  // Load saved credentials from localStorage when modal opens
  useEffect(() => {
    if (visible) {
      loadCredentials();
    }
  }, [visible]);

  const loadCredentials = (): void => {
    try {
      const stored = localStorage.getItem('git_credentials');
      if (stored) {
        const creds = JSON.parse(stored) as GitCredentials;
        setSavedCredentials(creds);
        setHasCredentials(true);
        form.setFieldsValue({
          username: creds.username,
          token: creds.token
        });
      } else {
        setHasCredentials(false);
        form.resetFields();
      }
    } catch (error) {
      console.error('Failed to load credentials from localStorage:', error);
      setHasCredentials(false);
    }
  };

  const handleSave = async (values: any): Promise<void> => {
    console.log('开始保存凭据:', values);
    setLoading(true);
    try {
      // Save to localStorage instead of backend
      const creds: GitCredentials = {
        username: values.username,
        token: values.token
      };
      localStorage.setItem('git_credentials', JSON.stringify(creds));

      Message.success('Git 凭据保存成功！');
      setSavedCredentials(creds);
      setHasCredentials(true);
      // 保存成功后关闭弹窗并触发回调
      onClose();
      onSaved?.();
    } catch (error) {
      console.error('保存凭据失败:', error);
      Message.error(`保存失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = (): void => {
    try {
      localStorage.removeItem('git_credentials');
      Message.success('Git 凭据已清除');
      setSavedCredentials(null);
      setHasCredentials(false);
      form.resetFields();
    } catch (error) {
      Message.error(`清除失败: ${error}`);
    }
  };

  return (
    <Modal
      title="Git 凭据设置"
      visible={visible}
      onCancel={onClose}
      footer={null}
      style={{ width: '500px' }}
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          配置 Git 访问令牌以克隆私有仓库。令牌将安全保存在本地。
        </Text>
      </div>

      {hasCredentials && savedCredentials && (
        <div style={{
          padding: '12px',
          marginBottom: '16px',
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae7ff',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <IconCheckCircle style={{ color: '#165DFF', fontSize: '20px' }} />
          <Text>已保存凭据: {savedCredentials.username}</Text>
          <Button
            type="text"
            status="danger"
            size="small"
            icon={<IconDelete />}
            onClick={handleClear}
          >
            清除
          </Button>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onSubmit={handleSave}
        autoComplete="off"
      >
        <Form.Item
          label="Git 用户名"
          field="username"
          rules={[
            { required: true, message: '请输入用户名' }
          ]}
        >
          <Input
            placeholder="例如: username"
            onPressEnter={() => form.submit()}
          />
        </Form.Item>

        <Form.Item
          label={
            <Space>
              <span>密码 / 访问令牌</span>
              <Text type="secondary" style={{ fontSize: 12 }}>
                - Gitea 可直接使用密码，GitHub/GitLab 请使用 Token
              </Text>
            </Space>
          }
          field="token"
          rules={[
            { required: true, message: '请输入密码或访问令牌' }
          ]}
        >
          <Input.Password
            placeholder="密码或 glpat-/ghp_ 开头的令牌"
            onPressEnter={() => form.submit()}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>
              取消
            </Button>
            <Button
              type="primary"
              icon={<IconSave />}
              loading={loading}
              htmlType="submit"
            >
              保存凭据
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <div style={{ marginTop: 16, padding: '12px', backgroundColor: '#f7f8fa', borderRadius: '4px' }}>
        <Text bold style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
          认证说明：
        </Text>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12 }}>
          <li>
            <strong>Gitea:</strong> 直接使用您的账号密码即可
          </li>
        </ul>
      </div>
    </Modal>
  );
}

export default GitCredentialsModal;
