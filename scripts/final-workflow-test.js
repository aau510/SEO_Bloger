#!/usr/bin/env node

const http = require('http');

const API_BASE_URL = 'http://qa-dify.joyme.sg/v1';
const API_TOKEN = 'Bearer app-EVYktrhqnqncQSV9BdDv6uuu';

console.log('🎯 最终工作流测试...\n');

async function finalWorkflowTest() {
  // 基于错误信息，确保使用正确的变量名和格式
  const testData = {
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
    user: 'final-workflow-test'
  };

  console.log('📋 最终测试配置:');
  console.log('✅ 使用正确的变量名: Keywords (基于错误信息确认)');
  console.log('✅ JSON格式的关键词数据');
  console.log('✅ 完整的URL和子页面信息');
  console.log('');
  
  console.log('📊 输入变量:');
  console.log(`   URL: ${testData.inputs.URL}`);
  console.log(`   URL_subpage: ${testData.inputs.URL_subpage}`);
  console.log(`   Keywords: [${JSON.parse(testData.inputs.Keywords).length}个关键词]`);
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
        'User-Agent': 'Final-Workflow-Test/1.0'
      }
    };

    console.log('🚀 发送工作流请求...');
    const startTime = Date.now();

    const req = http.request(options, (res) => {
      let data = '';
      
      console.log(`📥 响应状态: ${res.statusCode} ${res.statusMessage}`);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`⏱️  响应时间: ${duration}ms`);
        console.log('');
        
        try {
          const response = JSON.parse(data);
          console.log('✅ JSON解析成功');
          
          if (response.data) {
            const status = response.data.status;
            console.log(`🏃 工作流状态: ${status}`);
            
            if (status === 'succeeded') {
              console.log('🎉 工作流执行成功！');
              console.log('');
              
              console.log('📊 执行统计:');
              console.log(`   总步骤: ${response.data.total_steps || 0}`);
              console.log(`   总令牌: ${response.data.total_tokens || 0}`);
              console.log(`   执行时间: ${response.data.elapsed_time || 0}秒`);
              console.log('');
              
              if (response.data.outputs) {
                console.log('🎯 输出变量:');
                Object.keys(response.data.outputs).forEach(key => {
                  const value = response.data.outputs[key];
                  console.log(`   ${key}: ${typeof value === 'string' ? `${value.length} characters` : typeof value}`);
                });
                
                if (response.data.outputs.seo_blog) {
                  console.log('');
                  console.log('📝 生成的SEO博客内容:');
                  console.log('═'.repeat(60));
                  console.log(response.data.outputs.seo_blog);
                  console.log('═'.repeat(60));
                  
                  resolve({ 
                    success: true, 
                    content: response.data.outputs.seo_blog,
                    stats: {
                      duration,
                      steps: response.data.total_steps,
                      tokens: response.data.total_tokens,
                      elapsed: response.data.elapsed_time
                    }
                  });
                } else {
                  console.log('⚠️  未找到seo_blog输出变量');
                  console.log('可用的输出变量:', Object.keys(response.data.outputs));
                  resolve({ 
                    success: true, 
                    outputs: response.data.outputs,
                    noSeoBlog: true 
                  });
                }
              } else {
                console.log('⚠️  未找到输出变量');
                resolve({ success: true, noOutputs: true });
              }
            } else if (status === 'failed') {
              console.log('❌ 工作流执行失败');
              console.log('');
              console.log('错误详情:');
              console.log(response.data.error || '未知错误');
              resolve({ 
                success: false, 
                error: response.data.error,
                status: 'failed'
              });
            } else {
              console.log(`⏳ 工作流状态: ${status}`);
              console.log('可能正在执行中或状态异常');
              resolve({ 
                success: false, 
                status,
                message: '工作流状态异常'
              });
            }
          } else {
            console.log('❌ 响应格式异常');
            console.log('完整响应:', JSON.stringify(response, null, 2));
            resolve({ success: false, invalidResponse: true, response });
          }
        } catch (error) {
          console.log('❌ JSON解析失败:', error.message);
          console.log('原始响应:', data);
          resolve({ success: false, parseError: true, rawData: data });
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ 请求错误:', err.message);
      resolve({ success: false, networkError: true, error: err.message });
    });

    req.setTimeout(60000, () => {
      console.log('❌ 请求超时 (60秒)');
      req.destroy();
      resolve({ success: false, timeout: true });
    });

    req.write(postData);
    req.end();
  });
}

async function runFinalTest() {
  console.log('🔥 运行最终工作流测试');
  console.log('目标: 验证完整的SEO博客生成流程');
  console.log('');
  
  const result = await finalWorkflowTest();
  
  console.log('');
  console.log('🏁 最终测试结果');
  console.log('═'.repeat(60));
  
  if (result.success) {
    if (result.content) {
      console.log('✅ 测试完全成功！');
      console.log('✅ 成功生成SEO博客内容');
      console.log('✅ 工作流变量传输正常');
      console.log('✅ 输出变量seo_blog正确返回');
      
      if (result.stats) {
        console.log('');
        console.log('📊 性能统计:');
        console.log(`   响应时间: ${result.stats.duration}ms`);
        console.log(`   工作流步骤: ${result.stats.steps}`);
        console.log(`   使用令牌: ${result.stats.tokens}`);
        console.log(`   执行时间: ${result.stats.elapsed}秒`);
      }
      
      console.log('');
      console.log('🎯 系统状态: 完全就绪');
      console.log('🚀 可以开始使用SEO博客生成功能！');
      
    } else if (result.noSeoBlog) {
      console.log('⚠️  工作流执行成功，但输出变量名可能不匹配');
      console.log('建议检查Dify工作流的输出变量配置');
    } else {
      console.log('⚠️  工作流执行成功，但没有输出内容');
    }
  } else {
    console.log('❌ 测试失败');
    
    if (result.error) {
      console.log(`错误: ${result.error}`);
    } else if (result.status) {
      console.log(`状态: ${result.status}`);
    } else if (result.networkError) {
      console.log('网络连接错误');
    } else if (result.timeout) {
      console.log('请求超时');
    } else {
      console.log('未知错误');
    }
    
    console.log('');
    console.log('🔧 建议的解决步骤:');
    console.log('1. 检查Dify工作流配置');
    console.log('2. 确认输入输出变量设置');
    console.log('3. 验证工作流逻辑');
  }
}

runFinalTest().catch(console.error);
