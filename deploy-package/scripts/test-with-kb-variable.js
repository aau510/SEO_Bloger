#!/usr/bin/env node

const http = require('http');

const API_BASE_URL = 'http://qa-dify.joyme.sg/v1';
const API_TOKEN = 'Bearer app-EVYktrhqnqncQSV9BdDv6uuu';

console.log('🧪 测试使用 kb 变量名...\n');

async function testWithKbVariable() {
  // 尝试使用 kb 作为关键词变量名
  const testData = {
    inputs: {
      URL: 'https://example.com',
      URL_subpage: '/blog/seo-guide',
      kb: JSON.stringify([
        { keyword: 'SEO优化', difficulty: 45, traffic: 1200, volume: 8900 },
        { keyword: '关键词研究', difficulty: 38, traffic: 890, volume: 5600 }
      ])
    },
    response_mode: 'blocking',
    user: 'kb-variable-test'
  };

  console.log('🔄 尝试使用 kb 变量名...');
  console.log('输入变量:', JSON.stringify(testData.inputs, null, 2));
  console.log('');

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
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'KB-Variable-Test/1.0'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      console.log(`📥 响应状态: ${res.statusCode} ${res.statusMessage}`);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('📋 解析响应成功');
          
          if (response.data) {
            console.log(`🏃 工作流状态: ${response.data.status}`);
            
            if (response.data.status === 'succeeded') {
              console.log('✅ 工作流执行成功！');
              console.log('🎯 输出变量:');
              console.log(JSON.stringify(response.data.outputs, null, 2));
              
              if (response.data.outputs.seo_blog) {
                console.log('\n📝 生成的SEO博客预览:');
                console.log(response.data.outputs.seo_blog.substring(0, 300) + '...');
              }
              
              resolve({ success: true, response });
            } else if (response.data.status === 'failed') {
              console.log('❌ 工作流执行失败');
              console.log('错误信息:', response.data.error);
              resolve({ success: false, error: response.data.error });
            } else {
              console.log(`⏳ 工作流状态: ${response.data.status}`);
              resolve({ success: false, status: response.data.status });
            }
          } else {
            console.log('⚠️  响应结构异常');
            console.log('完整响应:', JSON.stringify(response, null, 2));
            resolve({ success: false, response });
          }
        } catch (error) {
          console.log('❌ JSON解析失败:', error.message);
          console.log('原始响应:', data);
          resolve({ success: false, rawData: data, error: error.message });
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ 请求错误:', err.message);
      resolve({ success: false, error: err.message });
    });

    req.write(postData);
    req.end();
  });
}

// 也测试其他可能的变量名
async function testAlternativeVariableNames() {
  const variableTests = [
    { name: 'keywords', value: 'keywords' },
    { name: 'keyword_data', value: 'keyword_data' },
    { name: 'Keywords', value: 'Keywords' },
    { name: 'KEYWORDS', value: 'KEYWORDS' }
  ];

  console.log('\n🔬 测试其他可能的变量名...\n');

  for (const test of variableTests) {
    console.log(`📝 测试变量名: ${test.name}`);
    
    const testData = {
      inputs: {
        URL: 'https://example.com',
        URL_subpage: '/test',
        [test.value]: JSON.stringify([{ keyword: 'test', difficulty: 30, traffic: 1000 }])
      },
      response_mode: 'blocking',
      user: `variable-test-${test.name}`
    };

    try {
      const result = await new Promise((resolve) => {
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
              resolve({ 
                success: true, 
                status: response.data?.status, 
                hasError: !!response.data?.error,
                errorType: response.data?.error ? 'execution_error' : null
              });
            } catch (e) {
              resolve({ success: false, parseError: true });
            }
          });
        });

        req.on('error', () => resolve({ success: false, networkError: true }));
        req.write(postData);
        req.end();
      });

      if (result.success) {
        if (result.status === 'succeeded') {
          console.log(`   ✅ ${test.name}: 成功！`);
          break; // 找到正确的变量名就停止
        } else if (result.hasError) {
          const isUndefinedError = result.errorType === 'execution_error';
          console.log(`   ${isUndefinedError ? '❌' : '⚠️'} ${test.name}: ${result.status} ${isUndefinedError ? '(变量未定义)' : ''}`);
        } else {
          console.log(`   ⏳ ${test.name}: ${result.status}`);
        }
      } else {
        console.log(`   ❌ ${test.name}: 请求失败`);
      }
    } catch (error) {
      console.log(`   ❌ ${test.name}: ${error.message}`);
    }
    
    console.log('');
  }
}

async function runTests() {
  console.log('🚀 开始变量名测试...\n');
  
  // 首先测试 kb 变量
  const kbResult = await testWithKbVariable();
  
  if (!kbResult.success) {
    // 如果 kb 也失败了，测试其他变量名
    await testAlternativeVariableNames();
  }
  
  console.log('\n📊 测试总结:');
  console.log('我们已经测试了以下变量名组合:');
  console.log('- URL, URL_subpage, kb');
  console.log('- URL, URL_subpage, keywords');
  console.log('- URL, URL_subpage, keyword_data');
  console.log('- URL, URL_subpage, Keywords');
  console.log('- URL, URL_subpage, KEYWORDS');
  console.log('');
  console.log('💡 建议:');
  console.log('1. 检查Dify工作流的实际输入变量定义');
  console.log('2. 确认工作流模板中使用的变量名');
  console.log('3. 可能需要联系工作流开发者确认正确的变量名');
}

runTests().catch(console.error);
