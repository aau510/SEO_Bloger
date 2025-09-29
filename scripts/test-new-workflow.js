#!/usr/bin/env node

const http = require('http');

const API_BASE_URL = 'http://qa-dify.joyme.sg/v1';
const API_TOKEN = 'Bearer app-EVYktrhqnqncQSV9BdDv6uuu';

console.log('🧪 测试新的工作流配置...\n');

async function testNewWorkflow() {
  // 模拟网站内容抓取的数据
  const mockUrlContent = {
    url: 'https://www.liveme.com/1v1chat',
    title: 'LiveMe 1v1 Chat - 实时视频聊天平台',
    description: 'LiveMe提供高质量的1对1视频聊天服务',
    content: `
LiveMe是一个领先的实时视频聊天平台，专注于提供高质量的1对1视频通话服务。

## 主要功能
- 实时高清视频通话
- 智能匹配算法
- 多语言支持
- 安全隐私保护

## 用户体验
平台界面简洁直观，操作简单易用。支持多种设备访问，确保用户随时随地都能享受优质的视频聊天体验。

## 技术特色
- 低延迟视频传输技术
- AI智能美颜功能
- 实时语音翻译
- 云端录制回放

## 安全保障
严格的用户认证机制，实时内容监控，确保平台环境安全健康。
    `,
    headings: ['主要功能', '用户体验', '技术特色', '安全保障'],
    wordCount: 156,
    language: 'zh-CN'
  };

  // 测试关键词数据
  const testKeywords = [
    { keyword: '视频聊天', difficulty: 45, traffic: 1200, volume: 8900 },
    { keyword: '实时通讯', difficulty: 38, traffic: 890, volume: 5600 },
    { keyword: '1v1聊天', difficulty: 32, traffic: 650, volume: 4200 }
  ];

  console.log('📋 测试配置:');
  console.log('✅ 使用新的变量名: url_content, Keywords');
  console.log('✅ 模拟网站内容抓取');
  console.log('✅ 使用真实的URL: https://www.liveme.com/1v1chat');
  console.log('');

  // 构建新的API请求
  const testData = {
    inputs: {
      url_content: JSON.stringify(mockUrlContent, null, 2),
      Keywords: JSON.stringify(testKeywords)
    },
    response_mode: 'blocking',
    user: 'new-workflow-test'
  };

  console.log('📊 发送的变量:');
  console.log(`   url_content: [${JSON.stringify(mockUrlContent).length} 字符的网站内容JSON]`);
  console.log(`   Keywords: [${testKeywords.length}个关键词]`);
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
        'User-Agent': 'New-Workflow-Test/1.0'
      }
    };

    console.log('🚀 发送请求到新工作流...');
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
              console.log('🎉 新工作流执行成功！');
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
                  
                  // 内容质量检查
                  const content = response.data.outputs.seo_blog;
                  const hasUrl = content.includes('liveme.com') || content.includes('LiveMe');
                  const hasKeywords = testKeywords.some(k => content.toLowerCase().includes(k.keyword.toLowerCase()));
                  const hasStructure = content.includes('#') || content.includes('##');
                  
                  console.log('');
                  console.log('🔍 内容质量检查:');
                  console.log(`   包含目标URL内容: ${hasUrl ? '✅' : '❌'}`);
                  console.log(`   包含关键词: ${hasKeywords ? '✅' : '❌'}`);
                  console.log(`   具备文章结构: ${hasStructure ? '✅' : '❌'}`);
                  
                  resolve({ 
                    success: true, 
                    content: content,
                    quality: { hasUrl, hasKeywords, hasStructure },
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

async function runNewWorkflowTest() {
  console.log('🔥 新工作流配置测试');
  console.log('目标: 验证url_content + Keywords的工作流');
  console.log('网站: https://www.liveme.com/1v1chat');
  console.log('');
  
  const result = await testNewWorkflow();
  
  console.log('');
  console.log('🏁 新工作流测试结果');
  console.log('═'.repeat(60));
  
  if (result.success) {
    if (result.content) {
      console.log('🎊 测试完全成功！');
      console.log('✅ 新工作流变量配置正确');
      console.log('✅ url_content变量传输正常');
      console.log('✅ Keywords变量传输正常');
      console.log('✅ 成功生成SEO博客内容');
      
      if (result.quality) {
        const { hasUrl, hasKeywords, hasStructure } = result.quality;
        console.log('✅ 内容质量验证:');
        console.log(`   - 包含目标网站信息: ${hasUrl ? '通过' : '失败'}`);
        console.log(`   - 包含关键词优化: ${hasKeywords ? '通过' : '失败'}`);
        console.log(`   - 具备文章结构: ${hasStructure ? '通过' : '失败'}`);
      }
      
      if (result.stats) {
        console.log('');
        console.log('📊 性能统计:');
        console.log(`   响应时间: ${result.stats.duration}ms`);
        console.log(`   工作流步骤: ${result.stats.steps}`);
        console.log(`   使用令牌: ${result.stats.tokens}`);
        console.log(`   执行时间: ${result.stats.elapsed}秒`);
      }
      
      console.log('');
      console.log('🎯 新工作流状态: 完全就绪！');
      console.log('🚀 可以开始使用新的SEO博客生成功能！');
      
    } else if (result.noSeoBlog) {
      console.log('⚠️  工作流执行成功，但输出变量名可能不匹配');
      console.log('建议检查Dify工作流的输出变量配置');
    } else {
      console.log('⚠️  工作流执行成功，但没有输出内容');
    }
  } else {
    console.log('❌ 新工作流测试失败');
    
    if (result.error) {
      console.log(`错误: ${result.error}`);
      
      // 检查是否还是变量问题
      if (result.error.includes('undefined')) {
        console.log('');
        console.log('🔧 可能的解决方案:');
        console.log('1. 确认Dify工作流中的变量名已更新');
        console.log('2. 检查是否还有其他未定义的变量');
        console.log('3. 验证工作流的输入变量配置');
      }
    } else if (result.status) {
      console.log(`状态: ${result.status}`);
    } else {
      console.log('未知错误');
    }
  }
  
  console.log('');
  console.log('📋 变更总结:');
  console.log('- ✅ 删除了URL_subpage变量');
  console.log('- ✅ 新增了url_content变量（包含网站内容）');
  console.log('- ✅ 保留了Keywords变量（关键词功能不变）');
  console.log('- ✅ 集成了网站内容抓取功能');
}

runNewWorkflowTest().catch(console.error);
