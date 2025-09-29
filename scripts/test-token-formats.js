#!/usr/bin/env node

const https = require('https');

const API_BASE_URL = 'https://api.dify.ai/v1';
const TOKEN = 'app-EVYktrhqnqncQSV9BdDv6uuu';

console.log('🔍 测试不同的令牌格式...\n');

// 测试不同的令牌格式
const testFormats = [
  { name: '格式1: Bearer + 令牌', token: `Bearer ${TOKEN}` },
  { name: '格式2: 仅令牌', token: TOKEN },
  { name: '格式3: 小写bearer', token: `bearer ${TOKEN}` }
];

async function testTokenFormat(format) {
  return new Promise((resolve) => {
    console.log(`📡 测试 ${format.name}`);
    console.log(`   令牌: ${format.token.substring(0, 25)}...`);

    const url = new URL(`${API_BASE_URL}/info`);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'GET',
      headers: {
        'Authorization': format.token,
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
            console.log('   响应:', data);
          }
          resolve({ success: true, format: format.name, response: data });
        } else {
          console.log(`   ❌ 失败: ${res.statusCode}`);
          console.log(`   响应: ${data}`);
          resolve({ success: false, format: format.name, error: data });
        }
        console.log('');
      });
    });

    req.on('error', (err) => {
      console.log(`   ❌ 网络错误: ${err.message}\n`);
      resolve({ success: false, format: format.name, error: err.message });
    });

    req.setTimeout(10000, () => {
      console.log('   ❌ 连接超时\n');
      req.destroy();
      resolve({ success: false, format: format.name, error: 'timeout' });
    });

    req.end();
  });
}

// 测试工作流端点
async function testWorkflowEndpoint(token) {
  return new Promise((resolve) => {
    console.log('🚀 测试工作流端点 /workflows/run');
    
    const testData = JSON.stringify({
      inputs: {
        URL: 'https://test.example.com',
        URL_subpage: '/test',
        Keywords: JSON.stringify([{keyword: 'test', difficulty: 50, traffic: 100}])
      },
      response_mode: 'blocking',
      user: 'connection-test'
    });

    const url = new URL(`${API_BASE_URL}/workflows/run`);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testData),
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
        console.log(`   响应: ${data.substring(0, 200)}...`);
        resolve({ success: res.statusCode < 400, response: data });
      });
    });

    req.on('error', (err) => {
      console.log(`   ❌ 错误: ${err.message}`);
      resolve({ success: false, error: err.message });
    });

    req.write(testData);
    req.end();
  });
}

async function runTests() {
  const results = [];
  
  for (const format of testFormats) {
    const result = await testTokenFormat(format);
    results.push(result);
    
    // 如果找到成功的格式，测试工作流端点
    if (result.success) {
      console.log('🎉 找到有效的令牌格式！测试工作流端点...\n');
      const workflowResult = await testWorkflowEndpoint(format.token);
      result.workflowTest = workflowResult;
      break;
    }
  }

  console.log('📊 测试结果总结:');
  results.forEach(result => {
    console.log(`   ${result.format}: ${result.success ? '✅ 成功' : '❌ 失败'}`);
  });

  const successfulFormat = results.find(r => r.success);
  if (successfulFormat) {
    console.log(`\n🎉 建议使用格式: ${successfulFormat.format}`);
    console.log('请在 .env.local 中使用此格式配置API_AUTHORIZATION_TOKEN');
  } else {
    console.log('\n⚠️  所有令牌格式都失败了。请检查:');
    console.log('   1. 令牌是否正确');
    console.log('   2. 令牌是否已激活');
    console.log('   3. 应用是否有API访问权限');
  }
}

runTests().catch(console.error);
