# GitHub 仓库设置指南

## 快速开始

### 步骤 1：创建 GitHub 仓库

1. 访问 https://github.com/new
2. 创建新仓库，命名为 `ADP-UiDesigner`
3. **不要**初始化 README、.gitignore 或 license
4. 点击"Create repository"

### 步骤 2：推送代码

**在项目根目录执行：**

```bash
# 初始化 git 仓库（已完成）
git init

# 添加所有文件
git add .

# 创建首次提交
git commit -m "Initial commit: ADP UI Designer v1.0.0

- 跨平台桌面应用（Windows + macOS）
- 资源文件嵌入
- 自动化构建流程
- GitHub Actions 配置"

# 添加远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/ADP-UiDesigner.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 步骤 3：触发 macOS 构建

**方式 A：通过 Git 标签（推荐）**

```bash
# 创建版本标签
git tag v1.0.0

# 推送标签到 GitHub
git push origin v1.0.0
```

这会自动触发 GitHub Actions 构建流程。

**方式 B：通过 GitHub 网页**

1. 访问你的仓库：`https://github.com/YOUR_USERNAME/ADP-UiDesigner`
2. 点击顶部的 "Actions" 标签
3. 选择 "Build macOS App" 工作流
4. 点击 "Run workflow" 按钮
5. 选择 `main` 分支
6. 点击绿色的 "Run workflow" 按钮

### 步骤 4：下载构建产物

**等待构建完成**（约 2-3 分钟）

1. 访问仓库的 "Actions" 页面
2. 点击最近的构建任务
3. 滚动到页面底部的 "Artifacts" 部分
4. 下载 `macos-app` 文件（包含 DMG 和 .app）

## 创建 Release（可选）

### 通过 Git 命令

```bash
# 推送标签后，GitHub 会自动创建 Release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

### 通过 GitHub 网页

1. 访问仓库
2. 点击右侧的 "Releases"
3. 点击 "Draft a new release"
4. 填写信息：
   - Tag: `v1.0.0`
   - Title: `ADP UI Designer v1.0.0`
   - Description: 发布说明
5. 点击 "Publish release"

## 分发文件位置

### Windows 版本（本地构建）
```
ADP-UI-Designer-Windows-v1.0.0-Final/
├── ADP UI Designer.exe    # 8.1 MB 绿色版
└── 使用说明.txt
```

### macOS 版本（GitHub Actions 构建）
- 下载位置：GitHub Actions 页面 → Artifacts → `macos-app`
- 内容：`.dmg` 文件和 `.app` 包

## GitHub Actions 工作流

配置文件位于：`.github/workflows/build-macos.yml`

**触发条件：**
- 推送标签：`v*`
- 手动触发

**构建内容：**
- macOS 应用包
- DMG 镜像文件

## 常见问题

### Q: 推送时提示"权限被拒绝"
A: 检查 Git 配置：
```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Q: GitHub Actions 构建失败
A: 检查 Actions 页面的错误日志，常见原因：
- 依赖安装失败
- 构建时间过长
- 配置文件错误

### Q: 如何更新构建？
A:
1. 修改代码
2. 提交更改：`git commit -am "Update description"`
3. 推送：`git push`
4. 创建新标签：`git tag v1.0.1 && git push origin v1.0.1`

## 下一步

- [ ] 推送代码到 GitHub
- [ ] 验证 GitHub Actions 构建成功
- [ ] 下载 macOS 版本并测试
- [ ] 创建正式 Release
- [ ] 分发给团队使用

## 相关文档

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [语义化版本](https://semver.org/lang/zh-CN/)
- [Tauri 分发指南](https://tauri.app/v1/guides/distribution/)
