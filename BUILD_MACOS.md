# macOS 构建说明

## 前置要求

在 macOS 上构建此应用，需要安装以下工具：

1. **Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

2. **Rust**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

3. **Node.js & npm**
   从 https://nodejs.org 下载并安装 Node.js 18+

4. **pnpm**
   ```bash
   npm install -g pnpm
   ```

## 构建步骤

### 1. 克隆或下载项目

```bash
cd ADP-UiDesigner
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 构建 macOS 应用

```bash
pnpm install
pnpm run tauri:build
```

构建完成后，macOS 应用包位于：
```
src-tauri/target/release/bundle/macos/ADP UI Designer.app
```

### 4. 创建绿色版

```bash
# 创建分发目录
mkdir -p ADP-UI-Designer-macOS-v1.0.0

# 复制 .app 包
cp -r "src-tauri/target/release/bundle/macos/ADP UI Designer.app" ADP-UI-Designer-macOS-v1.0.0/

# 创建 DMG 镜像（可选）
hdiutil create -volname "ADP UI Designer" -srcfolder ADP-UI-Designer-macOS-v1.0.0 -ov -format UDZO ADP-UI-Designer-macOS-v1.0.0.dmg
```

## 平台兼容性说明

### 已处理的平台差异

1. **CMD 窗口隐藏**
   - Windows: 使用 `CREATE_NO_WINDOW` 标志
   - macOS: 不需要特殊处理，默认不显示终端窗口

2. **命令执行**
   - Windows: 使用 `cmd /C` 执行命令
   - macOS: 直接执行命令
   - 其他 Unix: 直接执行命令

3. **路径处理**
   - 使用 Rust 的 `std::path::Path` 自动处理不同平台的路径分隔符
   - 资源嵌入路径使用正斜杠，跨平台兼容

4. **文件打开**
   - Windows: 使用 `explorer`
   - macOS: 使用 `open`
   - Linux: 使用 `xdg-open`

### 测试清单

在 macOS 上测试以下功能：

- [ ] 应用启动
- [ ] 环境检测（Node.js, pnpm, git, claude）
- [ ] 工作空间选择和创建
- [ ] 主仓库克隆
- [ ] 应用仓库克隆
- [ ] 资源文件提取（packages）
- [ ] 环境配置文件复制
- [ ] 依赖安装
- [ ] 开发服务器启动
- [ ] 开发服务器停止
- [ ] 文件夹打开
- [ ] UI 页面管理

## 常见问题

### Q: 构建时提示 "cargo not found"
A: 需要先安装 Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

### Q: 构建时提示 "xcodebuild not found"
A: 需要安装 Xcode Command Line Tools: `xcode-select --install`

### Q: 应用无法启动（未签名警告）
A: 右键点击 .app 包，选择"打开"，然后在弹出的安全警告中点击"打开"按钮

### Q: 资源文件未正确提取
A: 检查 `src-tauri/res` 目录是否存在，并且包含必要的文件

## 签名和公证（可选）

如果需要分发应用，建议进行签名和公证：

### 1. 创建开发者证书
在 Apple Developer 账户中创建开发者证书

### 2. 签名应用
```bash
codesign --force --deep --sign "Developer ID Application: Your Name" "ADP UI Designer.app"
```

### 3. 公证应用
```bash
xcrun notarytool submit "ADP UI Designer.app" --apple-id "your@email.com" --password "app-specific-password" --team-id "your-team-id" --wait
```

### 4. 装订公证票据
```bash
xcrun stapler staple "ADP UI Designer.app"
```
