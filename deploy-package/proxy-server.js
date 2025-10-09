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
