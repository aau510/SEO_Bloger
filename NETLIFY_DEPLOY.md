# Netlify 部署指南

## 🚀 部署步骤

### 1. 准备代码
```bash
git add .
git commit -m "feat: 添加Netlify部署配置"
git push origin main
```

### 2. 在Netlify创建新站点
1. 访问 [Netlify](https://app.netlify.com/)
2. 点击 "New site from Git"
3. 选择 GitHub 并授权
4. 选择 `SEO_Bloger` 仓库

### 3. 配置构建设置
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Functions directory**: `.netlify/functions`

### 4. 设置环境变量
在 Netlify 控制台的 "Site settings" > "Environment variables" 中添加：

```
NEXT_PUBLIC_API_BASE_URL = /api/dify-proxy
API_AUTHORIZATION_TOKEN = app-EVYktrhqnqncQSV9BdDv6uuu
NEXT_PUBLIC_SITE_NAME = SEO博客智能体
NEXT_PUBLIC_SITE_DESCRIPTION = 基于Dify工作流的智能SEO博客生成系统
```

### 5. 部署
点击 "Deploy site" 按钮开始部署。

## 🔧 配置文件说明

- `netlify.toml`: Netlify 配置文件
- `next.config.js`: Next.js 配置（已优化Netlify）
- `env.netlify.template`: 环境变量模板

## 🎯 优势

- **更好的网络连接**: Netlify 对 HTTP API 调用限制更少
- **自动部署**: Git 推送自动触发部署
- **免费额度**: 足够个人和小团队使用
- **全球CDN**: 更快的访问速度

## 📊 预期结果

部署成功后，应该能够：
- ✅ 正常访问网站
- ✅ 成功调用 Dify API
- ✅ 完整的 SEO 博客生成功能
- ✅ 解决 Mixed Content 问题
