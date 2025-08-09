# IDE 白色主题配置

本项目包含了多种IDE的白色主题配置文件，让您的开发环境更加明亮舒适。

## 配置文件说明

### 1. VS Code 配置 (`.vscode/settings.json`)
- 使用 `Default Light+` 主题
- 优化的字体和字号设置
- 启用了多种编辑器增强功能
- 自动保存和Git集成

### 2. Cursor AI编辑器配置 (`.cursorrules`)
- 白色主题设置
- AI助手优化配置
- 代码风格规范

### 3. 通用编辑器配置 (`.editorconfig`)
- 适用于多种IDE的代码格式规范
- 统一的缩进和编码设置
- 支持多种编程语言

## 使用方法

### VS Code
1. 打开VS Code
2. 项目会自动应用 `.vscode/settings.json` 中的配置
3. 如果主题没有自动切换，可以按 `Ctrl+Shift+P` 打开命令面板
4. 输入 "Preferences: Color Theme"
5. 选择 "Default Light+" 主题

### Cursor
1. 打开Cursor编辑器
2. 项目会自动读取 `.cursorrules` 配置
3. 确保在设置中启用了白色主题

### 其他IDE
- 支持EditorConfig的IDE会自动应用 `.editorconfig` 配置
- 包括：WebStorm、IntelliJ IDEA、Sublime Text、Atom等

## 自定义配置

您可以根据个人喜好修改这些配置文件：

- 修改字体大小：更改 `editor.fontSize` 值
- 修改字体：更改 `editor.fontFamily` 值
- 修改主题：更改 `workbench.colorTheme` 值

## 推荐扩展

为了获得更好的白色主题体验，建议安装以下VS Code扩展：

- **Material Icon Theme**: 提供清晰的图标
- **Bracket Pair Colorizer**: 括号配对高亮
- **Auto Rename Tag**: HTML标签自动重命名
- **Prettier**: 代码格式化
- **ESLint**: JavaScript代码检查

## 注意事项

- 配置文件会覆盖IDE的默认设置
- 如果遇到问题，可以删除对应的配置文件恢复默认设置
- 建议定期备份您的个人配置


