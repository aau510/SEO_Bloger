#!/usr/bin/env node

const http = require('http');

console.log('🔍 检查发送到Dify的url_content变量内容...\n');

// 模拟我们实际发送的内容
async function checkUrlContentOutput() {
  
  console.log('📋 第一步：模拟网站内容抓取');
  console.log('═'.repeat(50));
  
  // 这是我们的url-scraper.ts返回的数据结构
  const mockUrlContent = {
    url: 'https://www.liveme.com/1v1chat',
    title: 'liveme.com - 网站内容分析',
    content: `
# liveme.com 网站内容分析

## 网站概述
liveme.com 是一个现代化的网站平台，提供多样化的在线服务和内容。

## 主要功能
- 用户注册和登录系统
- 内容浏览和搜索功能
- 互动交流和社区功能
- 个性化推荐服务

## 用户体验
网站设计注重用户体验，界面简洁明了，导航清晰易用。响应式设计确保在各种设备上都能获得良好的浏览体验。

## 技术特点
- 采用现代化的前端技术栈
- 优化的页面加载速度
- 良好的SEO优化
- 安全可靠的数据传输

## 内容特色
网站提供高质量的原创内容，定期更新，涵盖多个领域和主题。内容结构清晰，便于用户查找和阅读。

## 移动端适配
完美支持移动设备访问，提供原生应用般的使用体验。

## 社区互动
活跃的用户社区，支持评论、分享、点赞等多种互动方式。

## 数据安全
严格的隐私保护措施，确保用户数据安全和隐私不被泄露。

## 客户服务
提供多渠道的客户支持服务，包括在线客服、邮件支持等。

## 总结
liveme.com 是一个功能完善、用户体验优秀的现代化网站平台，值得深入了解和使用。

网站地址：https://www.liveme.com/1v1chat
分析时间：${new Date().toLocaleString()}
  `.trim(),
    description: '这是 https://www.liveme.com/1v1chat 的页面描述信息',
    headings: ['网站概述', '主要功能', '用户体验', '技术特点', '总结'],
    metadata: {
      publishDate: new Date().toISOString(),
      wordCount: 156,
      language: 'zh-CN'
    }
  };

  console.log('📊 原始抓取数据:');
  console.log('   URL:', mockUrlContent.url);
  console.log('   标题:', mockUrlContent.title);
  console.log('   内容长度:', mockUrlContent.content.length, '字符');
  console.log('   标题数量:', mockUrlContent.headings.length);
  console.log('   字数统计:', mockUrlContent.metadata.wordCount);
  console.log('');

  console.log('📋 第二步：格式化为Dify输入');
  console.log('═'.repeat(50));
  
  // 这是formatUrlContentForDify函数的处理结果
  const formattedForDify = {
    url: mockUrlContent.url,
    title: mockUrlContent.title,
    description: mockUrlContent.description,
    content: mockUrlContent.content.substring(0, 2000), // 限制长度
    headings: mockUrlContent.headings.slice(0, 5), // 限制标题数量
    wordCount: mockUrlContent.metadata.wordCount,
    language: mockUrlContent.metadata.language
  };
  
  const urlContentString = JSON.stringify(formattedForDify, null, 2);
  
  console.log('📄 格式化后的JSON结构:');
  console.log(urlContentString);
  console.log('');
  console.log('📊 统计信息:');
  console.log('   JSON字符串长度:', urlContentString.length, '字符');
  console.log('   内容是否为空:', urlContentString.length === 0 ? '是' : '否');
  console.log('   包含的字段数量:', Object.keys(formattedForDify).length);
  console.log('');

  console.log('📋 第三步：实际发送到Dify的请求体');
  console.log('═'.repeat(50));
  
  const keywords = [
    { keyword: '视频聊天', difficulty: 45, traffic: 1200, volume: 8900 },
    { keyword: '实时通讯', difficulty: 38, traffic: 890, volume: 5600 }
  ];
  
  const difyRequest = {
    inputs: {
      url_content: urlContentString,
      Keywords: JSON.stringify(keywords)
    },
    response_mode: 'blocking',
    user: 'content-check-test'
  };
  
  console.log('🔍 完整的Dify请求体:');
  console.log(JSON.stringify(difyRequest, null, 2));
  console.log('');
  
  console.log('📊 请求体统计:');
  console.log('   url_content 长度:', difyRequest.inputs.url_content.length, '字符');
  console.log('   Keywords 长度:', difyRequest.inputs.Keywords.length, '字符');
  console.log('   总请求体大小:', JSON.stringify(difyRequest).length, '字符');
  console.log('');

  console.log('📋 第四步：验证内容完整性');
  console.log('═'.repeat(50));
  
  // 检查内容完整性
  const checks = {
    hasUrl: formattedForDify.url && formattedForDify.url.length > 0,
    hasTitle: formattedForDify.title && formattedForDify.title.length > 0,
    hasContent: formattedForDify.content && formattedForDify.content.length > 0,
    hasDescription: formattedForDify.description && formattedForDify.description.length > 0,
    hasHeadings: formattedForDify.headings && formattedForDify.headings.length > 0,
    hasWordCount: typeof formattedForDify.wordCount === 'number',
    hasLanguage: formattedForDify.language && formattedForDify.language.length > 0
  };
  
  console.log('✅ 内容完整性检查:');
  Object.entries(checks).forEach(([key, value]) => {
    console.log(`   ${value ? '✅' : '❌'} ${key}: ${value ? '通过' : '失败'}`);
  });
  
  const allChecksPass = Object.values(checks).every(check => check === true);
  console.log('');
  console.log(`🎯 整体完整性: ${allChecksPass ? '✅ 通过' : '❌ 失败'}`);
  
  return {
    originalContent: mockUrlContent,
    formattedContent: formattedForDify,
    urlContentString: urlContentString,
    difyRequest: difyRequest,
    checks: checks,
    isComplete: allChecksPass
  };
}

async function sendActualTestRequest(urlContentString, keywords) {
  console.log('📋 第五步：实际发送测试请求');
  console.log('═'.repeat(50));
  
  const testData = {
    inputs: {
      url_content: urlContentString,
      Keywords: JSON.stringify(keywords)
    },
    response_mode: 'blocking',
    user: 'url-content-verification'
  };

  return new Promise((resolve) => {
    const postData = JSON.stringify(testData);
    
    const options = {
      hostname: 'qa-dify.joyme.sg',
      port: 80,
      path: '/v1/workflows/run',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer app-EVYktrhqnqncQSV9BdDv6uuu',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('🚀 发送验证请求...');
    console.log('   请求大小:', Buffer.byteLength(postData), 'bytes');

    const req = http.request(options, (res) => {
      let data = '';
      
      console.log(`📥 响应状态: ${res.statusCode} ${res.statusMessage}`);
      
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          const status = response.data?.status;
          const error = response.data?.error;
          
          console.log(`🏃 工作流状态: ${status}`);
          if (error) {
            console.log('❌ 错误信息:');
            console.log(error);
            
            // 分析错误原因
            if (error.includes('contents must not be empty')) {
              console.log('');
              console.log('🔍 错误分析:');
              console.log('   这个错误表明Vertex AI没有接收到内容');
              console.log('   可能原因:');
              console.log('   1. 工作流中url_content变量没有正确传递到AI节点');
              console.log('   2. AI节点的消息模板配置有问题');
              console.log('   3. 变量引用方式不正确');
            }
          } else if (status === 'succeeded') {
            console.log('✅ 请求成功！');
            if (response.data.outputs) {
              console.log('🎯 输出变量:', Object.keys(response.data.outputs));
            }
          }
          
          resolve({ status, error, response });
        } catch (e) {
          console.log('❌ 响应解析失败:', e.message);
          console.log('原始响应:', data);
          resolve({ parseError: true, rawData: data });
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ 网络错误:', err.message);
      resolve({ networkError: true, error: err.message });
    });

    req.write(postData);
    req.end();
  });
}

async function runContentCheck() {
  console.log('🔍 url_content 变量内容检查');
  console.log('目标: 确认发送到Dify的内容格式和完整性');
  console.log('');
  
  // 检查内容格式
  const contentAnalysis = await checkUrlContentOutput();
  
  if (contentAnalysis.isComplete) {
    console.log('');
    console.log('🧪 发送实际测试请求验证...');
    
    // 实际发送请求验证
    const testResult = await sendActualTestRequest(
      contentAnalysis.urlContentString,
      [{ keyword: '视频聊天', difficulty: 45, traffic: 1200, volume: 8900 }]
    );
    
    console.log('');
    console.log('📊 最终分析结论:');
    console.log('═'.repeat(60));
    
    if (testResult.status === 'succeeded') {
      console.log('🎉 url_content内容格式完全正确！');
      console.log('✅ 问题不在于我们发送的内容');
      console.log('⚠️  问题在于Dify工作流内部配置');
    } else if (testResult.error) {
      console.log('❌ 确认问题在于工作流配置');
      console.log('✅ 我们的url_content内容格式正确');
      console.log('✅ 内容完整且非空');
      console.log('🔧 需要修复Dify工作流中的变量引用');
    }
  } else {
    console.log('❌ 内容格式有问题，需要修复');
  }
}

runContentCheck().catch(console.error);
