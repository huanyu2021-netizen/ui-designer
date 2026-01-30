import { useState, useEffect } from "react";
import {
  ConfigProvider,
  Space,
  Message,
  Typography,
  Progress,
  Button,
  Spin,
  Badge,
  Popover,
  Input,
  Modal,
} from "@arco-design/web-react";
import {
  IconFolder,
  IconPalette,
  IconRefresh,
  IconPlayCircle,
  IconStop,
} from "@arco-design/web-react/icon";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/shell";
import enUS from "@arco-design/web-react/es/locale/en-US";
import EnvironmentCheckModal from "./components/EnvironmentCheckModal";
import WorkspaceSelector from "./components/WorkspaceSelector";
import SettingsDropdown from "./components/SettingsDropdown";
import UiPageCard from "./components/UiPageCard";
import GitCredentialsModal from "./components/GitCredentialsModal";
import "@arco-design/web-react/dist/css/arco.css";
import "./App.less";

const { Text } = Typography;

interface InitStep {
  key: string;
  title: string;
  status: "pending" | "running" | "success" | "error";
  error?: string;
  isFatal?: boolean; // 是否为致命错误（无法跳过）
}

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

function App() {
  // 从 localStorage 读取初始工作空间路径
  const getInitialWorkspacePath = (): string => {
    try {
      return localStorage.getItem("workspace_path") || "";
    } catch {
      return "";
    }
  };

  // 从 localStorage 读取环境检测结果并确定是否显示弹窗
  const getInitialShowEnvModal = (): boolean => {
    try {
      const stored = localStorage.getItem("env_check");
      if (stored) {
        const envCheck: EnvironmentCheck = JSON.parse(stored);
        // 如果环境检测不通过，显示弹窗
        return envCheck.missing_tools.length > 0;
      }
    } catch {
      // Ignore errors
    }
    // 首次运行或没有存储记录，显示环境检测
    return true;
  };

  const getInitialShowWorkspaceModal = (): boolean => {
    try {
      const stored = localStorage.getItem("env_check");
      if (stored) {
        const envCheck: EnvironmentCheck = JSON.parse(stored);
        // 环境检测通过但没有工作空间，显示工作空间选择
        if (envCheck.missing_tools.length === 0 && !getInitialWorkspacePath()) {
          return true;
        }
      }
    } catch {
      // Ignore errors
    }
    return false;
  };

  const [showEnvModal, setShowEnvModal] = useState<boolean>(
    getInitialShowEnvModal
  );
  const [showWorkspaceModal, setShowWorkspaceModal] = useState<boolean>(
    getInitialShowWorkspaceModal
  );
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [initFailed, setInitFailed] = useState<boolean>(false);
  const [initError, setInitError] = useState<string>("");
  const [initSteps, setInitSteps] = useState<InitStep[]>([
    { key: "clone-main", title: "克隆主仓库", status: "pending" },
    { key: "clone-app", title: "克隆应用仓库", status: "pending" },
    { key: "copy-resources", title: "复制资源文件", status: "pending" },
    { key: "install-deps", title: "安装依赖", status: "pending" },
    { key: "config-env", title: "配置环境", status: "pending" },
  ]);
  const [initProgress, setInitProgress] = useState<number>(0);
  const [workspacePath, setWorkspacePath] = useState<string>(
    getInitialWorkspacePath
  );
  const [isDevServerRunning, setIsDevServerRunning] = useState<boolean>(false);
  const [devServerUrl, setDevServerUrl] = useState<string | null>(null);
  const [isStartingServer, setIsStartingServer] = useState<boolean>(false);
  const [uiPages, setUiPages] = useState<Array<{ name: string; path: string }>>([]);
  const [showCreatePageModal, setShowCreatePageModal] = useState<boolean>(false);
  const [showGitCredentialsModal, setShowGitCredentialsModal] = useState<boolean>(false);
  const [appBranch, setAppBranch] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // 处理 Git 凭据弹窗关闭
  const handleGitCredentialsClose = (): void => {
    setShowGitCredentialsModal(false);
  };

  // 处理 Git 凭据保存成功后
  const handleGitCredentialsSaved = (): void => {
    setShowGitCredentialsModal(false);
    // 如果有待执行的操作，执行它
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleEnvConfirm = (): void => {
    setShowEnvModal(false);
    // 环境检测通过后，如果没有工作空间，显示工作空间选择
    if (!getInitialWorkspacePath()) {
      setShowWorkspaceModal(true);
    }
  };

  const handleWorkspaceConfirm = (path?: string): void => {
    if (path) {
      setWorkspacePath(path);
    }
    setShowWorkspaceModal(false);
  };

  // 手动触发环境检测
  const handleManualEnvCheck = (): void => {
    setShowEnvModal(true);
  };

  // 环境检测完成后保存结果
  const handleEnvCheckComplete = (result: EnvironmentCheck): void => {
    try {
      localStorage.setItem("env_check", JSON.stringify(result));
    } catch {
      // Ignore errors
    }
  };

  // 开始初始化工作空间
  const handleInitWorkspace = async (path: string): Promise<void> => {
    // 先检查是否有 Git 凭据
    try {
      const creds = await invoke<{ username: string; token: string } | null>("get_git_credentials");
      if (!creds) {
        // 没有凭据，先显示凭据弹窗，保存后再执行初始化
        setPendingAction(() => () => {
          doInitWorkspace(path);
          setPendingAction(null);
        });
        setShowGitCredentialsModal(true);
        return;
      }
    } catch {
      // 忽略检查错误，继续执行
    }

    doInitWorkspace(path);
  };

  // 实际执行初始化
  const doInitWorkspace = async (path: string) => {
    setShowWorkspaceModal(false);
    setIsInitializing(true);
    setInitFailed(false);
    setInitError("");
    setInitProgress(0);

    const updateStepStatus = (
      key: string,
      status: InitStep["status"],
      error?: string,
      isFatal = false
    ): void => {
      setInitSteps((prev) =>
        prev.map((step) =>
          step.key === key ? { ...step, status, error, isFatal } : step
        )
      );
    };

    try {
      // 步骤1: 克隆主仓库
      updateStepStatus("clone-main", "running");
      setInitProgress(10);
      await invoke("clone_main_repo", { workspacePath: path });
      updateStepStatus("clone-main", "success");
      setInitProgress(30);

      // 步骤2: 克隆应用仓库
      updateStepStatus("clone-app", "running");
      setInitProgress(40);
      await invoke("clone_app_repo", { workspacePath: path });
      updateStepStatus("clone-app", "success");
      setInitProgress(55);

      // 步骤3: 复制资源文件
      updateStepStatus("copy-resources", "running");
      setInitProgress(60);
      const copyResult = await invoke<string>("copy_resources", {
        workspacePath: path,
      });
      updateStepStatus("copy-resources", "success");
      setInitProgress(70);

      // 如果复制资源跳过了，显示提示
      if (copyResult.includes("跳过")) {
        Message.info(copyResult);
      }

      // 步骤4: 安装依赖
      updateStepStatus("install-deps", "running");
      setInitProgress(75);
      await invoke("install_dependencies", { workspacePath: path });
      updateStepStatus("install-deps", "success");
      setInitProgress(90);

      // 步骤5: 配置环境
      updateStepStatus("config-env", "running");
      setInitProgress(95);
      const configResult = await invoke<string>("config_environment", {
        workspacePath: path,
      });
      updateStepStatus("config-env", "success");
      setInitProgress(100);

      // 如果配置环境跳过了，显示提示
      if (configResult.includes("跳过")) {
        Message.info(configResult);
      }

      Message.success("工作空间初始化完成！");

      // 设置工作空间路径
      setWorkspacePath(path);
      try {
        localStorage.setItem("workspace_path", path);
      } catch {
        // Ignore errors
      }

      setTimeout(() => {
        setIsInitializing(false);
      }, 1000);
    } catch (error) {
      console.error("初始化失败:", error);
      const errorMsg = String(error);

      // 判断是否为致命错误
      // 只有真正的执行失败才视为致命错误
      const isFatal =
        !errorMsg.includes("跳过") &&
        !errorMsg.includes("已存在") &&
        (errorMsg.includes("无法") ||
          (errorMsg.includes("失败") && !errorMsg.includes("跳过")));

      const failedStep = initSteps.find((s) => s.status === "running");
      if (failedStep) {
        updateStepStatus(failedStep.key, "error", errorMsg, isFatal);
      }

      setInitError(errorMsg);

      if (isFatal) {
        // 致命错误：停止初始化，显示重试按钮
        setInitFailed(true);
        Message.error(`初始化失败: ${errorMsg}`);
      } else {
        // 非致命错误：继续下一步
        Message.warning(`步骤警告: ${errorMsg}，继续执行...`);
      }
    }
  };

  // 打开工作空间文件夹
  const handleOpenWorkspaceFolder = async (): Promise<void> => {
    if (!workspacePath) {
      Message.warning("未设置工作空间路径");
      return;
    }

    try {
      const result = await invoke<string>("open_folder", {
        path: workspacePath,
      });
      Message.success(result);
    } catch (error) {
      Message.error(`打开文件夹失败: ${error}`);
    }
  };

  // 重新初始化工作空间
  const handleReinitWorkspace = async (): Promise<void> => {
    if (!workspacePath) {
      Message.warning("未设置工作空间路径");
      return;
    }

    // 先检查是否有 Git 凭据
    try {
      const creds = await invoke<{ username: string; token: string } | null>("get_git_credentials");
      if (!creds) {
        // 没有凭据，先显示凭据弹窗，保存后再执行
        setPendingAction(() => () => {
          if (confirm("确定要重新初始化工作空间吗？这将清空当前工作空间的内容。")) {
            handleInitWorkspace(workspacePath);
          }
          setPendingAction(null);
        });
        setShowGitCredentialsModal(true);
        return;
      }
    } catch {
      // 忽略检查错误，继续执行
    }

    // 确认是否要重新初始化
    if (confirm("确定要重新初始化工作空间吗？这将清空当前工作空间的内容。")) {
      handleInitWorkspace(workspacePath);
    }
  };

  // 启动开发服务器
  const handleStartDevServer = async (): Promise<void> => {
    if (!workspacePath) {
      Message.warning("未设置工作空间路径");
      return;
    }

    setIsStartingServer(true);
    try {
      const result = await invoke<string>("start_dev_server", {
        workspacePath,
      });
      setDevServerUrl(result);
      setIsDevServerRunning(true);
      Message.success(`开发服务器已启动: ${result}`);
    } catch (error) {
      Message.error(`启动开发服务器失败: ${error}`);
    } finally {
      setIsStartingServer(false);
    }
  };

  // 停止开发服务器
  const handleStopDevServer = async (): Promise<void> => {
    try {
      const result = await invoke<string>("stop_dev_server");
      setDevServerUrl(null);
      setIsDevServerRunning(false);
      Message.success(result);
    } catch (error) {
      Message.error(`停止开发服务器失败: ${error}`);
    }
  };

  // 检查开发服务器状态
  const checkDevServerStatus = async (): Promise<void> => {
    try {
      const running = await invoke<boolean>("is_dev_server_running");
      setIsDevServerRunning(running);
      if (running) {
        const url = await invoke<string | null>("get_dev_server_url");
        setDevServerUrl(url);
      } else {
        setDevServerUrl(null);
      }
    } catch {
      // Ignore errors
    }
  };

  // 组件挂载时检查开发服务器状态
  useEffect(() => {
    (async () => {
      await checkDevServerStatus();
    })();
  }, []);

  // 更新仓库
  const handleUpdateWorkspace = async (): Promise<void> => {
    if (!workspacePath) {
      Message.warning("未设置工作空间路径");
      return;
    }

    // 先检查是否有 Git 凭据
    try {
      const creds = await invoke<{ username: string; token: string } | null>("get_git_credentials");
      if (!creds) {
        // 没有凭据，先显示凭据弹窗，保存后再执行
        setPendingAction(() => async () => {
          try {
            console.log('workspacePath', workspacePath);
            const result = await invoke<string>("update_workspace", {
              workspacePath,
            });
            Message.success(result);
          } catch (error) {
            Message.error(`更新仓库失败: ${error}`);
          } finally {
            setPendingAction(null);
          }
        });
        setShowGitCredentialsModal(true);
        return;
      }
    } catch {
      // 忽略检查错误，继续执行
    }

    try {
      console.log('workspacePath', workspacePath);

      const result = await invoke<string>("update_workspace", {
        workspacePath,
      });
      Message.success(result);
    } catch (error) {
      Message.error(`更新仓库失败: ${error}`);
    }
  };

  // 读取 UI 页面列表
  const loadUiPages = async (): Promise<void> => {
    if (!workspacePath) {
      setUiPages([]);
      setAppBranch(null);
      return;
    }

    try {
      const [pages, branch] = await Promise.all([
        invoke<Array<{ name: string; path: string }>>("get_ui_pages", {
          workspacePath,
        }),
        invoke<string | null>("get_app_branch", {
          workspacePath,
        }),
      ]);
      setUiPages(pages);
      setAppBranch(branch);
    } catch {
      setUiPages([]);
      setAppBranch(null);
    }
  };

  // 创建新页面
  const handleCreatePage = async (pageName: string): Promise<void> => {
    if (!workspacePath) {
      Message.warning("未设置工作空间路径");
      return;
    }

    if (!pageName.trim()) {
      Message.warning("请输入页面名称");
      return;
    }

    try {
      const result = await invoke<string>("create_ui_page", {
        workspacePath,
        pageName: pageName.trim(),
      });
      Message.success(result);
      await loadUiPages();
      setShowCreatePageModal(false);
    } catch (error) {
      Message.error(`创建页面失败: ${error}`);
    }
  };

  // 打开页面
  const handleOpenPage = (pageName: string): void => {
    if (!devServerUrl) {
      Message.warning("请先启动开发服务器");
      return;
    }
    const pageUrl = `${devServerUrl}#/ui-pages/${pageName}`;
    open(pageUrl);
  };

  // 删除页面
  const handleDeletePage = async (pageName: string): Promise<void> => {
    if (!workspacePath) {
      Message.warning("未设置工作空间路径");
      return;
    }

    try {
      const result = await invoke<string>("delete_ui_page", {
        workspacePath,
        pageName,
      });
      Message.success(result);
      await loadUiPages();
    } catch (error) {
      Message.error(`删除页面失败: ${error}`);
    }
  };

  // 当 workspacePath 改变时加载 UI 页面
  useEffect(() => {
    loadUiPages();
  }, [workspacePath]);

  return (
    <ConfigProvider locale={enUS}>
      <div className="app-container">
        {/* 顶部标题栏 */}
        <header className="app-header">
          <div className="header-content">
            <div className="header-left">
              <div className="title-section">
                <h1 className="app-title">ADP UI Designer</h1>
                {workspacePath && (
                  <div
                    className="workspace-info"
                    style={{
                      cursor: "pointer",
                      position: "relative",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    {isDevServerRunning && (
                      <Popover
                        content={
                          <div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: devServerUrl ? "8px" : "0",
                              }}
                            >
                              <span style={{ fontSize: "12px" }}>
                                开发服务器运行中
                              </span>
                              <Button
                                type="primary"
                                status="danger"
                                size="mini"
                                icon={<IconStop style={{ fontSize: "12px" }} />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStopDevServer();
                                }}
                              >
                                停止
                              </Button>
                            </div>
                            {devServerUrl && (
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#165DFF",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  open(devServerUrl);
                                }}
                              >
                                {devServerUrl}
                              </div>
                            )}
                          </div>
                        }
                        trigger="hover"
                        position="bottom"
                      >
                        <Badge status="success" style={{ lineHeight: "0" }} />
                      </Popover>
                    )}
                    <span className="workspace-label">工作空间:</span>
                    <span className="workspace-path">{workspacePath}</span>
                    {appBranch && (
                      <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>
                        分支: {appBranch}
                      </span>
                    )}
                    <IconFolder
                      onClick={handleOpenWorkspaceFolder}
                      style={{
                        fontSize: "14px",
                        marginLeft: "4px",
                        color: "#667eea",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <Space>
              <SettingsDropdown
                onEnvironmentCheck={handleManualEnvCheck}
                onChangeWorkspace={() => setShowWorkspaceModal(true)}
                onReinitWorkspace={handleReinitWorkspace}
                onUpdateWorkspace={handleUpdateWorkspace}
                onGitCredentials={() => setShowGitCredentialsModal(true)}
                hasWorkspace={!!workspacePath}
              />
            </Space>
          </div>
        </header>

        {/* 主内容区域 */}
        <main className="main-content">
          {isInitializing ? (
            <div className="init-progress-container">
              <div className="init-progress-header">
                <IconPalette
                  style={{
                    fontSize: "48px",
                    marginBottom: "16px",
                    opacity: 0.8,
                  }}
                />
                <Text style={{ fontSize: "20px", fontWeight: 600 }}>
                  {initFailed ? "初始化失败" : "正在初始化工作空间"}
                </Text>
              </div>

              <div className="init-progress-section">
                <Progress
                  percent={initProgress}
                  status={initFailed ? "error" : undefined}
                  animation={!initFailed}
                />
                <Text
                  style={{
                    marginTop: 8,
                    display: "block",
                    textAlign: "center",
                  }}
                >
                  {initFailed ? (
                    initError
                  ) : initProgress === 100 ? (
                    "初始化完成！"
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Spin /> 正在初始化...
                    </div>
                  )}
                </Text>
              </div>

              <div className="init-steps-list">
                {initSteps.map((step) => (
                  <div
                    key={step.key}
                    className={`init-step-item init-step-${step.status}`}
                  >
                    <div className="step-icon">
                      {step.status === "running" && "⏳"}
                      {step.status === "success" && "✓"}
                      {step.status === "error" && "✗"}
                      {step.status === "pending" && "○"}
                    </div>
                    <div className="step-content">
                      <Text bold>{step.title}</Text>
                      {step.error && (
                        <Text
                          type="error"
                          style={{
                            fontSize: 12,
                            display: "block",
                            marginTop: 4,
                          }}
                        >
                          {step.error}
                        </Text>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {initFailed && (
                <div className="init-retry-section">
                  <Button
                    type="primary"
                    size="large"
                    icon={<IconRefresh />}
                    onClick={() => {
                      if (workspacePath) {
                        handleInitWorkspace(workspacePath);
                      }
                    }}
                  >
                    重试
                  </Button>
                  <Button
                    size="large"
                    onClick={() => {
                      setIsInitializing(false);
                      setInitFailed(false);
                      setInitProgress(0);
                      setInitSteps(
                        initSteps.map((step) => ({
                          ...step,
                          status: "pending" as const,
                          error: undefined,
                          isFatal: undefined,
                        }))
                      );
                    }}
                    style={{ marginLeft: "12px" }}
                  >
                    取消
                  </Button>
                </div>
              )}
            </div>
          ) : (
            uiPages.length > 0 && isDevServerRunning ? (
              <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                  <h2 style={{ margin: 0 }}>UI 设计页面</h2>
                  <Button
                    type="primary"
                    icon={<IconPalette />}
                    onClick={() => setShowCreatePageModal(true)}
                  >
                    创建新页面
                  </Button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px" }}>
                  {uiPages.map((page) => (
                    <UiPageCard
                      key={page.name}
                      name={page.name}
                      path={page.path}
                      workspacePath={workspacePath}
                      onOpen={handleOpenPage}
                      onDelete={handleDeletePage}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="placeholder">
                <div className="placeholder-icon">🎨</div>
                <div className="placeholder-text">工作空间已准备就绪</div>
                <div className="placeholder-subtext">开始你的设计之旅</div>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                  {!isDevServerRunning && (
                    <Button
                      type="primary"
                      size="large"
                      icon={<IconPlayCircle style={{ fontSize: "16px" }} />}
                      onClick={handleStartDevServer}
                      loading={isStartingServer}
                      style={{ marginTop: "24px" }}
                    >
                      启动开发服务器
                    </Button>
                  )}
                  {isDevServerRunning && (
                    <Button
                      type="outline"
                      size="large"
                      icon={<IconPalette style={{ fontSize: "16px" }} />}
                      onClick={() => setShowCreatePageModal(true)}
                      style={{ marginTop: "24px" }}
                    >
                      创建新页面
                    </Button>
                  )}
                </div>
              </div>
            )
          )}
        </main>
      </div>

      <EnvironmentCheckModal
        visible={showEnvModal}
        onConfirm={handleEnvConfirm}
        onCheckComplete={handleEnvCheckComplete}
      />

      <WorkspaceSelector
        visible={showWorkspaceModal}
        onConfirm={handleWorkspaceConfirm}
        onInit={handleInitWorkspace}
        workspacePath={workspacePath}
      />

      <GitCredentialsModal
        visible={showGitCredentialsModal}
        onClose={handleGitCredentialsClose}
        onSaved={handleGitCredentialsSaved}
      />

      <Modal
        title="创建新页面"
        visible={showCreatePageModal}
        onOk={() => {
          const input = document.getElementById('page-name-input') as HTMLInputElement;
          if (input) {
            handleCreatePage(input.value);
          }
        }}
        onCancel={() => setShowCreatePageModal(false)}
        okText="创建"
        cancelText="取消"
      >
        <div style={{ marginBottom: "16px" }}>
          <div style={{ marginBottom: "8px" }}>页面名称：</div>
          <Input
            id="page-name-input"
            placeholder="例如: hello-world, my-page"
            onPressEnter={(e) => {
              handleCreatePage((e.target as HTMLInputElement).value);
            }}
          />
          <div style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
            只能包含字母、数字、连字符和下划线
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
}

export default App;
