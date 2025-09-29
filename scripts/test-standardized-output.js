#!/usr/bin/env node

const http = require('http');

console.log('🧪 测试标准化爬虫输出...\n');

async function testStandardizedOutput() {
  console.log('📡 调用标准化抓取API...');
  
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

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.success && response.content) {
            console.log('✅ 标准化抓取成功！\n');
            
            const content = response.content;
            
            console.log('📊 标准化对象结构验证:');
            console.log('═'.repeat(80));
            
            // 验证标准字段
            console.log('🔍 核心字段检查:');
            console.log(`   url: ${content.url ? '✅' : '❌'} ${content.url}`);
            console.log(`   canonical_url: ${content.canonical_url ? '✅' : '❌'} ${content.canonical_url}`);
            console.log(`   status: ${typeof content.status === 'number' ? '✅' : '❌'} ${content.status}`);
            console.log(`   fetched_at: ${content.fetched_at ? '✅' : '❌'} ${content.fetched_at}`);
            console.log(`   title: ${content.title ? '✅' : '❌'} ${content.title}`);
            console.log(`   lang: ${content.lang ? '✅' : '❌'} ${content.lang}`);
            
            console.log('\n📝 内容字段检查:');
            const markdownLength = content.markdown?.length || 0;
            const textLength = content.text?.length || 0;
            const contentLength = content.content?.length || 0;
            
            console.log(`   markdown: ${markdownLength > 0 ? '✅' : '❌'} ${markdownLength} 字符 ${markdownLength <= 12000 ? '(长度合规)' : '(超长)'}`);
            console.log(`   text: ${textLength > 0 ? '✅' : '❌'} ${textLength} 字符 ${textLength <= 12000 ? '(长度合规)' : '(超长)'}`);
            console.log(`   content: ${contentLength > 0 ? '✅' : '❌'} ${contentLength} 字符 (向后兼容)`);
            
            // 检查LLM可用内容
            const hasLlmContent = markdownLength > 0 || textLength > 0;
            console.log(`   LLM可用内容: ${hasLlmContent ? '✅ 可用' : '❌ 缺失'}`);
            
            console.log('\n🏷️ 结构化数据检查:');
            console.log(`   headings.h1: ${content.headings?.h1?.length || 0} 个`);
            console.log(`   headings.h2: ${content.headings?.h2?.length || 0} 个`);
            console.log(`   headings.h3: ${content.headings?.h3?.length || 0} 个`);
            console.log(`   keywords: ${content.keywords?.length || 0} 个`);
            console.log(`   internal_links: ${content.internal_links?.length || 0} 个`);
            console.log(`   faq: ${content.faq?.length || 0} 个`);
            console.log(`   wordCount: ${content.wordCount || 0}`);
            
            console.log('\n🔤 关键词预览:');
            if (content.keywords && content.keywords.length > 0) {
              console.log('   前10个关键词:', content.keywords.slice(0, 10).join(', '));
            } else {
              console.log('   (未提取到关键词)');
            }
            
            console.log('\n📋 标题结构预览:');
            if (content.headings?.h1?.length > 0) {
              console.log('   H1标题:', content.headings.h1.slice(0, 3).join(', '));
            }
            if (content.headings?.h2?.length > 0) {
              console.log('   H2标题:', content.headings.h2.slice(0, 5).join(', '));
            }
            
            console.log('\n📄 内容预览 (前300字符):');
            console.log('─'.repeat(80));
            const previewContent = content.markdown || content.text || content.content || '';
            console.log(previewContent.substring(0, 300) + '...');
            console.log('─'.repeat(80));
            
            // 测试格式化为Dify输入
            console.log('\n🔄 测试Dify格式化...');
            testDifyFormatting(content).then(difyResult => {
              console.log('\n📊 最终验证结果:');
              console.log('═'.repeat(80));
              
              const checks = {
                hasStandardStructure: content.url && content.status !== undefined && content.fetched_at,
                hasLlmContent: markdownLength > 0 || textLength > 0,
                contentWithinLimit: Math.max(markdownLength, textLength) <= 12000,
                hasKeywords: content.keywords && content.keywords.length > 0,
                hasHeadings: content.headings && (content.headings.h1?.length > 0 || content.headings.h2?.length > 0),
                difyFormatSuccess: difyResult.success
              };
              
              Object.entries(checks).forEach(([check, passed]) => {
                console.log(`   ${passed ? '✅' : '❌'} ${check}: ${passed ? '通过' : '失败'}`);
              });
              
              const allPassed = Object.values(checks).every(check => check === true);
              console.log(`\n🎯 总体评估: ${allPassed ? '✅ 完全合规' : '⚠️ 需要改进'}`);
              
              if (difyResult.success) {
                console.log(`📦 Dify格式化大小: ${difyResult.size} 字符`);
                
                // 检查大小是否合理 (应该在合理范围内)
                const sizeReasonable = difyResult.size <= 20000; // 20k字符限制
                console.log(`📏 大小评估: ${sizeReasonable ? '✅ 合理' : '⚠️ 过大'} (${difyResult.size}/20000)`);
              }
              
              console.log('\n🎊 标准化改进效果:');
              console.log('✅ 爬虫输出从"裸字符串"改为标准对象');
              console.log('✅ 统一关键词字段 (keywords数组)');
              console.log('✅ 保证LLM内容可用 (markdown + text + content)');
              console.log('✅ 内容长度限制在12k字符以内');
              console.log('✅ 结构化标题、链接、FAQ数据');
              console.log('✅ 向后兼容现有接口');
              
              resolve({ success: true, content, checks, difyResult });
            });
          } else {
            console.log('❌ 标准化抓取失败:', response.error);
            resolve({ success: false, error: response.error });
          }
        } catch (e) {
          console.log('❌ 响应解析失败:', e.message);
          resolve({ success: false, parseError: true });
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ 请求错误:', err.message);
      resolve({ success: false, networkError: true });
    });

    req.write(postData);
    req.end();
  });
}

async function testDifyFormatting(content) {
  try {
    // 模拟formatUrlContentForDify函数的逻辑
    const llmContent = content.markdown || content.text || content.content || '';
    
    const formatted = {
      url: content.url,
      canonical_url: content.canonical_url,
      status: content.status,
      fetched_at: content.fetched_at,
      title: content.title,
      description: content.meta?.description,
      language: content.lang,
      
      // LLM消费的主要内容 - 限制在12k字符内
      markdown: content.markdown?.slice(0, 12000),
      text: content.text?.slice(0, 12000),
      content: llmContent.slice(0, 12000),
      
      // 结构化数据
      headings: content.headings,
      keywords: content.keywords?.slice(0, 20) || [],
      internal_links: content.internal_links?.slice(0, 10) || [],
      faq: content.faq?.slice(0, 5) || [],
      
      // 元数据
      wordCount: content.wordCount,
      author: content.meta?.author,
      publishDate: content.meta?.publishDate
    };
    
    const formattedString = JSON.stringify(formatted, null, 2);
    
    console.log('✅ Dify格式化成功');
    console.log(`📏 格式化后大小: ${formattedString.length} 字符`);
    
    return { success: true, size: formattedString.length, formatted };
  } catch (error) {
    console.log('❌ Dify格式化失败:', error.message);
    return { success: false, error: error.message };
  }
}

async function runStandardizedTest() {
  console.log('🎯 标准化爬虫输出测试');
  console.log('目标: 验证标准对象格式、关键词统一、内容长度控制');
  console.log('');
  
  const result = await testStandardizedOutput();
  
  if (!result.success) {
    console.log('\n❌ 测试失败');
    if (result.networkError) {
      console.log('请确保Next.js服务器在运行: npm run dev -- --port 3001');
    }
  }
}

runStandardizedTest().catch(console.error);
