#!/usr/bin/env node

const http = require('http');
const https = require('https');

console.log('🔍 测试真实网站内容抓取...\n');

// 简单的网站内容抓取函数
async function scrapeRealContent(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    console.log(`🌐 正在抓取: ${url}`);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + (urlObj.search || ''),
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive'
      },
      timeout: 10000
    };

    const req = client.request(options, (res) => {
      let data = '';
      
      console.log(`📥 响应状态: ${res.statusCode} ${res.statusMessage}`);
      console.log(`📋 内容类型: ${res.headers['content-type']}`);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 接收数据大小: ${data.length} 字符`);
        
        // 简单的HTML解析
        const title = extractTitle(data);
        const textContent = extractTextContent(data);
        const description = extractDescription(data);
        
        resolve({
          url,
          title,
          content: textContent,
          description,
          rawHtml: data.substring(0, 1000) + '...', // 只保留前1000字符作为示例
          size: data.length
        });
      });
    });

    req.on('error', (err) => {
      console.log(`❌ 抓取错误: ${err.message}`);
      reject(err);
    });

    req.on('timeout', () => {
      console.log('⏰ 请求超时');
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.end();
  });
}

// 提取网页标题
function extractTitle(html) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)</i);
  return titleMatch ? titleMatch[1].trim() : '未找到标题';
}

// 提取网页描述
function extractDescription(html) {
  const descMatch = html.match(/<meta[^>]*name=['""]description['""][^>]*content=['""]([^'"]*)['""][^>]*>/i);
  return descMatch ? descMatch[1].trim() : '未找到描述';
}

// 简单的文本内容提取
function extractTextContent(html) {
  // 移除脚本和样式
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // 移除HTML标签
  text = text.replace(/<[^>]*>/g, ' ');
  
  // 清理空白字符
  text = text.replace(/\s+/g, ' ').trim();
  
  // 只保留前2000字符
  return text.substring(0, 2000);
}

async function testRealContentScraping() {
  const testUrls = [
    'https://www.liveme.com/1v1chat',
    'https://www.liveme.com/',
    'https://httpbin.org/html'  // 备用测试URL
  ];

  for (const url of testUrls) {
    try {
      console.log(`\n🔍 测试抓取: ${url}`);
      console.log('═'.repeat(50));
      
      const content = await scrapeRealContent(url);
      
      console.log('✅ 抓取成功！');
      console.log(`📝 标题: ${content.title}`);
      console.log(`📄 描述: ${content.description}`);
      console.log(`📊 内容长度: ${content.content.length} 字符`);
      console.log(`📋 内容预览: ${content.content.substring(0, 200)}...`);
      
      // 检查内容是否有意义
      const hasRealContent = content.content.length > 100 && 
                            !content.content.includes('404') && 
                            !content.content.includes('Not Found');
      
      console.log(`🎯 内容质量: ${hasRealContent ? '✅ 有效' : '❌ 无效'}`);
      
      if (hasRealContent) {
        console.log('\n📋 格式化为Dify输入:');
        const difyContent = {
          url: content.url,
          title: content.title,
          description: content.description,
          content: content.content,
          extractedAt: new Date().toISOString(),
          contentLength: content.content.length
        };
        
        const urlContentString = JSON.stringify(difyContent, null, 2);
        console.log(`JSON长度: ${urlContentString.length} 字符`);
        console.log('JSON预览:');
        console.log(urlContentString.substring(0, 300) + '...');
        
        // 测试发送到Dify
        console.log('\n🧪 测试发送真实内容到Dify...');
        const testResult = await testWithRealContent(urlContentString);
        
        if (testResult.success) {
          console.log('🎉 真实内容测试成功！');
          break; // 成功就退出循环
        } else {
          console.log('❌ 真实内容测试失败:', testResult.error);
        }
      }
      
    } catch (error) {
      console.log(`❌ 抓取失败: ${error.message}`);
      continue; // 尝试下一个URL
    }
  }
}

async function testWithRealContent(urlContentString) {
  const testData = {
    inputs: {
      url_content: urlContentString,
      Keywords: JSON.stringify([
        { keyword: '视频聊天', difficulty: 45, traffic: 1200, volume: 8900 }
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
          
          console.log(`🏃 工作流状态: ${status}`);
          if (error) {
            console.log(`❌ 错误: ${error.substring(0, 100)}...`);
          }
          
          resolve({ 
            success: status === 'succeeded',
            status,
            error
          });
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

console.log('🚀 开始真实网站内容抓取测试...');
testRealContentScraping().catch(console.error);
