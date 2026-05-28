# InkLeaf / 墨笺

Windows 本地优先的轻量 Markdown / TXT / HTML 阅读编辑器。

A quiet, local-first reader and editor for Markdown, TXT, and HTML on Windows.

---

## 简介 / About

墨笺是一个面向 Windows 的本地文本阅读与轻量编辑工具。不依赖云服务，不开屏广告，启动即用。适合日常文档阅读、写作草稿、Markdown 预览和源码查看。

InkLeaf is a Windows-first local text reader and lightweight editor. No cloud dependency, no startup ads — just open and use. Designed for everyday document reading, writing drafts, Markdown preview, and source viewing.

## 功能 / Features

- 打开与编辑 Markdown / TXT / HTML 文件
- Reader（阅读）、Source（源码）、Split（分屏）三种模式
- 多标签页，支持脏状态标记与关闭确认
- 查找 / 替换 / 跳转到行
- 浅色 / 深色主题切换
- 字号、缩放（70%–200%）、行高、字体设置
- 最近文件列表
- 自动保存与本地草稿恢复
- 底部状态栏：行 / 列 / 字符数 / 文件类型 / 编码 / 缩放
- 图片拖拽插入（Markdown）
- Windows exe 安装包与 portable 版本

---

- Open and edit Markdown, TXT, and HTML files
- Reader, Source, and Split modes
- Real editor tabs with dirty state and close confirmation
- Find, Replace, Go to Line
- Light and dark themes
- Font size, zoom (70%–200%), line height, and font settings
- Recent files list
- Auto-save and local draft recovery
- Status bar: line, column, characters, file type, encoding, zoom
- Image drag-and-drop insertion (Markdown)
- Windows installer (exe) and portable builds

## 设计取向 / Design Philosophy

- **本地优先**：所有文件操作在本地完成，不上传到任何云端
- **轻量清爽**：接近记事本 / Typora 的桌面体验，无多余干扰
- **Source 模式无行号**：行号 gutter 已移除，行列信息通过底部状态栏显示

---

- **Local-first**: all file operations stay on your machine
- **Lightweight and clean**: Notepad / Typora-like desktop experience, no distractions
- **No line numbers in Source mode**: gutter removed; line/column shown in status bar

## 安装 / Installation

从 [GitHub Releases](https://github.com/HHS3188/inkleaf/releases) 下载：

- **InkLeaf Setup x.x.x.exe** — Windows 安装包（推荐 Windows 10/11）
- **InkLeaf x.x.x.exe** — Portable 免安装版本

Download from [GitHub Releases](https://github.com/HHS3188/inkleaf/releases):

- **InkLeaf Setup x.x.x.exe** — Windows installer (recommended for Windows 10/11)
- **InkLeaf x.x.x.exe** — Portable, no installation required

## 开发 / Development

```powershell
pnpm install
pnpm dev
```

`pnpm dev` starts Vite at `http://127.0.0.1:1420` and launches Electron after the renderer is ready.

常用命令 / Common commands:

```powershell
pnpm typecheck      # TypeScript 类型检查
pnpm lint           # ESLint
pnpm test           # Vitest 单元测试
pnpm vite:build     # Vite 生产构建
pnpm build          # Vite + Electron Builder 打包
```

## 项目状态 / Status

当前为早期版本（v0.1.0）。核心功能已可用，部分特性仍在完善中。

- MSI 安装包因依赖 WixToolset，暂未提供，后续版本补充
- 已知限制：大文件（>100MB）暂不支持

This is an early release (v0.1.0). Core features are functional; some areas are still being refined.

- MSI installer not yet available (requires WixToolset); planned for a future release
- Known limit: files larger than 100 MB are not supported

## 技术栈 / Tech Stack

Electron, React 19, TypeScript, Vite, pnpm, CodeMirror 6, react-markdown, Zustand, CSS variables

## License

TBD
