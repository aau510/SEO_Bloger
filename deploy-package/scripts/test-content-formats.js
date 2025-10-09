#!/usr/bin/env node

const http = require('http');

const API_BASE_URL = 'http://qa-dify.joyme.sg/v1';
const API_TOKEN = 'Bearer app-EVYktrhqnqncQSV9BdDv6uuu';

console.log('🔍 测试不同的内容格式...\n');

async function testContentFormat(formatName, urlContent, keywords) {
  console.log(`📝 测试格式: ${formatName}`);
  
  const testData = {
    inputs: {
      url_content: urlContent,
      Keywords: JSON.stringify(keywords)
    },
    response_mode: 'blocking',
    user: `format-test-${formatName}`
  };

  return new Promise((resolve) => {
    const postData = JSON.stringify(testData);
    
    const options = {
      hostname: 'qa-dify.joyme.sg',
      port: 80,
      path: '/v1/workflows/run',
      method: 'POST',
      headers: {
        'Authorization': API_TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          const status = response.data?.status;
          const error = response.data?.error;
          
          console.log(`   状态: ${status}`);
          if (error) {
            console.log(`   错误: ${error.substring(0, 100)}...`);
          }
          console.log('');
          
          resolve({ 
            format: formatName,
            status, 
            error,
            success: status === 'succeeded'
          });
        } catch (e) {
          console.log(`   解析错误: ${e.message}`);
          console.log('');
          resolve({ format: formatName, parseError: true });
        }
      });
    });

    req.on('error', (err) => {
      console.log(`   网络错误: ${err.message}`);
      console.log('');
      resolve({ format: formatName, networkError: true });
    });

    req.write(postData);
    req.end();
  });
}

async function runContentFormatTests() {
  const keywords = [
    { keyword: '视频聊天', difficulty: 45, traffic: 1200, volume: 8900 }
  ];

  console.log('🚀 开始测试不同的url_content格式...\n');

  // 格式1: 简单字符串
  const format1 = `LiveMe是一个实时视频聊天平台，提供1对1视频通话服务。主要功能包括高清视频通话、智能匹配、多语言支持等。`;

  // 格式2: 结构化文本
  const format2 = `标题: LiveMe 1v1 Chat
描述: 实时视频聊天平台
内容: LiveMe提供高质量的1对1视频聊天服务，支持实时高清视频通话、智能匹配算法、多语言支持等功能。`;

  // 格式3: Markdown格式
  const format3 = `# LiveMe 1v1 Chat

LiveMe是一个领先的实时视频聊天平台。

## 主要功能
- 实时高清视频通话
- 智能匹配算法
- 多语言支持

## 特色
提供安全可靠的视频聊天体验。`;

  // 格式4: JSON字符串（之前使用的）
  const format4 = JSON.stringify({
    url: 'https://www.liveme.com/1v1chat',
    title: 'LiveMe 1v1 Chat',
    content: 'LiveMe是实时视频聊天平台，提供1对1视频通话服务。',
    description: '高质量的视频聊天体验'
  });

  // 格式5: 纯内容文本（最简单）
  const format5 = `LiveMe 1v1 Chat是一个视频聊天平台，用户可以进行实时的1对1视频通话，享受高质量的视频聊天体验。`;

  const tests = [
    { name: '简单字符串', content: format1 },
    { name: '结构化文本', content: format2 },
    { name: 'Markdown格式', content: format3 },
    { name: 'JSON格式', content: format4 },
    { name: '纯内容文本', content: format5 }
  ];

  const results = [];
  
  for (const test of tests) {
    console.log(`内容预览 (${test.name}): ${test.content.substring(0, 80)}...`);
    const result = await testContentFormat(test.name, test.content, keywords);
    results.push(result);
    
    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('📊 测试结果总结:');
  console.log('═'.repeat(60));
  
  let successCount = 0;
  results.forEach(result => {
    const statusIcon = result.success ? '✅' : '❌';
    const status = result.success ? '成功' : (result.error ? '失败' : '错误');
    console.log(`${statusIcon} ${result.format}: ${status}`);
    
    if (result.success) {
      successCount++;
    } else if (result.error) {
      console.log(`     错误: ${result.error.substring(0, 50)}...`);
    }
  });

  console.log('');
  console.log(`📈 成功率: ${successCount}/${results.length} (${Math.round(successCount/results.length*100)}%)`);
  
  const successfulFormats = results.filter(r => r.success);
  if (successfulFormats.length > 0) {
    console.log('');
    console.log('🎯 推荐格式:');
    successfulFormats.forEach(format => {
      console.log(`   ✅ ${format.format}`);
    });
  } else {
    console.log('');
    console.log('⚠️  所有格式都失败了，可能需要检查工作流配置');
  }
}

runContentFormatTests().catch(console.error);
