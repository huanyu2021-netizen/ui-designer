# ADP UI Designer - 跨平台构建指南

## 概述

ADP UI Designer 是一个跨平台的桌面应用，支持 Windows 和 macOS。

## 平台支持

### ✅ Windows
- Windows 10 或更高版本
- 打包格式：绿色 exe（单文件）

### ✅ macOS
- macOS 10.15 (Catalina) 或更高版本
- 打包格式：.app 应用包

## 构建前准备

### 通用依赖

1. **Node.js** (18+)
   - 下载：https://nodejs.org

2. **pnpm**
   ```bash
   npm install -g pnpm
   ```

3. **Rust**
   - Windows: https://rustup.rs/
   - macOS: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

### Windows 特定依赖

- Microsoft Visual C++ Build Tools
  - 下载：https://visualstudio.microsoft.com/visual-cpp-build-tools/

### macOS 特定依赖

- Xcode Command Line Tools
  ```bash
  xcode-select --install
  ```

## 快速开始

### Windows

```bash
# 1. 克隆或进入项目目录
cd ADP-UiDesigner

# 2. 安装依赖
pnpm install

# 3. 构建
pnpm run tauri:build

# 4. 绿色版 exe 位于
# src-tauri/target/release/adp-ui-designer.exe
```

### macOS

```bash
# 1. 克隆或进入项目目录
cd ADP-UiDesigner

# 2. 安装依赖
pnpm install

# 3. 构建（使用提供的脚本）
chmod +x build-macos.sh
./build-macos.sh

# 或者直接运行
pnpm run tauri:build

# 4. 应用包位于
# src-tauri/target/release/bundle/macos/ADP UI Designer.app
```

## 构建输出

### Windows 输出

```
src-tauri/target/release/
├── adp-ui-designer.exe        # 绿色版 exe（推荐）
└── bundle/
    ├── msi/
    │   └── ADP UI Designer_1.0.0_x64_en-US.msi  # MSI 安装包
    └── nsis/
        └── ADP UI Designer_1.0.0_x64-setup.exe   # NSIS 安装包
```

**推荐使用**：`adp-ui-designer.exe`
- 单文件绿色版
- 资源已嵌入
- 无需安装

### macOS 输出

```
src-tauri/target/release/bundle/macos/
└── ADP UI Designer.app/       # macOS 应用包
```

## 分发包结构

### Windows 绿色版

```
ADP-UI-Designer-v1.0.0-Final/
├── ADP UI Designer.exe        # 主程序（8.1 MB）
└── 使用说明.txt               # 使用说明
```

### macOS 版本

```
ADP-UI-Designer-macOS-v1.0.0/
├── ADP UI Designer.app/       # 应用包
└── 使用说明.txt               # 使用说明
```

## 平台特定功能

### Windows 特有功能

- ✅ 静默命令执行（不显示 CMD 窗口）
- ✅ 使用 `cmd /C` 执行命令
- ✅ 自动创建桌面快捷方式

### macOS 特有功能

- ✅ 原生 macOS 窗口样式
- ✅ 支持 Retina 显示
- ✅ 支持暗色模式

### 通用功能

- ✅ 资源文件嵌入
- ✅ 自动解压资源到工作空间
- ✅ Git 仓库管理
- ✅ 开发服务器管理
- ✅ 环境检测

## 已修复的跨平台问题

### 1. 路径比较
**问题**：使用 `Path::new("packages")` 直接比较路径
**修复**：使用 `file_name()` 只比较文件名部分
```rust
// 修复前（不跨平台）
if packages_dir.path() == Path::new("packages")

// 修复后（跨平台）
if let Some(dir_name) = packages_dir.path().file_name() {
    if dir_name == "packages"
}
```

### 2. CMD 窗口隐藏
**问题**：Windows 上弹出 CMD 窗口
**修复**：使用条件编译，仅在 Windows 上应用 `CREATE_NO_WINDOW` 标志
```rust
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

fn create_silent_command(program: &str) -> Command {
    let mut cmd = Command::new(program);
    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);
    cmd
}
```

### 3. 资源文件路径
**问题**：路径前缀处理导致目录层级重复
**修复**：递归时更新 prefix 为当前子目录路径
```rust
// 修复前
extract_dir_with_prefix(subdir, &path, prefix)?;

// 修复后
extract_dir_with_prefix(subdir, &path, Some(subdir.path()))?;
```

## 测试清单

### Windows 测试
- [ ] 应用启动
- [ ] 无 CMD 窗口弹出
- [ ] 资源文件正确提取
- [ ] 所有命令执行正常

### macOS 测试
- [ ] 应用启动
- [ ] 原生窗口样式
- [ ] 资源文件正确提取
- [ ] 所有命令执行正常
- [ ] 暗色模式支持

## 故障排除

### Windows

**Q: 构建时提示 "MSVC not found"**
A: 安装 Visual Studio Build Tools

**Q: exe 文件过大**
A: 资源文件已嵌入，8.1 MB 是正常大小

**Q: 杀毒软件报毒**
A: 由于包含嵌入式资源，可能被误报。可以添加信任

### macOS

**Q: 构建时提示 "xcodebuild not found"**
A: 运行 `xcode-select --install`

**Q: 应用无法打开（未签名警告）**
A:
- 方法1：右键点击应用，选择"打开"，然后点击"打开"按钮
- 方法2：在"系统偏好设置" > "安全性与隐私"中点击"仍要打开"

**Q: .app 包无法分发**
A: 考虑进行签名和公证（详见 BUILD_MACOS.md）

## 版本历史

### v1.0.0 (2026-01-29)
- ✅ 跨平台支持（Windows + macOS）
- ✅ 资源文件嵌入
- ✅ 无 CMD 窗口（Windows）
- ✅ 修复路径处理问题
- ✅ 修复 .env 文件提取

## 相关文件

- `BUILD_MACOS.md` - macOS 详细构建说明
- `build-macos.sh` - macOS 自动构建脚本
- `使用说明.txt` - 用户使用指南

## 支持

如有问题，请检查：
1. 是否满足所有前置依赖
2. Rust、Node.js 版本是否正确
3. 是否有足够的磁盘空间
4. 网络连接是否正常（下载依赖）
