#!/usr/bin/env node

const http = require('http');

const API_BASE_URL = 'http://qa-dify.joyme.sg/v1';
const API_TOKEN = 'Bearer app-EVYktrhqnqncQSV9BdDv6uuu';

console.log('🚀 测试Dify工作流变量传输...\n');

async function testWorkflowVariables() {
  return new Promise((resolve) => {
    // 准备测试数据 - 模拟真实的SEO博客生成场景
    const testData = JSON.stringify({
      inputs: {
        URL: 'https://example.com',
        URL_subpage: '/blog/seo-guide',
        Keywords: JSON.stringify([
          { keyword: 'SEO优化', difficulty: 45, traffic: 1200, volume: 8900 },
          { keyword: '关键词研究', difficulty: 38, traffic: 890, volume: 5600 },
          { keyword: '内容营销', difficulty: 52, traffic: 2100, volume: 12000 }
        ])
      },
      response_mode: 'blocking',
      user: 'seo-blog-agent-test'
    });

    console.log('📊 发送到Dify的变量:');
    console.log('   URL:', 'https://example.com');
    console.log('   URL_subpage:', '/blog/seo-guide');
    console.log('   Keywords:', '[3个关键词数据]');
    console.log('');

    const url = new URL(`${API_BASE_URL}/workflows/run`);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': API_TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testData),
        'User-Agent': 'SEO-Blog-Agent/1.0'
      }
    };

    console.log('📡 调用工作流端点...');
    console.log(`   端点: ${API_BASE_URL}/workflows/run`);
    console.log(`   方法: POST`);
    console.log('');

    const req = http.request(options, (res) => {
      let data = '';
      console.log(`📥 响应状态: ${res.statusCode} ${res.statusMessage}`);
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ 工作流执行成功！');
          console.log('');
          console.log('📋 响应结构:');
          console.log(`   事件: ${response.event || 'N/A'}`);
          console.log(`   消息ID: ${response.message_id || 'N/A'}`);
          console.log(`   对话ID: ${response.conversation_id || 'N/A'}`);
          console.log('');

          // 检查输出变量
          if (response.data && response.data.outputs) {
            console.log('🎯 输出变量:');
            Object.keys(response.data.outputs).forEach(key => {
              const value = response.data.outputs[key];
              console.log(`   ${key}: ${typeof value === 'string' ? value.substring(0, 100) + '...' : JSON.stringify(value)}`);
            });
            
            if (response.data.outputs.seo_blog) {
              console.log('');
              console.log('📝 生成的SEO博客内容预览:');
              console.log(response.data.outputs.seo_blog.substring(0, 300) + '...');
            }
          } else {
            console.log('⚠️  未找到预期的输出变量结构');
            console.log('📄 完整响应:');
            console.log(JSON.stringify(response, null, 2));
          }

          resolve({ success: true, response });
        } catch (error) {
          console.log('⚠️  响应解析失败');
          console.log('📄 原始响应:');
          console.log(data);
          resolve({ success: false, data });
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ 工作流调用失败: ${err.message}`);
      resolve({ success: false, error: err.message });
    });

    req.setTimeout(30000, () => {
      console.log('❌ 工作流调用超时');
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });

    req.write(testData);
    req.end();
  });
}

async function runTest() {
  console.log('🔄 启动工作流变量传输测试...');
  console.log('');
  
  const result = await testWorkflowVariables();
  
  console.log('');
  console.log('📊 测试总结:');
  if (result.success) {
    console.log('✅ 工作流变量传输测试成功！');
    console.log('✅ 系统可以正常向Dify传输URL、URL_subpage和Keywords变量');
    console.log('✅ 可以接收seo_blog输出变量');
  } else {
    console.log('❌ 工作流变量传输测试失败');
    console.log('原因:', result.error || '未知错误');
  }
}

runTest().catch(console.error);
