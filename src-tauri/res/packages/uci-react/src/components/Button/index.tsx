import * as React from 'react';
import { Button as ArcoButton, ButtonProps as ArcoButtonProps } from '@arco-design/web-react';
import { IconLoading } from '@arco-design/web-react/icon';

export type ButtonProps = Omit<ArcoButtonProps, 'type' | 'size' | 'status' | 'disabled' | 'loading'> & {
  /** 按钮类型 */
  type?: 'primary' | 'secondary' | 'dashed' | 'outline' | 'text';
  /** 按钮尺寸 */
  size?: 'mini' | 'small' | 'default' | 'large';
  /** 按钮状态 */
  status?: 'default' | 'warning' | 'success' | 'danger';
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否加载中 */
  loading?: boolean;
  /** 按钮内容 */
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = (props: ButtonProps) => {
  const { 
    loading = false, 
    disabled = false, 
    children, 
    ...restProps 
  } = props;

  // 加载状态时禁用按钮
  const isDisabled = disabled || loading;

  return (
    <ArcoButton 
      {...restProps} 
      disabled={isDisabled}
      loading={loading}
      icon={loading ? <IconLoading /> : undefined}
    >
      {children}
    </ArcoButton>
  );
};
