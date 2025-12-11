# SmartResume - AI 简历编辑助手

一个现代化的 React + Tailwind CSS 简历编辑工具，集成 Google Gemini API 进行 AI 智能优化。

## 项目特性

- ✨ **实时预览** - 编辑时实时预览简历效果
- 🎨 **多种模板** - 现代蓝、经典白、极简紫三种专业风格
- 🤖 **AI 优化** - 使用 Gemini API 智能润色简历内容
- 📋 **灵活编辑** - 支持拖拽调整模块顺序
- 📱 **响应式设计** - 桌面端最佳体验
- 📥 **PDF 导出** - 一键打印导出为 PDF

## 环境要求

- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器

## 安装步骤

### 1. 安装依赖

```bash
cd /Volumes/external/luming/CV-optimizer
npm install
```

如果使用 yarn：
```bash
yarn install
```

### 2. 配置 Gemini API

1. 获取 Gemini API Key：
   - 访问 [Google AI Studio](https://aistudio.google.com/)
   - 点击 "Get API Key"
   - 复制你的 API Key

2. 在 `src/App.jsx` 中找到第 26 行：
   ```jsx
   const apiKey = "";
   ```
   
   替换为你的 API Key：
   ```jsx
   const apiKey = "your-api-key-here";
   ```

> ⚠️ **安全提示**：不要在生产环境中直接在代码中暴露 API Key。建议使用环境变量。

## 运行项目

### 开发模式

```bash
npm run dev
```

项目将在 `http://localhost:5173` 自动打开浏览器。

### 生产构建

```bash
npm run build
```

构建完成后，静态文件将在 `dist` 目录中。

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
CV-optimizer/
├── src/
│   ├── App.jsx          # 主应用组件
│   ├── main.jsx         # React 入口
│   ├── index.css        # 全局样式
│   └── ...
├── index.html           # HTML 入口
├── package.json         # 项目配置
├── vite.config.js       # Vite 构建配置
├── tailwind.config.js   # Tailwind CSS 配置
├── postcss.config.js    # PostCSS 配置
└── .gitignore
```

## 依赖说明

### 生产依赖
- **React 18.2** - UI 框架
- **React DOM 18.2** - React DOM 渲染
- **lucide-react 0.263** - 美观的 SVG 图标库

### 开发依赖
- **Vite 5** - 高性能构建工具
- **@vitejs/plugin-react** - React 插件
- **Tailwind CSS 3.3** - 原子化 CSS 框架
- **PostCSS & AutoPrefixer** - CSS 后处理

## 使用指南

### 编辑简历
1. 点击左侧边栏的 👤 按钮进入编辑模式
2. 编辑基本信息、个人简介、工作经历、教育背景、技能等
3. 使用上下箭头调整模块顺序

### AI 优化
1. 点击左侧边栏的 ✨ 按钮进入 AI 优化模式
2. 输入优化指令（如"优化工作描述"、"调整顺序"等）
3. AI 将自动优化简历内容

### 设置目标职位
1. 点击左侧边栏的 💼 按钮
2. 粘贴招聘岗位描述
3. AI 将根据 JD 定制化优化简历

### 导出 PDF
1. 点击左侧边栏的 ⬇️ 按钮
2. 在浏览器打印对话框中选择"保存为 PDF"

### 切换模板
在右侧预览区顶部选择模板风格：
- 🔵 现代蓝 - 深色优雅风格
- ⚪ 经典白 - 传统专业风格
- 💜 极简紫 - 现代简约风格

## 常见问题

### Q: API Key 怎么获取？
A: 访问 [Google AI Studio](https://aistudio.google.com/)，点击 "Get API Key" 按钮即可获取免费的 API Key。

### Q: 支持离线使用吗？
A: 基础编辑功能支持离线使用，但 AI 优化功能需要网络连接和有效的 API Key。

### Q: 简历数据怎么保存？
A: 当前版本数据存储在浏览器本地内存中，刷新页面会重置。建议导出为 PDF 保存。

### Q: 支持导入现有简历吗？
A: 当前版本不支持导入，但可以手动编辑和填充信息。

## 提示和建议

- 使用"现代蓝"模板适合科技公司
- "经典白"适合传统行业
- "极简紫"适合创意类岗位
- AI 优化效果取决于输入的指令清晰度
- 定期使用 AI 优化功能针对不同职位定制简历

## 技术栈

- **前端框架**: React 18
- **构建工具**: Vite
- **样式方案**: Tailwind CSS
- **组件库**: Lucide React Icons
- **API**: Google Gemini API

## 许可证

MIT

## 支持和反馈

如有问题或建议，欢迎反馈！

---

祝你找到满意的工作! 🚀
