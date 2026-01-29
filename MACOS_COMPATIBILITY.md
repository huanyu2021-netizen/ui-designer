# macOS 版本兼容性说明

## 🔍 检查你的 macOS 版本

点击屏幕左上角  → **关于本机**

查看版本号，格式如：
- macOS Ventura 13
- macOS Monterey 12
- macOS Big Sur 11
- macOS Catalina 10.15
- macOS Mojave 10.14
- macOS High Sierra 10.13

## ⚠️ 版本要求

**最低要求：macOS 10.13 (High Sierra, 2017)**

如果你的版本低于 10.13，需要升级系统。

## 🔧 解决方案

### 方案 1：检查是否是权限问题（最常见）

即使版本满足要求，也可能因为"未签名"被阻止。尝试：

**步骤 1：右键打开**
1. **右键点击** `ADP UI Designer.app`
2. 按住 **键盘上的 Option 键**
3. 点击"打开"
4. 在弹出的警告对话框中点击"打开"

**步骤 2：系统设置**
1. 打开 **系统偏好设置** → **安全性与隐私**
2. 找到"已阻止使用 `ADP UI Designer.app`"
3. 点击"仍要打开"

### 方案 2：移除隔离属性

在 **终端** 中运行：

```bash
# 拖拽应用到终端窗口，然后运行
xattr -cr .

# 或者手动指定路径
xattr -cr /Users/你的用户名/Downloads/ADP-UI-Designer-macOS-v1.0.0/ADP\ UI\ Designer.app
```

### 方案 3：从终端运行

```bash
# 进入应用所在目录
cd ~/Downloads/ADP-UI-Designer-macOS-v1.0.0/

# 直接运行
open "ADP UI Designer.app"
```

## 🚫 如果版本太老（低于 10.13）

### 升级建议

**免费升级到最新版 macOS：**

1. **检查兼容性**
   - 访问：https://github.com/apple-opensource/macos
   - 查看你的 Mac 是否支持最新系统

2. **支持的 Mac**（可以升级到 macOS 12 Monterey）
   - iMac (2017 年末及以后)
   - iMac Pro (2017)
   - MacBook Pro (2018 年及以后)
   - MacBook Air (2018 年及以后)
   - Mac mini (2018 年及以后)

3. **不支持的 Mac**（最高只能到 macOS 10.15.7 Catalina）
   - MacBook (2015 年初及以前)
   - MacBook Pro (2015 年中以前)
   - MacBook Air (2017 年中以前)
   - Mac mini (2014 年以前)
   - iMac (2015 年中以前)

## 💡 临时解决方案

如果你的 Mac **无法升级**，可以使用以下替代方案：

### 方案 A：使用 Windows 版本

如果你有：
- Windows 10/11 电脑 → 直接使用 Windows 绿色版 ✅
- 虚拟机 (Parallels/VMware) → 在虚拟机中运行 Windows 版本

### 方案 B：使用 Web 版本（如果有）

如果是团队使用，可以考虑：
- 将此工具部署为 Web 应用
- 在浏览器中访问使用

## 📋 系统版本对照表

| macOS 名称 | 版本号 | 发布年份 | 是否支持 |
|---------|-------|---------|---------|
| macOS Sequo | 15.x | 2024 | ✅ 支持 |
| macOS Sonoma | 14.x | 2023 | ✅ 支持 |
| macOS Ventura | 13.x | 2022 | ✅ 支持 |
| macOS Monterey | 12.x | 2021 | ✅ 支持 |
| macOS Big Sur | 11.x | 2020 | ✅ 支持 |
| macOS Catalina | 10.15 | 2019 | ✅ 支持 |
| macOS Mojave | 10.14 | 2018 | ✅ 支持 |
| macOS High Sierra | 10.13 | 2017 | ✅ 支持 |
| macOS Sierra | 10.12 | 2016 | ❌ 不支持 |
| macOS El Capitan | 10.11 | 2015 | ❌ 不支持 |

## 🎯 推荐配置

**最佳体验：**
- macOS 12 (Monterney) 或更高
- 至少 4GB 内存
- 至少 500MB 可用磁盘空间

**最低配置：**
- macOS 10.13 (High Sierra)
- 2GB 内存
- 200MB 可用磁盘空间

---

**状态：**
- ✅ 配置已更新：最低版本设为 macOS 10.13
- ⏳ 需要重新构建 macOS 版本
- 💡 推荐使用 Windows 版本作为备用
