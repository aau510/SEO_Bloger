#!/usr/bin/env node
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Dify API配置
const DIFY_API_BASE_URL = 'http://47.90.156.219/v1';
const DIFY_API_TOKEN = 'app-EVYktrhqnqncQSV9BdDv6uuu';

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    port: PORT,
    timestamp: new Date().toISOString(),
    dify_api: DIFY_API_BASE_URL
  });
});

// Dify API代理端点
app.post('/api/dify-proxy', async (req, res) => {
  try {
    console.log('🔄 代理请求开始');
    console.log('   请求数据:', JSON.stringify(req.body, null, 2).substring(0, 500) + '...');
    
    // 转发请求到Dify API
    const response = await axios.post(`${DIFY_API_BASE_URL}/workflows/run`, req.body, {
      headers: {
        'Authorization': `Bearer ${DIFY_API_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SEO-Blog-Agent-Proxy/1.0',
      },
      timeout: 1000 * 180, // 180秒超时
      validateStatus: () => true
    });
    
    console.log('   响应状态:', response.status, response.statusText);
    
    if (response.status < 200 || response.status >= 300) {
      console.error('❌ Dify API错误:', response.status, response.statusText, response.data);
    } else {
      console.log('✅ Dify API调用成功');
    }
    
    // 直接透传响应
    res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error('❌ 代理请求失败:', error.message);
    
    // 返回详细的错误信息
    const errorResponse = {
      error: error.message,
      message: `Failed to connect to Dify API server at ${DIFY_API_BASE_URL}`,
      code: error.code || 'NETWORK_ERROR',
      details: {
        target: `${DIFY_API_BASE_URL}/workflows/run`,
        timestamp: new Date().toISOString()
      }
    };
    
    res.status(500).json(errorResponse);
  }
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 高级代理服务器启动成功!`);
  console.log(`   端口: ${PORT}`);
  console.log(`   健康检查: http://localhost:${PORT}/health`);
  console.log(`   API代理: http://localhost:${PORT}/api/dify-proxy`);
  console.log(`   Dify API: ${DIFY_API_BASE_URL}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('🛑 收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});
