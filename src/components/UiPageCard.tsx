import { Card, Dropdown, Button, Menu, Message } from "@arco-design/web-react";
import { IconPalette, IconMore, IconCopy } from "@arco-design/web-react/icon";

interface UiPageCardProps {
  name: string;
  path: string;
  workspacePath: string;
  onOpen: (name: string) => void;
  onDelete: (name: string) => void;
}

function UiPageCard({ name, path, workspacePath, onOpen, onDelete }: UiPageCardProps) {
  const handleClickMenu = (key: string) => {
    if (key === "delete") {
      if (
        confirm(`确定要删除页面 "${name}" 吗？此操作将删除该页面的文件夹。`)
      ) {
        onDelete(name);
      }
    } else if (key === "copy-prompt") {
      const prompt = `文件夹已经有了，请接着在该文件夹（src\\ui-pages\\${name}\\index.tsx）使用子Agent **ui-designer** 进行UI设计`;
      navigator.clipboard.writeText(prompt).then(() => {
        Message.success("提示词已复制到剪贴板");
      }).catch(() => {
        Message.error("复制失败");
      });
    }
  };

  return (
    <Card
      hoverable
      onClick={() => onOpen(name)}
      style={{ cursor: "pointer", position: "relative" }}
      className="ui-page-card"
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <IconPalette style={{ fontSize: "32px", color: "#667eea" }} />
        <div style={{ flex: 1 }}>
          <div
            style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}
          >
            {name}
          </div>
          <div style={{ fontSize: "12px", color: "#999" }}>
            /ui-pages/{name}
          </div>
        </div>
        <Dropdown
          trigger="click"
          position="bottom"
          droplist={
            <Menu
              onClickMenuItem={(k, e) => {
                e.stopPropagation();
                handleClickMenu(k);
              }}
            >
              <Menu.Item key="copy-prompt">
                <span style={{ marginRight: "8px" }}><IconCopy style={{ fontSize: "14px" }} /></span>
                复制提示词
              </Menu.Item>
              <Menu.Item key="delete" style={{ color: "rgb(var(--danger-6))" }}>
                删除
              </Menu.Item>
            </Menu>
          }
        >
          <Button
            type="text"
            icon={<IconMore />}
            size="small"
            style={{ color: "#999" }}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      </div>
    </Card>
  );
}

export default UiPageCard;
