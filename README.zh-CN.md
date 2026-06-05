# InkLeaf（墨笺）

<p align="center">
  <strong>Windows 本地优先的 Markdown / TXT / HTML 阅读与轻量编辑器。</strong>
</p>

<p align="center">
  <a href="https://github.com/HHS3188/inkleaf/releases"><img alt="GitHub release" src="https://img.shields.io/github/v/release/HHS3188/inkleaf?display_name=tag"></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg"></a>
  <img alt="Platform: Windows" src="https://img.shields.io/badge/platform-Windows-blue">
  <img alt="Built with Electron" src="https://img.shields.io/badge/Electron-React%20%2B%20TypeScript-47848F">
</p>

<p align="center">
  <a href="README.md">English README</a> ·
  <a href="https://github.com/HHS3188/inkleaf/releases">下载安装包</a> ·
  <a href="SECURITY.md">安全说明</a> ·
  <a href="CONTRIBUTING.md">贡献指南</a>
</p>

## 简介

InkLeaf（墨笺）是一个面向 Windows 的本地文本阅读与轻量编辑工具，用于阅读、编辑和管理本地 Markdown、TXT、HTML 文件。它不依赖云服务，适合日常文档阅读、写作草稿、Markdown 预览、源码查看和轻量笔记整理。

项目重点是：

- **本地优先**：文件打开、编辑、保存、草稿恢复都在用户本机完成。
- **阅读和写作舒适**：Reader / Source / Split 三种模式，多标签页、大纲、主题、缩放和编辑工具栏。
- **桌面应用安全边界清晰**：重点处理外链、本地路径、Markdown/HTML 渲染、拖拽资源和 Electron IPC 边界。

## 功能概览

| 模块 | 当前支持 |
| --- | --- |
| 文件类型 | Markdown、TXT、HTML |
| 视图模式 | Reader 阅读、Source 源码、Split 分屏 |
| 编辑能力 | CodeMirror 6 编辑器、查找、替换、跳转到行、Markdown 工具栏 |
| 本地工作流 | 多标签页、脏状态、自动保存、草稿恢复、最近文件自动清理 |
| 导航 | 大纲侧边栏、标题跳转、底部状态栏 |
| 外观 | 浅色/深色主题、70%–300% 缩放、字体和行高设置 |
| Windows 集成 | 安装包、开始菜单入口、`.txt` / `.md` / `.markdown` 文件关联 |
| 安全关注面 | Markdown/HTML 清理、外链处理、文件路径、Electron IPC |

## 功能

- 打开与编辑 Markdown / TXT / HTML 文件。
- Reader（阅读）、Source（源码）、Split（分屏）三种模式。
- 多标签页，支持脏状态标记与关闭确认。
- 查找 / 替换 / 跳转到行。
- 浅色 / 深色主题切换。
- 字号、缩放、行高、字体设置。
- 最近文件列表自动清理不存在的文件。
- 自动保存与本地草稿恢复。
- 底部状态栏显示行、列、字符数、文件类型、编码和缩放。
- Markdown 格式工具栏：加粗、斜体、标题、列表、链接、代码等。
- 图片拖拽插入并自动复制到 assets 目录。
- 非图片文件拖入自动插入 Markdown 链接。
- 大纲侧边栏用于标题导航。
- Windows 文件关联：`.txt` / `.md` / `.markdown`。
- 首次启动默认应用设置引导。
- 启动时通过 GitHub Releases 检查更新。

## 安装

从 [GitHub Releases](https://github.com/HHS3188/inkleaf/releases) 下载最新版 Windows 安装包：

- **InkLeaf Setup 0.1.3.exe** — 推荐 Windows 10/11 使用。

下载后运行安装包，按提示完成安装。安装完成后可从开始菜单搜索 **InkLeaf** 启动。

安装包会注册 InkLeaf 为 `.txt` / `.md` / `.markdown` 的可选打开程序。首次启动时，InkLeaf 可以引导打开 Windows 默认应用设置。

## 使用

### 文件操作

| 快捷键 | 操作 |
| --- | --- |
| `Ctrl+N` | 新建 Markdown |
| `Ctrl+Shift+N` | 新建 TXT |
| `Ctrl+O` | 打开文件 |
| `Ctrl+S` | 保存 |
| `Ctrl+Shift+S` | 另存为 |
| `Ctrl+W` | 关闭标签页 |

### 编辑

| 快捷键 | 操作 |
| --- | --- |
| `Ctrl+F` | 查找 |
| `Ctrl+H` | 替换 |
| `Ctrl+G` | 跳转到行 |
| `Ctrl+Z` / `Ctrl+Y` | 撤销 / 重做 |

### 视图模式

| 快捷键 | 操作 |
| --- | --- |
| `Ctrl+1` | 阅读模式 |
| `Ctrl+2` | 源码模式 |
| `Ctrl+3` | 分屏模式 |
| `Ctrl+Shift+L` | 切换大纲 |
| `Ctrl+鼠标滚轮` | 缩放 |

## 安全模型

InkLeaf 会处理本地文件和渲染后的文档内容，所以安全边界很重要。当前重点关注：

- Markdown 和 HTML 渲染。
- 用户文档内容清理。
- 外部 URL 打开和危险 URL scheme 拦截。
- 本地文件路径处理。
- 拖拽资源处理。
- Electron 主进程 / 渲染进程 IPC 边界。
- 安装包和更新检查逻辑。

安全问题反馈请看 [SECURITY.md](SECURITY.md)。

## 开发

环境要求：

- Node.js 20+
- pnpm
- Windows 10/11，用于桌面打包验证

```powershell
pnpm install
pnpm dev
```

### 命令

```powershell
pnpm typecheck      # TypeScript 类型检查
pnpm lint           # ESLint
pnpm test           # Vitest 单元测试
pnpm vite:build     # Vite 生产构建
pnpm build          # Vite + Electron Builder 打包
```

## 验证

提交 PR 或发布候选版本前建议运行：

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm vite:build
powershell -ExecutionPolicy Bypass -File .\scripts\check.ps1
```

如果修改了 UI 或桌面行为，还需要本地启动应用，手动验证打开文件、保存、主题切换、标签页状态、外链和文件关联相关行为。

## 发布

构建 Windows 安装包：

```powershell
Remove-Item -Recurse -Force .\release -ErrorAction SilentlyContinue
pnpm build
```

预期输出：

```text
release/InkLeaf Setup 0.1.3.exe
```

## 路线图

- 重做 Markdown AST source map，用于未来恢复 Source ↔ Reader 选区同步。
- 增强大文件处理和渐进式加载能力。
- 增加文件操作与 Electron IPC 的自动化回归测试。
- 改进发布自动化和安全检查流程。
- 增加更多阅读主题和布局预设。

## 已知限制

- 暂不支持大于 100 MB 的文件。
- v0.1.3 暂停 Source ↔ Reader 双向选区映射，后续版本将基于 Markdown AST source map 重做。

## 技术栈

Electron、React 19、TypeScript、Vite、pnpm、CodeMirror 6、react-markdown、rehype-sanitize、DOMPurify、Zustand、Vitest。

## 贡献

欢迎提交 issue 和 pull request。提交前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

InkLeaf 使用 [MIT License](LICENSE) 开源。
