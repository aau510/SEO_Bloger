#!/usr/bin/env node

const http = require('http');

console.log('🚀 测试增强版爬虫功能...\n');

async function testEnhancedScraping() {
  console.log('📡 调用增强版抓取API...');
  
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

    console.log(`🔄 发送请求到增强版API: http://localhost:3001/api/scrape-content`);

    const req = http.request(options, (res) => {
      let data = '';
      
      console.log(`📥 响应状态: ${res.statusCode} ${res.statusMessage}`);
      
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.success && response.content) {
            console.log('✅ 增强版抓取成功！\n');
            
            const content = response.content;
            
            console.log('📊 抓取结果对比:');
            console.log('═'.repeat(80));
            console.log(`📝 标题: ${content.title}`);
            console.log(`📄 描述: ${content.description}`);
            console.log(`🌐 语言: ${content.metadata?.language || 'unknown'}`);
            console.log(`📊 内容长度: ${content.content?.length || 0} 字符`);
            console.log(`🏷️  标题数量: ${content.headings?.length || 0} 个`);
            console.log(`🔗 状态码: ${content.metadata?.status || 'unknown'}`);
            console.log(`📋 来源: ${content.metadata?.source || 'unknown'}`);
            
            // 显示特殊功能
            if (content.metadata?.markdown) {
              console.log(`📝 Markdown格式: ✅ 可用 (${content.metadata.markdown.length} 字符)`);
            }
            if (content.metadata?.faq && content.metadata.faq.length > 0) {
              console.log(`❓ FAQ数量: ${content.metadata.faq.length} 个`);
            }
            if (content.metadata?.internal_links && content.metadata.internal_links.length > 0) {
              console.log(`🔗 内部链接: ${content.metadata.internal_links.length} 个`);
            }
            if (content.metadata?.canonical_url) {
              console.log(`🔗 规范URL: ${content.metadata.canonical_url}`);
            }
            
            console.log('\n📋 网站标题:');
            if (content.headings && content.headings.length > 0) {
              content.headings.slice(0, 5).forEach((heading, index) => {
                console.log(`   ${index + 1}. ${heading}`);
              });
            } else {
              console.log('   (未找到标题)');
            }
            
            console.log('\n📄 内容预览 (前500字符):');
            console.log('─'.repeat(80));
            console.log(content.content.substring(0, 500) + '...');
            console.log('─'.repeat(80));
            
            // 测试发送到Dify
            console.log('\n🧪 测试发送增强内容到Dify...');
            testWithDify(content).then(difyResult => {
              console.log('\n📊 最终测试结果:');
              console.log('═'.repeat(80));
              
              if (difyResult.success) {
                console.log('🎉 完整流程测试成功！');
                console.log('✅ 增强版内容抓取成功');
                console.log('✅ Dify工作流处理成功');
                console.log('✅ SEO博客生成成功');
                console.log(`📝 生成博客长度: ${difyResult.blogLength} 字符`);
                
                if (difyResult.blog && difyResult.blog.length > 0) {
                  console.log('\n📖 生成的博客预览:');
                  console.log('─'.repeat(80));
                  console.log(difyResult.blog.substring(0, 300) + '...');
                  console.log('─'.repeat(80));
                }
              } else {
                console.log('⚠️  增强版内容抓取成功，但Dify处理仍失败');
                console.log(`❌ 错误: ${difyResult.error}`);
                console.log('🔧 这说明问题确实在Dify工作流配置，不是内容质量问题');
              }
              
              resolve({ success: true, content, difyResult });
            });
          } else {
            console.log('❌ 增强版抓取失败:', response.error);
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
  console.log('🔄 发送增强内容到Dify工作流...');
  
  // 格式化增强内容
  const formattedContent = {
    url: content.url,
    title: content.title,
    description: content.description,
    content: content.content,
    headings: content.headings,
    wordCount: content.metadata.wordCount,
    language: content.metadata.language,
    // 增强字段
    status: content.metadata.status,
    canonical_url: content.metadata.canonical_url,
    markdown: content.metadata.markdown ? content.metadata.markdown.substring(0, 1000) : undefined, // 限制长度
    faq: content.metadata.faq,
    internal_links: content.metadata.internal_links ? content.metadata.internal_links.slice(0, 5) : undefined // 限制数量
  };
  
  const urlContentString = JSON.stringify(formattedContent, null, 2);
  
  console.log(`📦 发送数据大小: ${urlContentString.length} 字符`);
  
  const testData = {
    inputs: {
      url_content: urlContentString,
      Keywords: JSON.stringify([
        { keyword: '视频聊天', difficulty: 45, traffic: 1200, volume: 8900 },
        { keyword: '实时通讯', difficulty: 38, traffic: 890, volume: 5600 }
      ])
    },
    response_mode: 'blocking',
    user: 'enhanced-content-test'
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

async function runEnhancedTest() {
  console.log('🎯 增强版爬虫功能测试');
  console.log('特性: Playwright + Readability + Markdown转换');
  console.log('目标: 获取更高质量的内容并测试Dify集成');
  console.log('');
  
  const result = await testEnhancedScraping();
  
  if (!result.success) {
    console.log('\n❌ 测试失败');
    if (result.networkError) {
      console.log('请确保Next.js服务器在运行: npm run dev -- --port 3001');
    } else if (result.parseError) {
      console.log('响应解析失败，可能是服务器错误');
    }
  }
}

runEnhancedTest().catch(console.error);
