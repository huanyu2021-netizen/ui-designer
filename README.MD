# ADP UI Designer

一个帮助非开发人员快速启动前端开发环境的桌面应用。基于 Tauri 框架构建，支持 macOS 和 Windows 平台。

## 功能特性

- **内置环境管理**：自带 Node.js 22 和 pnpm，无需手动配置开发环境
- **工作空间管理**：可视化选择和管理工作空间
- **智能初始化**：自动克隆仓库、复制资源、安装依赖
- **一键启动**：快速启动开发服务器
- **跨平台支持**：支持 macOS 和 Windows
- **美观界面**：使用 Arc Design UI 库构建现代化界面

## 技术栈

### 前端
- React 18
- Arc Design UI (@arco-design/web-react)
- Vite

### 后端
- Rust
- Tauri 1.6
- Git2 (Rust Git 库)

## 前置要求

### 开发环境
详细的安装步骤请参考 [安装指南](./INSTALL.md)

1. **Rust** (>= 1.70)
   - Windows: 下载并安装 [rustup-init.exe](https://rustup.rs/)
   - macOS: 运行 `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

2. **Node.js** (>= 18)
   - 下载 [Node.js](https://nodejs.org/)

3. **系统依赖**

   **Windows:**
   - 安装 [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

   **macOS:**
   - 安装 Xcode 命令行工具：`xcode-select --install`

## 开发指南

### 1. 安装依赖

```bash
npm install
```

### 2. 开发模式

```bash
npm run tauri:dev
```

### 3. 构建生产版本

```bash
npm run tauri:build

# 构建结果位于：
# - Windows: src-tauri/target/release/bundle/
# - macOS: src-tauri/target/release/bundle/
```

## 项目结构

```
ADP-UiDesigner/
├── src/                    # 前端源代码
│   ├── main.jsx           # 入口文件
│   ├── App.jsx            # 主应用组件
│   ├── App.css            # 样式文件
│   └── style.css          # 全局样式
├── src-tauri/             # Rust 后端
│   ├── src/
│   │   └── main.rs        # Tauri 命令实现
│   ├── Cargo.toml         # Rust 依赖配置
│   ├── tauri.conf.json    # Tauri 配置
│   └── icons/             # 应用图标
├── res/                   # 资源文件
│   ├── packages/          # 需要复制的 packages
│   └── .env.development.local  # 环境配置
├── package.json           # 项目配置
└── vite.config.js         # Vite 配置
```

## 使用说明

### 1. 选择工作空间
- 点击"选择工作空间文件夹"按钮
- 选择一个空文件夹或已初始化的项目文件夹

### 2. 初始化项目
如果工作空间为空，应用会自动执行以下步骤：
1. **克隆仓库**
   - 主仓库：`laiye-monorepo-scaffold`
   - 应用仓库：`laiye-adp`

2. **复制资源**
   - 将 `res/packages` 复制到项目的 `packages` 目录

3. **安装依赖**
   - 在项目根目录运行 `pnpm install:all`

4. **配置环境**
   - 复制 `.env.development.local` 配置文件

### 3. 启动开发服务器
初始化完成后，点击"启动开发服务器"按钮即可启动应用。

## 常见问题

### Q: Git 权限错误怎么办？
A: 请确保您有访问以下仓库的权限：
- https://git.laiye.com/laiye-frontend-repos/laiye-monorepo-scaffold
- https://git.laiye.com/laiye-frontend-repos/laiye-adp

### Q: 依赖安装失败？
A: 可能是网络问题，可以尝试：
1. 检查网络连接
2. 配置 npm/pnpm 镜像源
3. 手动在工作空间运行 `pnpm install:all`

## 发布流程

### 自动构建（推荐）

使用 GitHub Actions 自动构建跨平台版本：

1. **推送到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/ADP-UiDesigner.git
   git push -u origin main
   ```

2. **触发构建**

   **方式 A：创建标签**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

   **方式 B：手动触发**
   - 访问 GitHub 仓库
   - 点击 "Actions" 标签
   - 选择 "Build macOS App"
   - 点击 "Run workflow"

3. **下载构建产物**
   - 在 Actions 页面下载生成的文件
   - Windows 版本：`.exe` 文件
   - macOS 版本：`.dmg` 文件

### 手动构建

#### Windows
```bash
npm run tauri:build
# 输出：src-tauri/target/release/adp-ui-designer.exe（绿色版）
```

#### macOS
需要在 macOS 上执行：
```bash
chmod +x build-macos.sh
./build-macos.sh
# 输出：ADP-UI-Designer-macOS-v1.0.0.dmg
```

详细的构建说明请参考：
- [BUILD_SUMMARY.md](./BUILD_SUMMARY.md) - 构建总结
- [BUILD_MACOS.md](./BUILD_MACOS.md) - macOS 构建说明
- [CROSS_PLATFORM_BUILD.md](./CROSS_PLATFORM_BUILD.md) - 跨平台构建指南

## 许可证

Copyright © 2025 ADP Team
