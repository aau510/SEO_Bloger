#!/usr/bin/env node

// 手动加载环境变量
require('dotenv').config({ path: '.env.local' });

console.log('🌐 浏览器API测试...\n');

async function testBrowserEndpoints() {
  console.log('🔍 测试浏览器可访问的API端点:');
  console.log('═'.repeat(50));
  
  const baseUrl = 'http://localhost:3001';
  
  // 测试页面加载
  try {
    const response = await fetch(baseUrl);
    console.log(`✅ 主页面: ${response.status} ${response.statusText}`);
  } catch (error) {
    console.log(`❌ 主页面访问失败: ${error.message}`);
  }
  
  // 测试内容抓取API
  try {
    const response = await fetch(`${baseUrl}/api/scrape-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://www.liveme.com/' })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ 内容抓取API: 正常工作');
      console.log(`📊 抓取结果: ${data.content?.title || '无标题'}`);
    } else {
      console.log(`❌ 内容抓取API: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ 内容抓取API错误: ${error.message}`);
  }
}

// 创建简单的测试用例
function createTestCase() {
  console.log('\n📝 创建测试用例:');
  console.log('═'.repeat(50));
  
  const testCase = {
    url: 'https://www.liveme.com/',
    keywords: [
      { keyword: '视频聊天', difficulty: 45, traffic: 1200, volume: 8900 },
      { keyword: '实时通讯', difficulty: 38, traffic: 890, volume: 5600 },
      { keyword: '1v1聊天', difficulty: 32, traffic: 650, volume: 4200 }
    ],
    filters: {
      maxDifficulty: 50,
      minTraffic: 500
    }
  };
  
  console.log('🎯 测试数据:');
  console.log(`   URL: ${testCase.url}`);
  console.log(`   关键词数量: ${testCase.keywords.length}`);
  console.log(`   筛选条件: 难度<${testCase.filters.maxDifficulty}, 流量>${testCase.filters.minTraffic}`);
  
  return testCase;
}

async function main() {
  console.log('🎯 SEO博客智能体浏览器测试');
  console.log('目标: 验证前端功能是否正常\n');
  
  await testBrowserEndpoints();
  createTestCase();
  
  console.log('\n🎊 测试完成！');
  console.log('\n📋 下一步操作:');
  console.log('   1. 访问 http://localhost:3001');
  console.log('   2. 输入测试URL: https://www.liveme.com/');
  console.log('   3. 上传关键词Excel文件');
  console.log('   4. 设置筛选条件并生成博客');
  console.log('   5. 检查是否有关键词高亮和编辑功能');
}

main().catch(console.error);
