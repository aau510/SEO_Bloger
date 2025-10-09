# Dify 代理服务器

## 功能
- 代理 Dify API 请求，解决跨域和超时问题
- 支持长时间运行的 Dify 工作流
- 提供健康检查和日志记录

## 部署步骤

### 1. 上传文件到服务器
```bash
scp -r deploy-package/* admin@10.61.153.191:/opt/dify-proxy/
```

### 2. SSH 连接到服务器
```bash
ssh admin@10.61.153.191
```

### 3. 安装依赖
```bash
cd /opt/dify-proxy
npm install
```

### 4. 启动服务
```bash
./deploy.sh
```

### 5. 验证服务
```bash
curl http://localhost:3001/health
```

## 配置
- 端口: 3001
- Dify API: http://47.90.156.219/v1
- 超时: 5分钟

## 管理命令
```bash
# PM2 管理
pm2 status
pm2 logs dify-proxy
pm2 restart dify-proxy
pm2 stop dify-proxy

# 查看日志
tail -f logs/combined.log
```

## API 端点
- GET /health - 健康检查
- POST /api/dify-proxy - Dify API 代理
- POST /api/scrape-content - 内容抓取代理
