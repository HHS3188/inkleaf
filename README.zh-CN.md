# InkLeaf（墨笺）

Windows 本地优先的 Markdown / TXT / HTML 阅读与编辑器。

[English README](README.md)

## 简介

InkLeaf（中文名：墨笺）是一个面向 Windows 的本地文本阅读与轻量编辑工具。不依赖云服务，启动即用。适合日常文档阅读、写作草稿、Markdown 预览和源码查看。

## 功能

- 打开与编辑 Markdown / TXT / HTML 文件
- Reader（阅读）、Source（源码）、Split（分屏）三种模式
- 多标签页，支持脏状态标记与关闭确认
- 查找 / 替换 / 跳转到行
- 浅色 / 深色主题切换
- 字号、缩放（70%–300%）、行高、字体设置
- 最近文件列表（自动清理不存在的文件）
- 自动保存与本地草稿恢复
- 底部状态栏：行 / 列 / 字符数 / 文件类型 / 编码 / 缩放
- Markdown 格式工具栏（加粗、斜体、标题、列表、链接、代码等）
- 图片拖拽插入（自动复制到 assets 目录）
- 非图片文件拖入自动插入 Markdown 链接
- 大纲侧边栏（标题导航）
- Windows 文件关联（`.txt` / `.md` / `.markdown`）
- 首次启动默认应用设置引导
- 启动时自动检查 GitHub 更新

## 安装

从 [GitHub Releases](https://github.com/HHS3188/inkleaf/releases) 下载：

- **InkLeaf Setup 0.1.3.exe** — Windows 安装包（推荐 Windows 10/11）

下载后运行安装包，按提示完成安装。安装完成后可从开始菜单搜索 **InkLeaf** 启动。

安装包会注册 InkLeaf 为 `.txt` / `.md` / `.markdown` 的可选打开程序。首次启动时会提示是否打开 Windows 默认应用设置。

## 使用

### 文件操作

- `Ctrl+N` — 新建 Markdown
- `Ctrl+Shift+N` — 新建 TXT
- `Ctrl+O` — 打开文件
- `Ctrl+S` — 保存
- `Ctrl+Shift+S` — 另存为
- `Ctrl+W` — 关闭标签页

### 编辑

- `Ctrl+F` — 查找
- `Ctrl+H` — 替换
- `Ctrl+G` — 跳转到行
- `Ctrl+Z` / `Ctrl+Y` — 撤销 / 重做

### 视图模式

- `Ctrl+1` — 阅读模式
- `Ctrl+2` — 源码模式
- `Ctrl+3` — 分屏模式
- `Ctrl+Shift+L` — 切换大纲
- `Ctrl+鼠标滚轮` — 缩放

## 开发

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

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm vite:build
powershell -ExecutionPolicy Bypass -File .\scripts\check.ps1
```

## 发布

构建安装包：

```powershell
Remove-Item -Recurse -Force .\release -ErrorAction SilentlyContinue
pnpm build
```

输出：`release/InkLeaf Setup 0.1.3.exe`

## 已知限制

- 暂不支持大于 100 MB 的文件
- v0.1.3 暂停 Source ↔ Reader 双向选区映射，后续版本将基于 Markdown AST source map 重做

## 技术栈

Electron、React 19、TypeScript、Vite、pnpm、CodeMirror 6、react-markdown、Zustand

## 许可证

待定
