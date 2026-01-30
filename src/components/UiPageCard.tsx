import { useState } from "react";
import { Card, Dropdown, Button, Menu, Message, Modal, Input, Typography } from "@arco-design/web-react";
import { IconPalette, IconMore, IconCopy, IconPushpin } from "@arco-design/web-react/icon";
import { invoke } from "@tauri-apps/api/tauri";

const { Text } = Typography;

interface UiPageCardProps {
  name: string;
  path: string;
  workspacePath: string;
  onOpen: (name: string) => void;
  onDelete: (name: string) => void;
}

function UiPageCard({ name, path, workspacePath, onOpen, onDelete }: UiPageCardProps) {
  const [showGitModal, setShowGitModal] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");
  const [committing, setCommitting] = useState(false);
  const [commitError, setCommitError] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [checkingChanges, setCheckingChanges] = useState(true);

  // 检查页面是否有改动
  const checkChanges = async () => {
    setCheckingChanges(true);
    try {
      const result = await invoke<boolean>("git_has_ui_page_changes", {
        workspacePath,
        pageName: name
      });
      setHasChanges(result);
    } catch {
      setHasChanges(false);
    } finally {
      setCheckingChanges(false);
    }
  };

  // 处理下拉菜单显示/隐藏
  const handleDropdownVisibleChange = (visible: boolean) => {
    if (visible) {
      // 菜单打开时检测改动
      checkChanges();
    }
  };

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
    } else if (key === "git-commit") {
      setShowGitModal(true);
      setCommitMessage("");
      setCommitError("");
    }
  };

  const handleGitCommit = async () => {
    if (!commitMessage.trim()) {
      setCommitError("请填写提交说明");
      return;
    }

    setCommitting(true);
    setCommitError("");

    try {
      const result = await invoke<string>("git_commit_and_push_ui_page", {
        workspacePath,
        pageName: name,
        message: commitMessage.trim()
      });
      Message.success(result);
      setShowGitModal(false);
      setCommitMessage(""); // 清空输入框
      // 提交成功后重新检查改动状态
      await checkChanges();
    } catch (error) {
      const errorMsg = String(error);
      setCommitError(errorMsg);

      // 特殊处理"没有改动"的错误
      if (errorMsg.includes("没有改动") || errorMsg.includes("nothing to commit")) {
        Message.warning("当前页面没有需要提交的改动");
        setShowGitModal(false);
        await checkChanges();
      } else {
        Message.error(`Git 提交失败: ${errorMsg}`);
      }
    } finally {
      setCommitting(false);
    }
  };

  return (
    <>
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
            onVisibleChange={handleDropdownVisibleChange}
            droplist={
              <Menu
                onClick={(e) => e.stopPropagation()}
                onClickMenuItem={(k, e) => {
                  e.stopPropagation();
                  handleClickMenu(k);
                }}
              >
                <Menu.Item key="copy-prompt">
                  <span style={{ marginRight: "8px" }}><IconCopy style={{ fontSize: "14px" }} /></span>
                  复制提示词
                </Menu.Item>
                <Menu.Item
                  key="git-commit"
                  disabled={checkingChanges || !hasChanges}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span style={{ marginRight: "8px" }}><IconPushpin style={{ fontSize: "14px" }} /></span>
                  Git 提交
                  {!checkingChanges && !hasChanges && (
                    <span style={{ marginLeft: "8px", fontSize: "12px", color: "#999" }}>
                      (无改动)
                    </span>
                  )}
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

      <Modal
        title={`Git 提交页面: ${name}`}
        visible={showGitModal}
        onOk={handleGitCommit}
        onCancel={() => setShowGitModal(false)}
        confirmLoading={committing}
        okText="提交并推送"
        cancelText="取消"
        style={{ width: "600px" }}
        unmountOnExit={false}
      >
        <div style={{ marginBottom: "16px" }}>
          <Text style={{ marginBottom: "8px", display: "block" }}>
            提交说明 <span style={{ color: "rgb(var(--danger-6))" }}>*</span>
          </Text>
          <Input.TextArea
            placeholder="请输入本次提交的说明，例如：添加了新的登录页面设计"
            value={commitMessage}
            onChange={setCommitMessage}
            autoFocus
            rows={4}
            maxLength={200}
            showWordLimit
          />
        </div>
        {commitError && (
          <div style={{
            padding: "12px",
            backgroundColor: "rgb(var(--danger-1))",
            border: "1px solid rgb(var(--danger-3))",
            borderRadius: "4px",
            color: "rgb(var(--danger-6))",
            fontSize: "12px"
          }}>
            <div style={{ fontWeight: 600, marginBottom: "4px" }}>提交失败：</div>
            <div>{commitError}</div>
          </div>
        )}
        <div style={{ marginTop: "12px", fontSize: "12px", color: "#999" }}>
          <div>• 将提交页面文件夹的所有更改到 Git</div>
          <div>• 自动推送到远程仓库的当前分支</div>
        </div>
      </Modal>
    </>
  );
}

export default UiPageCard;
