#!/usr/bin/env node

const http = require('http');

console.log('📋 打印完整抓取内容...\n');

async function printFullContent() {
  console.log('🔄 调用内容抓取API...');
  
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
            console.log('✅ 抓取成功！\n');
            
            const content = response.content;
            
            console.log('📊 基本信息:');
            console.log('═'.repeat(80));
            console.log(`URL: ${content.url}`);
            console.log(`标题: ${content.title}`);
            console.log(`描述: ${content.description}`);
            console.log(`语言: ${content.metadata.language}`);
            console.log(`字数: ${content.metadata.wordCount}`);
            console.log(`抓取时间: ${content.metadata.scrapedAt}`);
            console.log(`来源: ${content.metadata.source}`);
            
            console.log('\n🏷️ 网站标题:');
            console.log('═'.repeat(80));
            content.headings.forEach((heading, index) => {
              console.log(`${index + 1}. ${heading}`);
            });
            
            console.log('\n📄 完整网站内容:');
            console.log('═'.repeat(80));
            console.log(content.content);
            console.log('═'.repeat(80));
            
            console.log('\n📋 发送给Dify的JSON格式:');
            console.log('═'.repeat(80));
            
            // 格式化为发送给Dify的格式
            const difyContent = {
              url: content.url,
              title: content.title,
              description: content.description,
              content: content.content,
              headings: content.headings,
              wordCount: content.metadata.wordCount,
              language: content.metadata.language
            };
            
            const urlContentString = JSON.stringify(difyContent, null, 2);
            console.log(urlContentString);
            console.log('═'.repeat(80));
            
            console.log('\n📊 统计信息:');
            console.log(`JSON字符串总长度: ${urlContentString.length} 字符`);
            console.log(`原始内容长度: ${content.content.length} 字符`);
            console.log(`标题数量: ${content.headings.length} 个`);
            
            console.log('\n🧪 完整的Dify请求体:');
            console.log('═'.repeat(80));
            
            const fullDifyRequest = {
              inputs: {
                url_content: urlContentString,
                Keywords: JSON.stringify([
                  { keyword: '视频聊天', difficulty: 45, traffic: 1200, volume: 8900 },
                  { keyword: '实时通讯', difficulty: 38, traffic: 890, volume: 5600 }
                ])
              },
              response_mode: 'blocking',
              user: 'content-display-test'
            };
            
            console.log(JSON.stringify(fullDifyRequest, null, 2));
            console.log('═'.repeat(80));
            
            console.log('\n📈 请求体大小分析:');
            console.log(`url_content字段: ${fullDifyRequest.inputs.url_content.length} 字符`);
            console.log(`Keywords字段: ${fullDifyRequest.inputs.Keywords.length} 字符`);
            console.log(`完整请求体: ${JSON.stringify(fullDifyRequest).length} 字符`);
            
            resolve({ success: true, content });
          } else {
            console.log('❌ 抓取失败:', response.error);
            resolve({ success: false });
          }
        } catch (e) {
          console.log('❌ 解析失败:', e.message);
          resolve({ success: false });
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ 网络错误:', err.message);
      console.log('提示: 确保Next.js服务器运行在 http://localhost:3001');
      resolve({ success: false });
    });

    req.write(postData);
    req.end();
  });
}

async function runContentDisplay() {
  console.log('🎯 显示完整的网站抓取内容');
  console.log('目标: 查看发送给Dify的所有数据');
  console.log('');
  
  const result = await printFullContent();
  
  if (result.success) {
    console.log('\n✅ 内容显示完成！');
    console.log('📝 以上就是我们发送给Dify工作流的完整url_content内容');
    console.log('🔍 可以看到内容完整且非空，问题确实在Dify工作流配置');
  } else {
    console.log('\n❌ 无法获取内容');
    console.log('请确保Next.js开发服务器正在运行');
  }
}

runContentDisplay().catch(console.error);
