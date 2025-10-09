# 🚀 快速部署指南

## 📋 服务器信息
- **地址**: `10.61.197.191`
- **用户名**: `Joyme0411!`
- **密码**: `liveme@2022`

## 🔧 部署步骤

### 1. 上传文件
```bash
# 方法A: 使用 SFTP
sftp Joyme0411!@10.61.197.191
# 输入密码: liveme@2022
put dify-proxy-deployment.tar.gz /opt/
quit

# 方法B: 使用 SCP (如果支持)
scp dify-proxy-deployment.tar.gz "Joyme0411!@10.61.197.191:/opt/"
```

### 2. SSH 连接服务器
```bash
ssh Joyme0411!@10.61.197.191
# 输入密码: liveme@2022
```

### 3. 解压并部署
```bash
cd /opt
tar -xzf dify-proxy-deployment.tar.gz
mv deploy-package dify-proxy
cd dify-proxy
chmod +x deploy.sh
./deploy.sh
```

### 4. 验证部署
```bash
curl http://localhost:3001/health
```

## 🎯 预期结果
```json
{
  "status": "ok",
  "timestamp": "2025-10-09T...",
  "dify_api": "http://47.90.156.219/v1"
}
```

## 🔧 服务管理
```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs dify-proxy

# 重启服务
pm2 restart dify-proxy
```

## 📊 部署完成后
- **代理地址**: `http://10.61.197.191:3001`
- **健康检查**: `http://10.61.197.191:3001/health`
- **API 代理**: `http://10.61.197.191:3001/api/dify-proxy`

---
**部署完成后，前端将自动使用新的代理服务器！** 🎉

