import { Dropdown, Button, Menu } from '@arco-design/web-react';
import { IconSearch, IconSettings, IconFolder, IconSync, IconRefresh } from '@arco-design/web-react/icon';

interface SettingsDropdownProps {
  onEnvironmentCheck: () => void;
  onChangeWorkspace?: () => void;
  onReinitWorkspace?: () => void;
  onUpdateWorkspace?: () => void;
  hasWorkspace?: boolean;
}

function SettingsDropdown({
  onEnvironmentCheck,
  onChangeWorkspace,
  onReinitWorkspace,
  onUpdateWorkspace,
  hasWorkspace = false
}: SettingsDropdownProps) {
  const handleClickMenu = (key: string) => {
    switch (key) {
      case 'env-check':
        onEnvironmentCheck();
        break;
      case 'change-workspace':
        onChangeWorkspace?.();
        break;
      case 'reinit-workspace':
        onReinitWorkspace?.();
        break;
      case 'update-workspace':
        onUpdateWorkspace?.();
        break;
      default:
        break;
    }
  };

  const dropdownList = [
    ...(hasWorkspace ? [
      { key: 'reinit-workspace', name: '重新初始化', icon: <IconSync /> },
      { key: 'update-workspace', name: '更新仓库', icon: <IconRefresh /> }
    ] : []),
    { key: 'change-workspace', name: '切换工作空间', icon: <IconFolder /> },
    { key: 'env-check', name: '环境检测', icon: <IconSearch /> },
  ];

  return (
    <Dropdown
      trigger="click"
      position="bottom"
      droplist={
        <Menu onClickMenuItem={handleClickMenu}>
          {dropdownList.map((item) => (
            <Menu.Item key={item.key}>
              <span style={{ marginRight: '8px' }}>{item.icon}</span>
              {item.name}
            </Menu.Item>
          ))}
        </Menu>
      }
    >
      <Button
        type="text"
        icon={<IconSettings />}
        style={{ color: '#666' }}
      />
    </Dropdown>
  );
}

export default SettingsDropdown;
