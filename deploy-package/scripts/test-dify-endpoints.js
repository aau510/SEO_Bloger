#!/usr/bin/env node

const https = require('https');

const TOKEN = 'app-EVYktrhqnqncQSV9BdDv6uuu';

console.log('🔍 测试不同的Dify API端点...\n');

// 测试不同的API端点
const testEndpoints = [
  { name: 'Dify Cloud API v1', url: 'https://api.dify.ai/v1' },
  { name: 'Dify Cloud API (无版本)', url: 'https://api.dify.ai' },
  { name: 'Dify Cloud API v2', url: 'https://api.dify.ai/v2' },
  { name: 'Dify Console API', url: 'https://console.dify.ai/api/v1' }
];

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    console.log(`📡 测试端点: ${endpoint.name}`);
    console.log(`   URL: ${endpoint.url}`);

    const url = new URL(`${endpoint.url}/info`);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SEO-Blog-Agent/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`   状态: ${res.statusCode} ${res.statusMessage}`);
        
        if (res.statusCode === 200) {
          console.log('   ✅ 成功！');
          try {
            const parsed = JSON.parse(data);
            console.log('   响应:', JSON.stringify(parsed, null, 2));
          } catch (e) {
            console.log('   响应:', data.substring(0, 200));
          }
          resolve({ success: true, endpoint: endpoint.name, url: endpoint.url });
        } else if (res.statusCode === 404) {
          console.log('   ⚠️  端点不存在');
        } else {
          console.log(`   ❌ 失败: ${res.statusCode}`);
          console.log(`   响应: ${data.substring(0, 200)}`);
        }
        console.log('');
        resolve({ success: false, endpoint: endpoint.name, status: res.statusCode });
      });
    });

    req.on('error', (err) => {
      console.log(`   ❌ 网络错误: ${err.message}\n`);
      resolve({ success: false, endpoint: endpoint.name, error: err.message });
    });

    req.setTimeout(10000, () => {
      console.log('   ❌ 连接超时\n');
      req.destroy();
      resolve({ success: false, endpoint: endpoint.name, error: 'timeout' });
    });

    req.end();
  });
}

// 测试应用类型API端点
async function testAppAPIs() {
  console.log('🚀 测试应用类型API端点...\n');
  
  const appEndpoints = [
    '/chat-messages',
    '/completion-messages', 
    '/workflows/run',
    '/audio-to-text',
    '/text-to-audio'
  ];
  
  for (const path of appEndpoints) {
    console.log(`📡 测试 ${path}`);
    
    const testData = JSON.stringify({
      inputs: {},
      query: 'test',
      response_mode: 'blocking',
      user: 'test-user'
    });

    const url = new URL(`https://api.dify.ai/v1${path}`);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testData),
        'User-Agent': 'SEO-Blog-Agent/1.0'
      }
    };

    try {
      const result = await new Promise((resolve) => {
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            console.log(`   状态: ${res.statusCode} ${res.statusMessage}`);
            if (res.statusCode !== 401) {
              console.log(`   响应: ${data.substring(0, 150)}...`);
            }
            resolve({ status: res.statusCode, data });
          });
        });

        req.on('error', (err) => {
          console.log(`   ❌ 错误: ${err.message}`);
          resolve({ error: err.message });
        });

        req.write(testData);
        req.end();
      });
      
      if (result.status === 200) {
        console.log('   ✅ 端点可用！');
        break;
      } else if (result.status !== 401) {
        console.log(`   ⚠️  非401错误，可能是应用类型不匹配`);
      }
    } catch (error) {
      console.log(`   ❌ 测试失败: ${error.message}`);
    }
    
    console.log('');
  }
}

async function runTests() {
  const results = [];
  
  // 测试基础端点
  for (const endpoint of testEndpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    if (result.success) {
      console.log('🎉 找到有效的API端点！\n');
      break;
    }
  }

  // 如果基础端点都失败，测试应用API
  if (!results.some(r => r.success)) {
    await testAppAPIs();
  }

  console.log('📊 总结:');
  if (results.some(r => r.success)) {
    const successful = results.find(r => r.success);
    console.log(`✅ 建议使用端点: ${successful.url}`);
  } else {
    console.log('❌ 所有端点测试失败');
    console.log('\n可能的原因:');
    console.log('1. 令牌无效或已过期');
    console.log('2. 应用未正确配置');
    console.log('3. API访问权限不足');
    console.log('4. 使用了错误的应用类型');
    console.log('\n建议:');
    console.log('1. 检查Dify控制台中的令牌状态');
    console.log('2. 确认应用类型(聊天助手/Agent/工作流)');
    console.log('3. 验证API访问权限设置');
  }
}

runTests().catch(console.error);
