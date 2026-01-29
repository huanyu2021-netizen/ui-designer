#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use tauri::Manager;
use std::fs;
use std::path::Path;
use std::process::{Command, Stdio, Child, Stdio as StdioLib};
use std::io::{self, BufRead, BufReader, Write};
use std::time::Duration;
use std::sync::Mutex;
use chrono;

// Windows 上隐藏 CMD 窗口的标志
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

const CREATE_NO_WINDOW: u32 = 0x08000000;

// 在编译时嵌入 res 目录
#[cfg(debug_assertions)]
const EMBEDDED_RESOURCES: include_dir::Dir = include_dir::include_dir!("$CARGO_MANIFEST_DIR/res");

#[cfg(not(debug_assertions))]
const EMBEDDED_RESOURCES: include_dir::Dir = include_dir::include_dir!("$CARGO_MANIFEST_DIR/res");

// 创建不会弹出窗口的命令
fn create_silent_command(program: &str) -> Command {
    let mut cmd = Command::new(program);
    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);
    cmd
}

// 解压嵌入的资源到指定目录
fn extract_embedded_resources(target_dir: &Path) -> Result<(), String> {
    if !target_dir.exists() {
        fs::create_dir_all(target_dir)
            .map_err(|e| format!("无法创建目标目录: {}", e))?;
    }

    extract_dir(&EMBEDDED_RESOURCES, target_dir)
}

fn extract_dir(dir: &include_dir::Dir, target_dir: &Path) -> Result<(), String> {
    extract_dir_with_prefix(dir, target_dir, None)
}

fn extract_dir_with_prefix(dir: &include_dir::Dir, target_dir: &Path, prefix: Option<&Path>) -> Result<(), String> {
    for entry in dir.entries() {
        let entry_path = entry.path();

        // 移除前缀路径
        let relative_path = if let Some(prefix) = prefix {
            entry_path.strip_prefix(prefix)
                .map_err(|e| format!("无法移除前缀: {}", e))?
        } else {
            entry_path
        };

        let path = target_dir.join(relative_path);
        match entry {
            include_dir::DirEntry::Dir(subdir) => {
                if !path.exists() {
                    fs::create_dir_all(&path)
                        .map_err(|e| format!("无法创建目录 {:?}: {}", path, e))?;
                }
                // 递归处理子目录，使用当前子目录的路径作为新的 prefix
                extract_dir_with_prefix(subdir, &path, Some(subdir.path()))?;
            }
            include_dir::DirEntry::File(file) => {
                if let Some(parent) = path.parent() {
                    if !parent.exists() {
                        fs::create_dir_all(parent)
                            .map_err(|e| format!("无法创建父目录 {:?}: {}", parent, e))?;
                    }
                }
                let contents = file.contents();
                let mut outfile = fs::File::create(&path)
                    .map_err(|e| format!("无法创建文件 {:?}: {}", path, e))?;
                outfile.write_all(contents)
                    .map_err(|e| format!("无法写入文件 {:?}: {}", path, e))?;
            }
        }
    }
    Ok(())
}

// 开发服务器管理器
struct DevServerManager {
    process: Mutex<Option<Child>>,
    url: Mutex<Option<String>>,
}

impl DevServerManager {
    fn new() -> Self {
        Self {
            process: Mutex::new(None),
            url: Mutex::new(None),
        }
    }
}

#[derive(Debug, Serialize)]
struct WorkspaceValidation {
    valid: bool,
    path: String,
    is_empty: bool,
    is_laiye_scaffold: bool,
    error: Option<String>,
}

#[derive(Debug, Serialize)]
struct EnvironmentCheck {
    node_installed: bool,
    node_version: Option<String>,
    node_version_valid: bool,
    pnpm_installed: bool,
    pnpm_version: Option<String>,
    git_installed: bool,
    git_version: Option<String>,
    claude_installed: bool,
    claude_version: Option<String>,
    missing_tools: Vec<String>,
}

#[tauri::command]
fn check_environment() -> Result<EnvironmentCheck, String> {
    let mut missing_tools = Vec::new();

    // Check Node.js (version >= 20)
    let node_result = if cfg!(windows) {
        create_silent_command("node")
            .arg("--version")
            .output()
    } else {
        Command::new("node")
            .arg("--version")
            .output()
    };

    let (node_installed, node_version, node_version_valid) = match node_result {
        Ok(output) => {
            if output.status.success() {
                let version_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
                // Parse version (format: v20.x.x)
                let version_valid = version_str.starts_with("v")
                    && version_str[1..].split('.')
                        .next()
                        .and_then(|v| v.parse::<u32>().ok())
                        .map(|v| v >= 20)
                        .unwrap_or(false);

                if !version_valid {
                    missing_tools.push("Node.js (需要版本 >= 20)".to_string());
                }

                (true, Some(version_str), version_valid)
            } else {
                missing_tools.push("Node.js (需要版本 >= 20)".to_string());
                (false, None, false)
            }
        }
        Err(_) => {
            missing_tools.push("Node.js (需要版本 >= 20)".to_string());
            (false, None, false)
        }
    };

    // Check pnpm (try multiple methods)
    let pnpm_result = if cfg!(windows) {
        // On Windows, try using cmd to call pnpm
        create_silent_command("cmd")
            .args(["/C", "pnpm", "--version"])
            .output()
    } else {
        // On Unix-like systems
        Command::new("pnpm")
            .arg("--version")
            .output()
    };

    let (pnpm_installed, pnpm_version) = match pnpm_result {
        Ok(output) => {
            if output.status.success() {
                let version_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
                (true, Some(version_str))
            } else {
                missing_tools.push("pnpm".to_string());
                (false, None)
            }
        }
        Err(_) => {
            missing_tools.push("pnpm".to_string());
            (false, None)
        }
    };

    // Check git
    let git_result = if cfg!(windows) {
        create_silent_command("git")
            .arg("--version")
            .output()
    } else {
        Command::new("git")
            .arg("--version")
            .output()
    };

    let (git_installed, git_version) = match git_result {
        Ok(output) => {
            if output.status.success() {
                let version_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
                (true, Some(version_str))
            } else {
                missing_tools.push("git".to_string());
                (false, None)
            }
        }
        Err(_) => {
            missing_tools.push("git".to_string());
            (false, None)
        }
    };

    // Check claude
    let claude_result = if cfg!(windows) {
        // On Windows, try using cmd to call claude
        create_silent_command("cmd")
            .args(["/C", "claude", "-v"])
            .output()
    } else {
        // On Unix-like systems
        Command::new("claude")
            .arg("-v")
            .output()
    };

    let (claude_installed, claude_version) = match claude_result {
        Ok(output) => {
            if output.status.success() {
                let version_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
                (true, Some(version_str))
            } else {
                (false, None)
            }
        }
        Err(_) => {
            (false, None)
        }
    };

    Ok(EnvironmentCheck {
        node_installed,
        node_version,
        node_version_valid,
        pnpm_installed,
        pnpm_version,
        git_installed,
        git_version,
        claude_installed,
        claude_version,
        missing_tools,
    })
}

#[derive(Debug, Serialize)]
struct InstallResult {
    success: bool,
    message: String,
    tool: String,
}

#[tauri::command]
async fn install_tool(tool_name: String, _window: tauri::Window) -> Result<InstallResult, String> {
    let is_windows = cfg!(windows);
    let is_macos = cfg!(target_os = "macos");

    let open_url = |url: &str| -> Result<(), String> {
        if is_windows {
            create_silent_command("cmd")
                .args(["/C", "start", "", url])
                .spawn()
                .map_err(|e| format!("无法打开浏览器: {}", e))?;
        } else if is_macos {
            Command::new("open")
                .arg(url)
                .spawn()
                .map_err(|e| format!("无法打开浏览器: {}", e))?;
        } else {
            Command::new("xdg-open")
                .arg(url)
                .spawn()
                .map_err(|e| format!("无法打开浏览器: {}", e))?;
        }
        Ok(())
    };

    match tool_name.as_str() {
        "Node.js" => {
            // Open browser to download Node.js
            let download_url = if is_windows {
                "https://nodejs.org/dist/v22.22.0/node-v22.22.0-x64.msi"
            } else if is_macos {
                "https://nodejs.org/dist/v22.22.0/node-v22.22.0.pkg"
            } else {
                "https://nodejs.org/en/download"
            };

            open_url(download_url)?;

            Ok(InstallResult {
                success: true,
                message: "已打开 Node.js 下载页面。请下载安装后刷新按钮重新检测。".to_string(),
                tool: tool_name,
            })
        }
        "pnpm" => {
            // Try to install pnpm using npm
            let result = if is_windows {
                create_silent_command("cmd")
                    .args(["/C", "npm", "install", "-g", "pnpm"])
                    .spawn()
            } else {
                Command::new("npm")
                    .args(["install", "-g", "pnpm"])
                    .spawn()
            };

            match result {
                Ok(_) => Ok(InstallResult {
                    success: true,
                    message: "正在安装 pnpm...".to_string(),
                    tool: tool_name,
                }),
                Err(_e) => {
                    // If npm is not available, open browser
                    let install_url = "https://pnpm.io/installation";
                    open_url(install_url)?;

                    Ok(InstallResult {
                        success: true,
                        message: "已打开 pnpm 安装页面。请按照说明安装后刷新按钮重新检测。".to_string(),
                        tool: tool_name,
                    })
                }
            }
        }
        "Git" => {
            // Open browser to download Git
            let download_url = if is_windows {
                "https://git-scm.com/download/win"
            } else if is_macos {
                "https://git-scm.com/download/mac"
            } else {
                "https://git-scm.com/downloads"
            };

            open_url(download_url)?;

            Ok(InstallResult {
                success: true,
                message: "已打开 Git 下载页面。请下载安装后刷新按钮重新检测。".to_string(),
                tool: tool_name,
            })
        }
        _ => Err(format!("未知的工具: {}", tool_name)),
    }
}

#[tauri::command]
async fn install_all_tools(_window: tauri::Window) -> Result<String, String> {
    let is_windows = cfg!(windows);
    let is_macos = cfg!(target_os = "macos");

    let open_url = |url: &str| -> Result<(), String> {
        if is_windows {
            create_silent_command("cmd")
                .args(["/C", "start", "", url])
                .spawn()
                .map_err(|e| format!("无法打开浏览器: {}", e))?;
        } else if is_macos {
            Command::new("open")
                .arg(url)
                .spawn()
                .map_err(|e| format!("无法打开浏览器: {}", e))?;
        } else {
            Command::new("xdg-open")
                .arg(url)
                .spawn()
                .map_err(|e| format!("无法打开浏览器: {}", e))?;
        }
        Ok(())
    };

    // Open Node.js download page as primary
    let download_url = if is_windows {
        "https://nodejs.org/en/download"
    } else if is_macos {
        "https://nodejs.org/en/download"
    } else {
        "https://nodejs.org/en/download"
    };

    open_url(download_url)?;

    Ok("已打开 Node.js 下载页面。安装 Node.js 后，可以通过 npm 安装 pnpm (npm install -g pnpm)。Git 也可以从 https://git-scm.com/downloads 下载。".to_string())
}

#[tauri::command]
async fn select_workspace() -> Result<Option<String>, String> {
    // This will be handled by frontend using Tauri's dialog API
    Ok(None)
}

#[tauri::command]
fn validate_workspace(path: String) -> Result<WorkspaceValidation, String> {
    let workspace_path = Path::new(&path);

    // Check if path exists
    if !workspace_path.exists() {
        return Ok(WorkspaceValidation {
            valid: false,
            path,
            is_empty: false,
            is_laiye_scaffold: false,
            error: Some("路径不存在".to_string()),
        });
    }

    // Check if it's a directory
    if !workspace_path.is_dir() {
        return Ok(WorkspaceValidation {
            valid: false,
            path,
            is_empty: false,
            is_laiye_scaffold: false,
            error: Some("选择的不是文件夹".to_string()),
        });
    }

    // Check if directory is empty
    let is_empty = match fs::read_dir(workspace_path) {
        Ok(mut entries) => entries.next().is_none(),
        Err(_) => false,
    };

    // Check if it's a git repository with the correct remote origin
    let expected_url = "https://git.laiye.com/laiye-frontend-repos/laiye-monorepo-scaffold.git";
    let git_config = workspace_path.join(".git").join("config");

    let is_laiye_scaffold = if git_config.exists() {
        // Read git config to check remote origin URL
        match fs::read_to_string(&git_config) {
            Ok(content) => {
                content.contains(&expected_url) || content.contains("git.laiye.com/laiye-frontend-repos/laiye-monorepo-scaffold")
            }
            Err(_) => false
        }
    } else {
        false
    };

    // Validate: must be empty OR be a git repo with correct remote origin
    let valid = is_empty || is_laiye_scaffold;

    let error = if !valid {
        if !is_empty && !is_laiye_scaffold {
            Some("文件夹不为空且不是有效的 laiye-monorepo-scaffold 仓库".to_string())
        } else {
            None
        }
    } else {
        None
    };

    Ok(WorkspaceValidation {
        valid,
        path,
        is_empty,
        is_laiye_scaffold,
        error,
    })
}

// 执行命令并实时输出日志
fn execute_command_with_output(
    program: &str,
    args: &[&str],
    working_dir: &Path,
) -> Result<String, String> {
    let is_windows = cfg!(windows);

    let result = if is_windows && program == "git" {
        // Windows 上使用 cmd /C 来执行 git 命令
        create_silent_command("cmd")
            .args(["/C", "git"])
            .args(args)
            .current_dir(working_dir)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
    } else if is_windows && program == "pnpm" {
        create_silent_command("cmd")
            .args(["/C", "pnpm"])
            .args(args)
            .current_dir(working_dir)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
    } else {
        Command::new(program)
            .args(args)
            .current_dir(working_dir)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
    };

    match result {
        Ok(output) => {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout).to_string();
                Ok(stdout)
            } else {
                let stderr = String::from_utf8_lossy(&output.stderr).to_string();
                let stdout = String::from_utf8_lossy(&output.stdout).to_string();
                Err(if stderr.is_empty() {
                    format!("命令执行失败: {}", stdout)
                } else {
                    format!("命令执行失败: {}", stderr)
                })
            }
        }
        Err(e) => Err(format!("无法执行命令 {}: {}", program, e)),
    }
}

// 递归复制目录
fn copy_dir_recursive(src: &Path, dst: &Path) -> io::Result<()> {
    if !dst.exists() {
        fs::create_dir_all(dst)?;
    }

    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());

        if ty.is_dir() {
            copy_dir_recursive(&src_path, &dst_path)?;
        } else {
            fs::copy(&src_path, &dst_path)?;
        }
    }

    Ok(())
}

#[tauri::command]
async fn clone_main_repo(workspace_path: String) -> Result<String, String> {
    let main_repo_url = "https://git.laiye.com/laiye-frontend-repos/laiye-monorepo-scaffold";
    let workspace = Path::new(&workspace_path);

    // 检查是否已经初始化过（检查是否有 .git 目录）
    let git_dir = workspace.join(".git");
    if git_dir.exists() {
        return Ok("主仓库已存在，跳过克隆".to_string());
    }

    // 检查目录是否为空
    let is_empty = match fs::read_dir(workspace) {
        Ok(mut entries) => entries.next().is_none(),
        Err(_) => false,
    };

    if !is_empty {
        return Err("工作空间目录不为空且不是 git 仓库".to_string());
    }

    // 克隆主仓库到工作空间
    let output = execute_command_with_output(
        "git",
        &["clone", main_repo_url, "."],
        workspace,
    )?;

    Ok(format!("成功克隆主仓库: {}", output))
}

#[tauri::command]
async fn clone_app_repo(workspace_path: String) -> Result<String, String> {
    let app_repo_url = "https://git.laiye.com/laiye-frontend-repos/laiye-adp";
    let workspace = Path::new(&workspace_path);
    let apps_dir = workspace.join("apps");
    let app_dir = apps_dir.join("laiye-adp");

    // 检查应用仓库是否已经存在
    if app_dir.exists() {
        let git_dir = app_dir.join(".git");
        if git_dir.exists() {
            return Ok("应用仓库已存在，跳过克隆".to_string());
        }
    }

    // 确保 apps 目录存在
    if !apps_dir.exists() {
        fs::create_dir_all(&apps_dir)
            .map_err(|e| format!("无法创建 apps 目录: {}", e))?;
    }

    // 克隆应用仓库到 apps 目录
    let output = execute_command_with_output(
        "git",
        &["clone", app_repo_url, "laiye-adp"],
        &apps_dir,
    )?;

    // 创建新分支，命名为 ui-pages-{用户名}-{月}{日}
    let now = chrono::Local::now();

    // 获取电脑用户名
    let username = std::env::var("USERNAME")
        .or_else(|_| std::env::var("USER"))
        .unwrap_or_else(|_| "user".to_string());

    // 格式化用户名：转小写，移除空格和特殊字符
    let username: String = username
        .to_lowercase()
        .chars()
        .filter(|c| c.is_alphanumeric() || *c == '_')
        .collect();

    let branch_name = format!("ui-pages-{}-{}", username, now.format("%m%d"));

    let checkout_output = execute_command_with_output(
        "git",
        &["checkout", "-b", &branch_name],
        &app_dir,
    )?;

    Ok(format!("成功克隆应用仓库并创建分支 {}: {}\n分支: {}", branch_name, output, checkout_output))
}

#[tauri::command]
async fn copy_resources(workspace_path: String, _window: tauri::Window) -> Result<String, String> {
    let workspace = Path::new(&workspace_path);
    let target_packages = workspace.join("packages");

    // 如果目标 packages 已经存在且不为空，跳过
    if target_packages.exists() {
        let has_content = fs::read_dir(&target_packages)
            .map(|mut entries| entries.next().is_some())
            .unwrap_or(false);

        if has_content {
            return Ok("packages 目录已存在且不为空，跳过复制".to_string());
        }
    }

    // 从嵌入的资源中提取 packages 目录
    for entry in EMBEDDED_RESOURCES.entries() {
        if let include_dir::DirEntry::Dir(packages_dir) = entry {
            // 使用文件名比较，跨平台兼容
            if let Some(dir_name) = packages_dir.path().file_name() {
                if dir_name == "packages" {
                    // 使用前缀移除 "packages" 路径部分
                    extract_dir_with_prefix(packages_dir, &target_packages, Some(packages_dir.path()))
                        .map_err(|e| format!("从嵌入资源提取 packages 失败: {}", e))?;
                    break;
                }
            }
        }
    }

    // 同时提取 .env.development.local 文件到工作空间根目录
    let mut env_found = false;
    for entry in EMBEDDED_RESOURCES.entries() {
        if let include_dir::DirEntry::File(env_file) = entry {
            // 检查文件名
            if let Some(file_name) = env_file.path().file_name() {
                if file_name == ".env.development.local" {
                    let target_env = workspace.join(".env.development.local");
                    let mut outfile = fs::File::create(&target_env)
                        .map_err(|e| format!("无法创建 .env.development.local: {}", e))?;
                    outfile.write_all(env_file.contents())
                        .map_err(|e| format!("无法写入 .env.development.local: {}", e))?;
                    env_found = true;
                    break;
                }
            }
        }
    }

    if !env_found {
        eprintln!("警告: 未在嵌入资源中找到 .env.development.local 文件");
    }

    Ok("成功从嵌入资源复制文件".to_string())
}

#[tauri::command]
async fn install_dependencies(workspace_path: String) -> Result<String, String> {
    let workspace = Path::new(&workspace_path);

    let output = execute_command_with_output(
        "pnpm",
        &["install:all"],
        workspace,
    )?;

    Ok(format!("成功安装依赖: {}", output))
}

#[tauri::command]
async fn config_environment(workspace_path: String, _window: tauri::Window) -> Result<String, String> {
    let workspace = Path::new(&workspace_path);
    let app_env_dir = workspace.join("apps").join("laiye-adp");
    let target_env_file = app_env_dir.join(".env.development.local");

    // 如果目标文件已存在，跳过
    if target_env_file.exists() {
        return Ok(".env.development.local 已存在，跳过配置".to_string());
    }

    // 从嵌入的资源中获取 .env.development.local
    let mut env_contents = None;
    for entry in EMBEDDED_RESOURCES.entries() {
        if let include_dir::DirEntry::File(env_file) = entry {
            // 检查文件名
            if let Some(file_name) = env_file.path().file_name() {
                if file_name == ".env.development.local" {
                    env_contents = Some(env_file.contents());
                    break;
                }
            }
        }
    }

    let contents = env_contents.ok_or("嵌入资源中缺少 .env.development.local，跳过环境配置".to_string())?;

    // 确保目标目录存在
    if !app_env_dir.exists() {
        fs::create_dir_all(&app_env_dir)
            .map_err(|e| format!("无法创建 apps/laiye-adp 目录: {}", e))?;
    }

    // 写入环境配置文件
    let mut outfile = fs::File::create(&target_env_file)
        .map_err(|e| format!("无法创建 .env.development.local: {}", e))?;
    outfile.write_all(contents)
        .map_err(|e| format!("无法写入 .env.development.local: {}", e))?;

    Ok("成功配置环境".to_string())
}

#[tauri::command]
async fn open_folder(path: String) -> Result<String, String> {
    let workspace = Path::new(&path);

    if !workspace.exists() {
        return Err("路径不存在".to_string());
    }

    let result = if cfg!(target_os = "windows") {
        Command::new("explorer")
            .arg(path)
            .spawn()
    } else if cfg!(target_os = "macos") {
        Command::new("open")
            .arg(path)
            .spawn()
    } else {
        Command::new("xdg-open")
            .arg(path)
            .spawn()
    };

    match result {
        Ok(_) => Ok("已在系统文件管理器中打开".to_string()),
        Err(e) => Err(format!("无法打开文件夹: {}", e)),
    }
}

#[tauri::command]
async fn update_workspace(workspace_path: String) -> Result<String, String> {
    let workspace = Path::new(&workspace_path);

    if !workspace.exists() {
        return Err("工作空间路径不存在".to_string());
    }

    // 更新主仓库（workspace 已经指向 laiye-monorepo-scaffold 目录）
    let git_dir = workspace.join(".git");
    if git_dir.exists() {
        let output = if cfg!(windows) {
            create_silent_command("git")
                .args(["pull", "origin", "master"])
                .current_dir(workspace)
                .output()
        } else {
            Command::new("git")
                .args(["pull", "origin", "master"])
                .current_dir(workspace)
                .output()
        };

        match output {
            Ok(result) => {
                if result.status.success() {
                    let stdout = String::from_utf8_lossy(&result.stdout);
                    let message = if stdout.trim().is_empty() {
                        "主仓库已是最新".to_string()
                    } else {
                        format!("主仓库更新成功: {}", stdout.trim())
                    };

                    // 继续更新应用仓库
                    let app_repo = workspace.join("apps").join("laiye-adp");
                    let app_git = app_repo.join(".git");
                    if app_git.exists() {
                        let app_output = if cfg!(windows) {
                            create_silent_command("git")
                                .args(["pull", "origin", "master"])
                                .current_dir(&app_repo)
                                .output()
                        } else {
                            Command::new("git")
                                .args(["pull", "origin", "master"])
                                .current_dir(&app_repo)
                                .output()
                        };

                        match app_output {
                            Ok(app_result) => {
                                if app_result.status.success() {
                                    let app_stdout = String::from_utf8_lossy(&app_result.stdout);
                                    let app_message = if app_stdout.trim().is_empty() {
                                        "应用仓库已是最新".to_string()
                                    } else {
                                        format!("应用仓库更新成功: {}", app_stdout.trim())
                                    };
                                    return Ok(format!("{}\n{}", message, app_message));
                                } else {
                                    let app_stderr = String::from_utf8_lossy(&app_result.stderr);
                                    return Ok(format!("{}\n应用仓库更新失败: {}", message, app_stderr.trim()));
                                }
                            }
                            Err(e) => return Ok(format!("{}\n应用仓库更新失败: {}", message, e)),
                        }
                    }

                    return Ok(message);
                } else {
                    let stderr = String::from_utf8_lossy(&result.stderr);
                    return Err(format!("主仓库更新失败: {}", stderr.trim()));
                }
            }
            Err(e) => return Err(format!("执行 git pull 失败: {}", e)),
        }
    }

    Err("未找到 git 仓库".to_string())
}

#[derive(Debug, Serialize)]
struct UiPage {
    name: String,
    path: String,
}

#[tauri::command]
async fn get_ui_pages(workspace_path: String) -> Result<Vec<UiPage>, String> {
    let workspace = Path::new(&workspace_path);
    let ui_pages_dir = workspace.join("apps").join("laiye-adp").join("src").join("ui-pages");

    if !ui_pages_dir.exists() {
        return Ok(vec![]);
    }

    let mut pages = Vec::new();

    let entries = fs::read_dir(&ui_pages_dir)
        .map_err(|e| format!("读取 ui-pages 目录失败: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("读取目录项失败: {}", e))?;
        let path = entry.path();

        if path.is_dir() {
            if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                pages.push(UiPage {
                    name: name.to_string(),
                    path: path.to_string_lossy().to_string(),
                });
            }
        }
    }

    pages.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(pages)
}

#[tauri::command]
async fn create_ui_page(workspace_path: String, page_name: String) -> Result<String, String> {
    let workspace = Path::new(&workspace_path);
    let ui_pages_dir = workspace.join("apps").join("laiye-adp").join("src").join("ui-pages");

    // 验证页面名称（只允许字母、数字、连字符和下划线）
    if !page_name
        .chars()
        .all(|c| c.is_alphanumeric() || c == '-' || c == '_')
    {
        return Err("页面名称只能包含字母、数字、连字符和下划线".to_string());
    }

    let page_dir = ui_pages_dir.join(&page_name);

    // 检查是否已存在
    if page_dir.exists() {
        return Err(format!("页面 '{}' 已存在", page_name));
    }

    // 创建目录
    fs::create_dir_all(&page_dir)
        .map_err(|e| format!("创建目录失败: {}", e))?;

    // 创建 index.tsx 文件
    let index_file = page_dir.join("index.tsx");
    let content = format!(
r#"import {{ React }} from 'react';

export default function {}() {{
  return (
    <div style={{{{ padding: '20px' }}}}>

      <h1>{}</h1>
      <p>开始你的设计...</p>
    </div>
  );
}}
"#,
        to_pascal_case(&page_name),
        to_pascal_case(&page_name)
    );

    fs::write(&index_file, content)
        .map_err(|e| format!("创建 index.tsx 失败: {}", e))?;

    Ok(format!("页面 '{}' 创建成功", page_name))
}

// 辅助函数：将 kebab-case 或 snake_case 转换为 PascalCase
fn to_pascal_case(s: &str) -> String {
    s.split(|c: char| c == '-' || c == '_')
        .map(|word| {
            let mut chars = word.chars();
            match chars.next() {
                None => String::new(),
                Some(first) => {
                    first.to_uppercase().collect::<String>() + chars.as_str()
                }
            }
        })
        .collect()
}

// 清理 ANSI 转义序列
fn strip_ansi_codes(s: &str) -> String {
    let mut result = String::new();
    let mut chars = s.chars().peekable();

    while let Some(c) = chars.next() {
        if c == '\x1b' {
            // 跳过转义序列直到找到结束字符（通常是字母）
            if chars.next() == Some('[') {
                // 跳过直到找到 m 或其他结束字符
                while let Some(&next) = chars.peek() {
                    chars.next();
                    if next.is_ascii_alphabetic() {
                        break;
                    }
                }
            }
        } else if c == '[' {
            // 检查是否是 ANSI 序列的开始（格式如 [39m）
            let mut ansi_sequence = String::from('[');
            let mut is_ansi = false;

            // 收集后续字符
            while let Some(&next) = chars.peek() {
                if next.is_ascii_digit() || next == ';' {
                    ansi_sequence.push(next);
                    chars.next();
                } else if next == 'm' {
                    is_ansi = true;
                    chars.next();
                    break;
                } else {
                    break;
                }
            }

            if !is_ansi {
                result.push_str(&ansi_sequence);
            }
        } else {
            result.push(c);
        }
    }

    result
}

#[tauri::command]
async fn get_app_branch(workspace_path: String) -> Result<Option<String>, String> {
    let workspace = Path::new(&workspace_path);
    let app_dir = workspace.join("apps").join("laiye-adp");

    if !app_dir.exists() {
        return Ok(None);
    }

    let output = if cfg!(windows) {
        create_silent_command("git")
            .args(["branch", "--show-current"])
            .current_dir(&app_dir)
            .output()
    } else {
        Command::new("git")
            .args(["branch", "--show-current"])
            .current_dir(&app_dir)
            .output()
    };

    match output {
        Ok(result) => {
            if result.status.success() {
                let branch = String::from_utf8_lossy(&result.stdout).trim().to_string();
                Ok(if branch.is_empty() { None } else { Some(branch) })
            } else {
                Ok(None)
            }
        }
        Err(_) => Ok(None),
    }
}

#[tauri::command]
async fn delete_ui_page(workspace_path: String, page_name: String) -> Result<String, String> {
    let workspace = Path::new(&workspace_path);
    let page_dir = workspace.join("apps").join("laiye-adp").join("src").join("ui-pages").join(&page_name);

    if !page_dir.exists() {
        return Err(format!("页面 '{}' 不存在", page_name));
    }

    fs::remove_dir_all(&page_dir)
        .map_err(|e| format!("删除页面失败: {}", e))?;

    Ok(format!("页面 '{}' 已删除", page_name))
}

#[tauri::command]
async fn start_dev_server(
    workspace_path: String,
    manager: tauri::State<'_, DevServerManager>,
) -> Result<String, String> {
    // 检查是否已有运行中的服务器
    let mut process_guard = manager.process.lock().unwrap();
    let mut url_guard = manager.url.lock().unwrap();

    if process_guard.is_some() {
        return Err("开发服务器已在运行中".to_string());
    }

    let workspace = Path::new(&workspace_path);
    let app_dir = workspace.join("apps").join("laiye-adp");

    if !app_dir.exists() {
        return Err("应用目录不存在，请先初始化工作空间".to_string());
    }

    let is_windows = cfg!(windows);

    // 启动开发服务器并捕获输出
    let child = if is_windows {
        create_silent_command("cmd")
            .args(["/C", "npm", "run", "dev"])
            .current_dir(&app_dir)
            .stdout(StdioLib::piped())
            .stderr(StdioLib::piped())
            .spawn()
    } else {
        Command::new("npm")
            .args(["run", "dev"])
            .current_dir(&app_dir)
            .stdout(StdioLib::piped())
            .stderr(StdioLib::piped())
            .spawn()
    };

    let mut child = child.map_err(|e| format!("启动开发服务器失败: {}", e))?;

    // 读取 stdout 以查找 localhost URL
    if let Some(stdout) = child.stdout.as_mut() {
        let reader = BufReader::new(stdout);
        let start_time = std::time::Instant::now();
        let timeout = Duration::from_secs(30); // 30秒超时

        for line in reader.lines() {
            if let Ok(text) = line {
                // 优先查找 "➜  Local:" 行
                if text.contains("➜  Local:") || text.contains("Local:") {
                    // 清理 ANSI 转义码
                    let clean_text = strip_ansi_codes(&text);

                    // 提取 Local 行中的 URL
                    if let Some(url_start) = clean_text.find("http://") {
                        let url_part = &clean_text[url_start..];
                        // URL 后面可能是空格或行尾
                        let url_end = url_part.find(' ').unwrap_or(url_part.len());
                        let url = &url_part[..url_end];
                        let url = url.trim();
                        *url_guard = Some(url.to_string());
                        *process_guard = Some(child);
                        return Ok(url.to_string());
                    } else if let Some(url_start) = clean_text.find("localhost:") {
                        // 处理 localhost:xxxx 格式
                        let url_part = &clean_text[url_start..];
                        let url_end = url_part.find(' ').unwrap_or(url_part.len());
                        let url = format!("http://{}", url_part[..url_end].trim());
                        *url_guard = Some(url.clone());
                        *process_guard = Some(child);
                        return Ok(url);
                    }
                }
                // 备用：查找任何 localhost URL 模式
                else if text.contains("localhost:") || text.contains("127.0.0.1:") {
                    let clean_text = strip_ansi_codes(&text);

                    if let Some(url_start) = clean_text.find("http://") {
                        let url_part = &clean_text[url_start..];
                        if let Some(url_end) = url_part.find(' ') {
                            let url = &url_part[..url_end];
                            let url = url.trim_end_matches('/',).trim_end_matches('>').trim();
                            *url_guard = Some(url.to_string());
                            *process_guard = Some(child);
                            return Ok(url.to_string());
                        }
                    } else if let Some(url_start) = clean_text.find("localhost:") {
                        let url_part = &clean_text[url_start..];
                        if let Some(url_end) = url_part.find(' ') {
                            let port_part = &url_part[..url_end];
                            let url = format!("http://{}", port_part.trim_end_matches('/',).trim_end_matches('>').trim());
                            *url_guard = Some(url.clone());
                            *process_guard = Some(child);
                            return Ok(url);
                        }
                    }
                }

                // 检查超时
                if start_time.elapsed() > timeout {
                    let _ = child.kill();
                    return Err("等待开发服务器启动超时".to_string());
                }
            } else {
                // 输出读取错误
                break;
            }
        }
    }

    // 如果没找到 URL，仍然返回成功（可能在 stderr 中）
    *process_guard = Some(child);
    Ok("开发服务器已启动，但未检测到 URL".to_string())
}

#[tauri::command]
async fn stop_dev_server(
    manager: tauri::State<'_, DevServerManager>,
) -> Result<String, String> {
    let mut process_guard = manager.process.lock().unwrap();
    let mut url_guard = manager.url.lock().unwrap();

    if let Some(mut child) = process_guard.take() {
        // 清除 URL
        *url_guard = None;

        // 尝试优雅地终止进程
        match child.kill() {
            Ok(_) => {
                // 等待进程结束
                let _ = child.wait();
                Ok("开发服务器已停止".to_string())
            }
            Err(e) => Err(format!("停止开发服务器失败: {}", e)),
        }
    } else {
        Err("没有运行中的开发服务器".to_string())
    }
}

#[tauri::command]
async fn is_dev_server_running(
    manager: tauri::State<'_, DevServerManager>,
) -> Result<bool, String> {
    let process_guard = manager.process.lock().unwrap();
    Ok(process_guard.is_some())
}

#[tauri::command]
async fn get_dev_server_url(
    manager: tauri::State<'_, DevServerManager>,
) -> Result<Option<String>, String> {
    let url_guard = manager.url.lock().unwrap();
    Ok(url_guard.clone())
}

fn main() {
    tauri::Builder::default()
        .manage(DevServerManager::new())
        .setup(|app| {
            // 监听应用关闭事件，停止开发服务器
            let app_handle = app.handle();
            let window = app.get_window("main").unwrap();

            window.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { .. } = event {
                    // 应用即将关闭，停止开发服务器
                    let manager = app_handle.state::<DevServerManager>();

                    // 使用 lock() 而不是 try_lock，因为关闭时不需要担心阻塞
                    let mut process_guard = manager.process.lock().unwrap();
                    let mut url_guard = manager.url.lock().unwrap();

                    if let Some(mut child) = process_guard.take() {
                        *url_guard = None;
                        let _ = child.kill();
                        let _ = child.wait();
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            check_environment,
            install_tool,
            install_all_tools,
            select_workspace,
            validate_workspace,
            clone_main_repo,
            clone_app_repo,
            copy_resources,
            install_dependencies,
            config_environment,
            open_folder,
            start_dev_server,
            stop_dev_server,
            is_dev_server_running,
            get_dev_server_url,
            update_workspace,
            get_ui_pages,
            create_ui_page,
            delete_ui_page,
            get_app_branch
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
