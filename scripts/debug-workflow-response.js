#!/usr/bin/env node

const http = require('http');

const API_BASE_URL = 'http://qa-dify.joyme.sg/v1';
const API_TOKEN = 'Bearer app-EVYktrhqnqncQSV9BdDv6uuu';

console.log('🔍 Dify工作流响应调试...\n');

async function debugWorkflowResponse() {
  const testData = {
    inputs: {
      URL: 'https://example.com',
      URL_subpage: '/test',
      Keywords: JSON.stringify([
        { keyword: 'SEO', difficulty: 30, traffic: 1000, volume: 5000 }
      ])
    },
    response_mode: 'blocking',
    user: 'debug-test'
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
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Debug-Test/1.0'
      }
    };

    console.log('📡 发送请求到Dify...');
    console.log('输入变量:', JSON.stringify(testData.inputs, null, 2));
    console.log('');

    const req = http.request(options, (res) => {
      let data = '';
      
      console.log(`状态: ${res.statusCode} ${res.statusMessage}`);
      console.log('响应头:', JSON.stringify(res.headers, null, 2));
      console.log('');
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📄 完整响应内容:');
        console.log('═'.repeat(60));
        console.log(data);
        console.log('═'.repeat(60));
        console.log('');
        
        try {
          const parsed = JSON.parse(data);
          console.log('🔍 解析后的响应结构:');
          console.log(JSON.stringify(parsed, null, 2));
          console.log('');
          
          // 详细分析每个字段
          console.log('📋 字段分析:');
          if (parsed.task_id) {
            console.log(`✅ task_id: ${parsed.task_id}`);
          }
          if (parsed.workflow_run_id) {
            console.log(`✅ workflow_run_id: ${parsed.workflow_run_id}`);
          }
          if (parsed.data) {
            console.log('✅ data字段存在:');
            console.log(JSON.stringify(parsed.data, null, 2));
            
            if (parsed.data.outputs) {
              console.log('✅ 找到outputs:');
              console.log(JSON.stringify(parsed.data.outputs, null, 2));
            } else {
              console.log('❌ 未找到outputs字段');
            }
          } else {
            console.log('❌ 未找到data字段');
          }
          
          resolve({ success: true, data: parsed });
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

// 检查工作流状态
async function checkWorkflowStatus(taskId) {
  if (!taskId) {
    console.log('⚠️  没有task_id，跳过状态检查');
    return;
  }
  
  console.log(`🔄 检查工作流状态: ${taskId}`);
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'qa-dify.joyme.sg',
      port: 80,
      path: `/v1/workflows/run/${taskId}`,
      method: 'GET',
      headers: {
        'Authorization': API_TOKEN,
        'User-Agent': 'Debug-Test/1.0'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`状态查询响应: ${res.statusCode}`);
        console.log('响应内容:', data);
        
        try {
          const parsed = JSON.parse(data);
          console.log('解析后的状态:', JSON.stringify(parsed, null, 2));
          resolve(parsed);
        } catch (error) {
          console.log('状态解析失败:', error.message);
          resolve({ error: 'parsing failed', rawData: data });
        }
      });
    });

    req.on('error', (err) => {
      console.log('状态查询错误:', err.message);
      resolve({ error: err.message });
    });

    req.end();
  });
}

async function runDebug() {
  console.log('开始调试Dify工作流响应...\n');
  
  const result = await debugWorkflowResponse();
  
  if (result.success && result.data && result.data.task_id) {
    console.log('\n⏳ 等待3秒后检查工作流状态...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await checkWorkflowStatus(result.data.task_id);
  }
  
  console.log('\n🏁 调试完成');
  
  // 给出建议
  console.log('\n💡 诊断建议:');
  if (result.success) {
    console.log('✅ API连接正常');
    console.log('✅ 工作流已触发');
    if (result.data && result.data.data && Object.keys(result.data.data.outputs || {}).length === 0) {
      console.log('⚠️  工作流输出为空，可能原因:');
      console.log('   - 工作流还在执行中（异步处理）');
      console.log('   - 工作流配置问题');
      console.log('   - 输出变量名称不匹配');
      console.log('   - 工作流逻辑错误');
    }
  } else {
    console.log('❌ API调用失败');
    console.log('建议检查网络连接和API配置');
  }
}

runDebug().catch(console.error);
