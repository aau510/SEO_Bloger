#!/usr/bin/env node

const https = require('https');
const http = require('http');

// 从环境变量或默认值获取配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.dify.ai/v1';
const API_TOKEN = process.env.API_AUTHORIZATION_TOKEN || 'Bearer app-eZKF81A01FTMokO71BZMSH6f';

console.log('🔍 Dify连接测试开始...\n');

// 解析URL
const url = new URL(API_BASE_URL);
const isHttps = url.protocol === 'https:';
const requestModule = isHttps ? https : http;

// 测试1: 基本连接测试
console.log('📡 测试1: 基本API连接');
console.log(`   端点: ${API_BASE_URL}`);
console.log(`   令牌: ${API_TOKEN.substring(0, 20)}...`);

const testConnection = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: '/v1/info',
      method: 'GET',
      headers: {
        'Authorization': API_TOKEN,
        'Content-Type': 'application/json',
        'User-Agent': 'SEO-Blog-Agent/1.0'
      }
    };

    const req = requestModule.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`   状态: ${res.statusCode} ${res.statusMessage}`);
        
        if (res.statusCode === 200) {
          console.log('   ✅ 连接成功\n');
          try {
            const parsed = JSON.parse(data);
            console.log('   响应数据:', JSON.stringify(parsed, null, 2));
          } catch (e) {
            console.log('   响应数据:', data);
          }
          resolve(true);
        } else {
          console.log(`   ❌ 连接失败: ${res.statusCode}`);
          console.log('   响应:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`   ❌ 网络错误: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      console.log('   ❌ 连接超时');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
};

// 测试2: 工作流端点测试
const testWorkflow = () => {
  return new Promise((resolve, reject) => {
    const testData = JSON.stringify({
      inputs: {
        URL: 'https://test.example.com',
        URL_subpage: '/test',
        Keywords: JSON.stringify([{keyword: 'test', difficulty: 50, traffic: 100}])
      },
      response_mode: 'blocking',
      user: 'connection-test'
    });

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: '/v1/workflows/run',
      method: 'POST',
      headers: {
        'Authorization': API_TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testData),
        'User-Agent': 'SEO-Blog-Agent/1.0'
      }
    };

    console.log('\n🚀 测试2: 工作流端点');
    console.log(`   端点: ${API_BASE_URL}/workflows/run`);
    console.log(`   数据: ${testData.substring(0, 100)}...`);

    const req = requestModule.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`   状态: ${res.statusCode} ${res.statusMessage}`);
        
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('   ✅ 工作流端点可访问');
          try {
            const parsed = JSON.parse(data);
            console.log('   响应摘要:', {
              event: parsed.event,
              message_id: parsed.message_id,
              conversation_id: parsed.conversation_id
            });
          } catch (e) {
            console.log('   响应数据:', data.substring(0, 200) + '...');
          }
          resolve(true);
        } else {
          console.log(`   ⚠️  工作流响应: ${res.statusCode}`);
          console.log('   响应:', data.substring(0, 500) + '...');
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`   ❌ 工作流请求错误: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(30000, () => {
      console.log('   ❌ 工作流请求超时');
      req.destroy();
      resolve(false);
    });

    req.write(testData);
    req.end();
  });
};

// 执行测试
async function runTests() {
  try {
    const connectionResult = await testConnection();
    const workflowResult = await testWorkflow();

    console.log('\n📊 测试结果总结:');
    console.log(`   基本连接: ${connectionResult ? '✅ 通过' : '❌ 失败'}`);
    console.log(`   工作流端点: ${workflowResult ? '✅ 通过' : '❌ 失败'}`);
    
    if (connectionResult && workflowResult) {
      console.log('\n🎉 Dify连接测试全部通过！可以开始使用工作流功能。');
      process.exit(0);
    } else {
      console.log('\n⚠️  存在连接问题，请检查API配置和网络连接。');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ 测试执行失败:', error.message);
    process.exit(1);
  }
}

runTests();
