# 🚀 Dify 代理服务器部署指南

## 📋 概述

本指南将帮助您在服务器 `10.61.153.191` 上部署 Dify 代理服务器，解决 blog 项目连接 Dify 超时的问题。

## 🎯 解决方案

- **问题**: Netlify Functions 26秒超时限制
- **解决**: 部署专用代理服务器，支持5分钟超时
- **优势**: 更稳定的连接，更长的处理时间

## 📊 部署架构

```
前端应用 → 代理服务器(10.61.153.191:3001) → Dify API(47.90.156.219)
```

## 🔧 部署步骤

### 1. 自动部署 (推荐)

```bash
# 运行自动部署脚本
./scripts/auto-deploy.sh
```

### 2. 手动部署

#### 2.1 上传文件到服务器

```bash
# 使用 SCP 上传
scp -r deploy-package/* admin@10.61.153.191:/opt/dify-proxy/

# 或使用 SFTP
sftp admin@10.61.153.191
put -r deploy-package/* /opt/dify-proxy/
```

#### 2.2 SSH 连接到服务器

```bash
ssh admin@10.61.153.191
# 密码: Joyme0411!
```

#### 2.3 安装依赖并启动服务

```bash
cd /opt/dify-proxy

# 安装依赖
npm install

# 安装 PM2 (如果未安装)
npm install -g pm2

# 启动服务
./deploy.sh
```

### 3. 验证部署

```bash
# 检查服务状态
curl http://10.61.153.191:3001/health

# 预期响应
{
  "status": "ok",
  "timestamp": "2025-10-09T...",
  "dify_api": "http://47.90.156.219/v1"
}
```

## 🔧 前端配置更新

### 1. 自动更新配置

```bash
# 运行配置更新脚本
./scripts/update-frontend-config.sh
```

### 2. 手动更新配置

#### 2.1 更新 lib/dify-api.ts

```typescript
// 修改前
const DIFY_API_BASE_URL = '/api/dify-proxy'

// 修改后
const DIFY_API_BASE_URL = 'http://10.61.153.191:3001/api/dify-proxy'
```

#### 2.2 更新 .env.local

```bash
NEXT_PUBLIC_API_BASE_URL=http://10.61.153.191:3001/api/dify-proxy
API_AUTHORIZATION_TOKEN=app-EVYktrhqnqncQSV9BdDv6uuu
```

## 📊 服务管理

### PM2 管理命令

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs dify-proxy

# 重启服务
pm2 restart dify-proxy

# 停止服务
pm2 stop dify-proxy

# 保存配置
pm2 save

# 设置开机自启
pm2 startup
```

### 日志查看

```bash
# 查看应用日志
tail -f /opt/dify-proxy/logs/combined.log

# 查看错误日志
tail -f /opt/dify-proxy/logs/err.log

# 查看输出日志
tail -f /opt/dify-proxy/logs/out.log
```

## 🔍 故障排除

### 1. 服务无法启动

```bash
# 检查端口占用
netstat -tlnp | grep 3001

# 检查 Node.js 版本
node --version

# 检查依赖安装
npm list
```

### 2. 连接超时

```bash
# 测试网络连通性
ping 47.90.156.219

# 测试 Dify API
curl -v http://47.90.156.219/v1/health
```

### 3. 权限问题

```bash
# 设置文件权限
chmod +x /opt/dify-proxy/deploy.sh
chown -R admin:admin /opt/dify-proxy
```

## 📋 配置说明

### 代理服务器配置

- **端口**: 3001
- **超时**: 5分钟 (300秒)
- **连接池**: 保持连接，最大10个连接
- **重试**: 2次重试，1秒间隔

### 环境变量

```bash
PORT=3001
DIFY_API_BASE_URL=http://47.90.156.219/v1
DIFY_API_TOKEN=app-EVYktrhqnqncQSV9BdDv6uuu
NODE_ENV=production
```

## 🎯 API 端点

- `GET /health` - 健康检查
- `POST /api/dify-proxy` - Dify API 代理
- `POST /api/scrape-content` - 内容抓取代理

## 🔒 安全考虑

1. **防火墙配置**: 确保端口3001对外开放
2. **访问控制**: 考虑添加IP白名单
3. **HTTPS**: 生产环境建议使用HTTPS
4. **监控**: 设置服务监控和告警

## 📊 性能优化

1. **连接池**: 使用HTTP连接池减少连接开销
2. **缓存**: 考虑添加响应缓存
3. **负载均衡**: 多实例部署提高可用性
4. **监控**: 添加性能监控和日志分析

## 🚀 部署完成检查清单

- [ ] 代理服务器成功启动
- [ ] 健康检查返回正常
- [ ] 前端配置已更新
- [ ] Dify API 调用测试成功
- [ ] 超时问题已解决
- [ ] 日志记录正常
- [ ] 服务监控已配置

## 📞 支持

如果遇到问题，请检查：

1. 服务器网络连通性
2. 服务日志文件
3. 端口占用情况
4. 环境变量配置

---

**部署完成后，您的 blog 项目将使用新的代理服务器，解决 Dify API 超时问题！** 🎉

