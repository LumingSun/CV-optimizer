# 部署指南

## 🚀 生产环境部署

本文档描述如何将 SmartResume 部署到生产环境。

## 📋 预检查清单

- [ ] Node.js 版本 >= 16.0
- [ ] npm 或 yarn 已安装
- [ ] 有 Gemini API Key（可选）
- [ ] 了解基本的 Git 操作

## 🏗️ 构建生产版本

### 步骤 1：准备环境

```bash
cd /Volumes/external/luming/CV-optimizer

# 如果未安装依赖
npm install

# 或使用 yarn
yarn install
```

### 步骤 2：配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 添加你的 API Key：

```
VITE_GEMINI_API_KEY=your-actual-api-key
```

### 步骤 3：构建项目

```bash
npm run build
```

构建完成后，会在 `dist` 目录生成优化的静态文件：

```
dist/
├── index.html          # 主 HTML 文件
├── assets/
│   ├── index.*.js      # 捆绑的 JavaScript
│   └── index.*.css     # 捆绑的 CSS
└── ...
```

### 步骤 4：本地验证

```bash
npm run preview
```

在浏览器中访问提示的 URL（通常是 `http://localhost:4173`）进行验证。

## 🌐 部署方案

### 方案 1：Vercel（推荐）

**优点**：完全免费，部署简单，自动 HTTPS，CDN 加速

#### 步骤

1. **连接 GitHub**
   - 将项目推送到 GitHub
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 选择 GitHub 仓库

2. **配置环境变量**
   - 在 Vercel 项目设置中
   - 添加环境变量 `VITE_GEMINI_API_KEY=your-key`

3. **自动部署**
   - 项目会自动检测 `package.json`
   - 自动运行 `npm run build`
   - 生成部署链接

#### Vercel 配置文件 (vercel.json)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_GEMINI_API_KEY": "@gemini_api_key"
  }
}
```

### 方案 2：Netlify

**优点**：功能丰富，构建时间充足，支持函数

#### 步骤

1. 访问 [netlify.com](https://netlify.com)
2. 连接 GitHub 账户
3. 选择仓库
4. 设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
5. 添加环境变量
6. Deploy

#### Netlify 配置文件 (netlify.toml)

```toml
[build]
  command = "npm run build"
  publish = "dist"

[env]
  VITE_GEMINI_API_KEY = "your-key"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 方案 3：GitHub Pages

**优点**：完全免费，集成度高

#### 步骤

1. 编辑 `vite.config.js`：

```js
export default defineConfig({
  base: '/CV-optimizer/',  // 替换为你的仓库名
  // ... 其他配置
})
```

2. 创建 GitHub Action (.github/workflows/deploy.yml)：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

3. 推送到 GitHub
4. 访问 `https://yourusername.github.io/CV-optimizer/`

### 方案 4：Docker 部署

**优点**：可在任何支持 Docker 的服务器运行

#### Dockerfile

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

#### Docker Compose

```yaml
version: '3.8'
services:
  smartresume:
    build: .
    ports:
      - "3000:3000"
    environment:
      - VITE_GEMINI_API_KEY=your-key
```

运行：
```bash
docker-compose up
```

### 方案 5：自托管（VPS/服务器）

**要求**：Nginx/Apache 服务器

#### Nginx 配置

```nginx
server {
    listen 80;
    server_name example.com;

    root /var/www/smartresume/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 缓存设置
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 部署步骤

```bash
# 在服务器上
cd /var/www/smartresume

# 克隆项目
git clone <your-repo-url> .

# 安装依赖
npm install --production

# 构建
npm run build

# 启动 Nginx
sudo systemctl start nginx
```

## 🔒 安全最佳实践

### 1. API Key 管理

**❌ 不要这样做**：
```jsx
const apiKey = "sk-xxxx";  // 暴露在代码中！
```

**✅ 应该这样做**：
```jsx
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
```

### 2. 环境变量

- 使用 `.env.local` 存储本地密钥
- 在部署平台中设置环境变量
- `.env.local` 添加到 `.gitignore`

### 3. HTTPS 配置

所有部署方案都应使用 HTTPS：

```bash
# Certbot (Let's Encrypt)
sudo certbot certonly --standalone -d example.com
```

### 4. API 密钥轮换

定期轮换 API 密钥：
1. 生成新密钥
2. 在部署平台更新
3. 删除旧密钥

## 📊 性能优化

### 已包含的优化

- ✅ Vite 自动代码分割
- ✅ CSS 压缩和内联
- ✅ JavaScript 最小化
- ✅ 图片优化

### 检查构建大小

```bash
npm run build

# 查看 dist 目录大小
du -sh dist/
```

### 进一步优化

```json
{
  "build": {
    "minify": "terser",
    "rollupOptions": {
      "output": {
        "manualChunks": {
          "react": ["react", "react-dom"]
        }
      }
    }
  }
}
```

## 🐛 故障排查

### 问题：构建失败

```bash
# 清除缓存
rm -rf node_modules dist
npm install
npm run build
```

### 问题：部署后白屏

- 检查浏览器控制台错误
- 确认环境变量正确
- 检查 base URL 配置

### 问题：API 请求失败

```javascript
// 添加日志进行调试
console.log('API Key:', import.meta.env.VITE_GEMINI_API_KEY);
console.log('API URL:', apiUrl);
```

## 📈 监控和日志

### Vercel 监控
- https://vercel.com/dashboard
- 查看构建日志、部署历史
- 实时错误追踪

### Netlify 监控
- https://app.netlify.com
- 检查构建日志
- 使用 Netlify Analytics

## 🔄 CI/CD 流程

### GitHub Actions 示例

```yaml
name: Test and Build

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run lint (if available)
```

## 📝 检查清单

- [ ] 环境变量已配置
- [ ] API Key 未在版本控制中
- [ ] `npm run build` 成功完成
- [ ] `npm run preview` 无错误
- [ ] 已选择部署方案
- [ ] 已配置生产 URL
- [ ] 已验证部署链接
- [ ] 已测试所有功能
- [ ] 已配置域名（如需要）
- [ ] 已启用 HTTPS

## 🎉 部署完成

祝贺！你的 SmartResume 已部署到生产环境。

### 后续步骤

1. 监控应用性能
2. 收集用户反馈
3. 定期更新依赖
4. 添加更多功能
5. 优化用户体验

---

**需要帮助？** 查看相应部署平台的官方文档。
