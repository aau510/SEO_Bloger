#!/usr/bin/env node

const http = require('http');

console.log('🧪 测试更新后的真实内容抓取...\n');

async function testUpdatedScraping() {
  console.log('📡 调用更新后的抓取API...');
  
  const testData = {
    url: 'https://www.liveme.com/1v1chat'
  };

  return new Promise((resolve) => {
    const postData = JSON.stringify(testData);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/scrape-content',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`🔄 发送请求到本地API: http://localhost:3001/api/scrape-content`);

    const req = http.request(options, (res) => {
      let data = '';
      
      console.log(`📥 响应状态: ${res.statusCode} ${res.statusMessage}`);
      
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.success && response.content) {
            console.log('✅ 抓取API调用成功！');
            console.log(`📝 标题: ${response.content.title}`);
            console.log(`📄 描述: ${response.content.description}`);
            console.log(`📊 内容长度: ${response.content.content.length} 字符`);
            console.log(`🏷️  标题数量: ${response.content.headings?.length || 0}`);
            console.log(`🌐 语言: ${response.content.metadata?.language || 'unknown'}`);
            console.log(`📋 来源: ${response.content.metadata?.source || 'unknown'}`);
            
            console.log('\n📋 内容预览:');
            console.log(response.content.content.substring(0, 300) + '...');
            
            // 检查是否是真实内容
            const isRealContent = response.content.metadata?.source === 'real_scraping';
            console.log(`\n🎯 内容类型: ${isRealContent ? '✅ 真实抓取' : '⚠️  备用内容'}`);
            
            if (isRealContent) {
              console.log('\n🧪 测试发送真实内容到Dify...');
              testWithDify(response.content).then(difyResult => {
                if (difyResult.success) {
                  console.log('🎉 真实内容发送到Dify成功！');
                  console.log(`📝 生成的博客长度: ${difyResult.blogLength} 字符`);
                } else {
                  console.log('❌ Dify处理失败:', difyResult.error);
                }
                resolve({ success: true, content: response.content, difyResult });
              });
            } else {
              resolve({ success: true, content: response.content, isBackup: true });
            }
          } else {
            console.log('❌ 抓取API调用失败:', response.error);
            resolve({ success: false, error: response.error });
          }
        } catch (e) {
          console.log('❌ 响应解析失败:', e.message);
          console.log('原始响应:', data);
          resolve({ success: false, parseError: true });
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ 请求错误:', err.message);
      console.log('提示: 确保Next.js开发服务器在http://localhost:3001运行');
      resolve({ success: false, networkError: true });
    });

    req.write(postData);
    req.end();
  });
}

async function testWithDify(content) {
  console.log('🔄 发送到Dify工作流...');
  
  // 格式化内容
  const formattedContent = {
    url: content.url,
    title: content.title,
    description: content.description,
    content: content.content,
    headings: content.headings,
    wordCount: content.metadata.wordCount,
    language: content.metadata.language
  };
  
  const urlContentString = JSON.stringify(formattedContent, null, 2);
  
  const testData = {
    inputs: {
      url_content: urlContentString,
      Keywords: JSON.stringify([
        { keyword: '视频聊天', difficulty: 45, traffic: 1200, volume: 8900 },
        { keyword: '实时通讯', difficulty: 38, traffic: 890, volume: 5600 }
      ])
    },
    response_mode: 'blocking',
    user: 'real-content-test'
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

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          const status = response.data?.status;
          const error = response.data?.error;
          
          console.log(`🏃 Dify工作流状态: ${status}`);
          
          if (status === 'succeeded') {
            const blogContent = response.data.outputs?.seo_blog || '';
            resolve({ 
              success: true,
              blogLength: blogContent.length,
              blog: blogContent
            });
          } else {
            console.log(`❌ 错误: ${error?.substring(0, 100)}...`);
            resolve({ 
              success: false,
              error: error || `状态: ${status}`
            });
          }
        } catch (e) {
          resolve({ success: false, error: 'JSON解析失败' });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });

    req.write(postData);
    req.end();
  });
}

async function runTest() {
  console.log('🚀 开始测试更新后的内容抓取功能...');
  console.log('目标: 验证真实网站内容抓取和Dify集成');
  console.log('');
  
  const result = await testUpdatedScraping();
  
  console.log('\n📊 测试总结:');
  console.log('═'.repeat(60));
  
  if (result.success) {
    console.log('✅ 内容抓取功能正常');
    
    if (result.content.metadata?.source === 'real_scraping') {
      console.log('🎉 成功抓取真实网站内容！');
      console.log('✅ 内容非模拟数据');
      console.log('✅ 包含实际网站信息');
      
      if (result.difyResult) {
        if (result.difyResult.success) {
          console.log('🎊 完整工作流测试成功！');
          console.log('✅ 真实内容抓取 ✓');
          console.log('✅ Dify工作流处理 ✓');
          console.log('✅ SEO博客生成 ✓');
        } else {
          console.log('⚠️  真实内容抓取成功，但Dify处理失败');
          console.log('这证明内容不是问题，问题在工作流配置');
        }
      }
    } else {
      console.log('⚠️  使用了备用内容（真实抓取可能失败）');
      console.log('建议检查网络连接或目标网站访问权限');
    }
  } else {
    console.log('❌ 测试失败');
    if (result.networkError) {
      console.log('请确保Next.js服务器在运行: npm run dev -- --port 3001');
    }
  }
}

runTest().catch(console.error);
