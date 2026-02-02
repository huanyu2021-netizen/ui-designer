#!/bin/bash

# macOS 构建脚本
# 用于在 macOS 上构建 ADP UI Designer

set -e

echo "=========================================="
echo "ADP UI Designer - macOS 构建脚本"
echo "=========================================="

# 检查必要的工具
echo "1. 检查构建环境..."

if ! command -v cargo &> /dev/null; then
    echo "错误: 未找到 Rust"
    echo "请运行: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "错误: 未找到 Node.js"
    echo "请从 https://nodejs.org 下载安装"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "错误: 未找到 pnpm"
    echo "请运行: npm install -g pnpm"
    exit 1
fi

echo "✓ 构建环境检查完成"

# 安装依赖
echo ""
echo "2. 安装依赖..."
pnpm install

# 构建 Tauri 应用
echo ""
echo "3. 构建 macOS 应用..."
pnpm run tauri:build

# 检查构建结果
APP_PATH="src-tauri/target/release/bundle/macos/ADP UI Designer.app"

if [ ! -d "$APP_PATH" ]; then
    echo "错误: 构建失败，未找到 .app 包"
    exit 1
fi

echo "✓ 构建成功"

# 创建分发目录
VERSION="1.0.0"
DIST_DIR="ADP-UI-Designer-macOS-v$VERSION"
DMG_FILE="ADP-UI-Designer-macOS-v$VERSION.dmg"

echo ""
echo "4. 创建分发包..."

# 清理旧的分发目录
rm -rf "$DIST_DIR"
rm -f "$DMG_FILE"

# 创建新的分发目录
mkdir -p "$DIST_DIR"

# 复制 .app 包
cp -R "$APP_PATH" "$DIST_DIR/"

# 创建使用说明
cat > "$DIST_DIR/使用说明.txt" << 'EOF'
ADP UI Designer - macOS 版本
================================

版本：1.0.0
平台：macOS

使用方法：
---------
1. 双击 "ADP UI Designer.app" 启动应用
2. 如果提示"无法打开，因为无法验证开发者"，请：
   - 右键点击应用，选择"打开"
   - 在弹出的安全警告中点击"打开"按钮
   - 或者前往"系统偏好设置" > "安全性与隐私" > "通用"，点击"仍要打开"

3. 首次运行需要初始化工作空间

注意事项：
---------
- 需要 macOS 10.15 (Catalina) 或更高版本
- 首次启动可能需要系统权限允许
- 建议将应用拖拽到"应用程序"文件夹使用

资源文件已内置到应用中，无需额外的配置文件。

功能说明：
---------
- 工作空间初始化
- Git 仓库管理
- 依赖安装
- 开发服务器启动
- UI 页面管理
EOF

echo "✓ 分发包创建完成"

# 创建 DMG 镜像（可选）
echo ""
echo "5. 创建 DMG 镜像..."
if command -v hdiutil &> /dev/null; then
    hdiutil create -volname "ADP UI Designer" -srcfolder "$DIST_DIR" -ov -format UDZO "$DMG_FILE"
    echo "✓ DMG 镜像创建完成: $DMG_FILE"
else
    echo "跳过 DMG 创建（hdiutil 不可用）"
fi

# 显示构建结果
echo ""
echo "=========================================="
echo "构建完成！"
echo "=========================================="
echo ""
echo "输出文件："
echo "  - 应用包: $DIST_DIR/ADP UI Designer.app"
echo "  - 使用说明: $DIST_DIR/使用说明.txt"
if [ -f "$DMG_FILE" ]; then
    echo "  - DMG 镜像: $DMG_FILE ($(du -h "$DMG_FILE" | cut -f1))"
fi
echo ""
echo "大小："
du -sh "$DIST_DIR"
echo ""
echo "安装或分发："
echo "  1. 直接使用 $DIST_DIR 文件夹"
echo "  2. 或分发 DMG 文件给其他用户"
echo ""
