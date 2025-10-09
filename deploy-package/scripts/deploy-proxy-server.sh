#!/bin/bash
# 文件名：deploy-proxy-server.sh
# 用途：在服务器 10.61.153.191 上部署 Dify 代理服务

echo "🚀 开始部署 Dify 代理服务器到 10.61.153.191..."
echo ""

# 服务器配置
SERVER_IP="10.61.153.191"
SERVER_USER="admin"
SERVER_PASS="Joyme0411!"
ROOT_USER="root"
ROOT_PASS="liveme@2022"

# 项目配置
PROJECT_NAME="dify-proxy-server"
PROJECT_PORT="3001"
DIFY_API_URL="http://47.90.156.219/v1"
DIFY_TOKEN="app-EVYktrhqnqncQSV9BdDv6uuu"

echo "📋 部署配置:"
echo "   服务器: $SERVER_IP"
echo "   用户: $SERVER_USER"
echo "   项目名: $PROJECT_NAME"
echo "   端口: $PROJECT_PORT"
echo "   Dify API: $DIFY_API_URL"
echo ""

# 创建部署包
echo "📦 创建部署包..."
mkdir -p deploy-package
cp -r app deploy-package/
cp -r lib deploy-package/
cp -r scripts deploy-package/
cp package.json deploy-package/
cp next.config.js deploy-package/
cp tsconfig.json deploy-package/

# 创建代理服务器文件
cat > deploy-package/proxy-server.js << 'EOF'
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// 配置
const DIFY_API_BASE_URL = process.env.DIFY_API_BASE_URL || 'http://47.90.156.219/v1';
const DIFY_API_TOKEN = process.env.DIFY_API_TOKEN || 'app-EVYktrhqnqncQSV9BdDv6uuu';

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    dify_api: DIFY_API_BASE_URL
  });
});

// Dify 代理路由
app.post('/api/dify-proxy', async (req, res) => {
  try {
    console.log('🔄 代理请求开始:', new Date().toISOString());
    console.log('   目标URL:', `${DIFY_API_BASE_URL}/workflows/run`);
    console.log('   请求大小:', JSON.stringify(req.body).length, '字符');

    const startTime = Date.now();
    
    const response = await axios.post(`${DIFY_API_BASE_URL}/workflows/run`, req.body, {
      headers: {
        'Authorization': `Bearer ${DIFY_API_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Dify-Proxy-Server/1.0',
        'Connection': 'keep-alive'
      },
      timeout: 300000, // 5分钟超时
      validateStatus: () => true,
      // 优化连接配置
      maxRedirects: 3,
      httpAgent: new (require('http').Agent)({
        keepAlive: true,
        maxSockets: 10,
        timeout: 300000
      })
    });

    const duration = Date.now() - startTime;
    console.log('✅ 代理请求成功:', response.status, `(${duration}ms)`);

    // 直接透传响应
    res.status(response.status).json(response.data);

  } catch (error) {
    console.error('❌ 代理请求失败:', error.message);
    
    const errorResponse = {
      error: 'Proxy request failed',
      message: error.message,
      timestamp: new Date().toISOString(),
      target: `${DIFY_API_BASE_URL}/workflows/run`
    };

    res.status(500).json(errorResponse);
  }
});

// 内容抓取代理
app.post('/api/scrape-content', async (req, res) => {
  try {
    const { url } = req.body;
    console.log('🔄 内容抓取请求:', url);

    // 这里可以集成内容抓取逻辑
    // 暂时返回模拟数据
    res.json({
      url: url,
      content: 'Content scraping functionality would be implemented here',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 内容抓取失败:', error.message);
    res.status(500).json({ error: 'Content scraping failed', message: error.message });
  }
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Dify 代理服务器启动成功!`);
  console.log(`   端口: ${PORT}`);
  console.log(`   Dify API: ${DIFY_API_BASE_URL}`);
  console.log(`   时间: ${new Date().toISOString()}`);
  console.log(`   健康检查: http://localhost:${PORT}/health`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('🛑 收到 SIGTERM 信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 收到 SIGINT 信号，正在关闭服务器...');
  process.exit(0);
});
EOF

# 创建 package.json
cat > deploy-package/package.json << EOF
{
  "name": "dify-proxy-server",
  "version": "1.0.0",
  "description": "Dify API Proxy Server for SEO Blog Agent",
  "main": "proxy-server.js",
  "scripts": {
    "start": "node proxy-server.js",
    "dev": "nodemon proxy-server.js",
    "pm2:start": "pm2 start proxy-server.js --name dify-proxy",
    "pm2:stop": "pm2 stop dify-proxy",
    "pm2:restart": "pm2 restart dify-proxy",
    "pm2:logs": "pm2 logs dify-proxy"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "axios": "^1.6.0",
    "http-proxy-middleware": "^2.0.6"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
EOF

# 创建环境变量文件
cat > deploy-package/.env << EOF
PORT=3001
DIFY_API_BASE_URL=http://47.90.156.219/v1
DIFY_API_TOKEN=app-EVYktrhqnqncQSV9BdDv6uuu
NODE_ENV=production
EOF

# 创建 PM2 配置文件
cat > deploy-package/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'dify-proxy',
    script: 'proxy-server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# 创建部署脚本
cat > deploy-package/deploy.sh << 'EOF'
#!/bin/bash
echo "🚀 启动 Dify 代理服务器..."

# 创建日志目录
mkdir -p logs

# 安装依赖
npm install

# 启动服务 (使用 PM2)
if command -v pm2 &> /dev/null; then
    echo "使用 PM2 启动服务..."
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
else
    echo "使用 Node.js 直接启动服务..."
    nohup node proxy-server.js > logs/app.log 2>&1 &
    echo $! > app.pid
fi

echo "✅ 服务启动完成!"
echo "健康检查: curl http://localhost:3001/health"
EOF

chmod +x deploy-package/deploy.sh

echo "📦 部署包创建完成!"
echo ""

# 创建部署说明
cat > deploy-package/README.md << 'EOF'
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
EOF

echo "📋 部署文件准备完成!"
echo ""
echo "🚀 下一步操作:"
echo "1. 将 deploy-package 目录上传到服务器"
echo "2. SSH 连接到服务器并执行部署"
echo "3. 配置前端使用新的代理地址"
echo ""
echo "📁 部署包位置: ./deploy-package/"
echo "📖 部署说明: ./deploy-package/README.md"
