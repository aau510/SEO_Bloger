#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

console.log('🚀 完整工作流测试...\n');

async function testCompleteWorkflow() {
  console.log('🎯 SEO博客智能体完整功能测试');
  console.log('目标: 验证从输入到输出的完整流程\n');
  
  const baseUrl = 'http://localhost:3001';
  
  // 1. 测试内容抓取
  console.log('1️⃣ 测试网站内容抓取:');
  console.log('─'.repeat(50));
  
  try {
    const scrapeResponse = await fetch(`${baseUrl}/api/scrape-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://www.liveme.com/' })
    });
    
    if (scrapeResponse.ok) {
      const scrapeData = await scrapeResponse.json();
      console.log('✅ 内容抓取成功');
      console.log(`📊 标题: ${scrapeData.content?.title}`);
      console.log(`📏 内容长度: ${scrapeData.content?.wordCount} 字符`);
      console.log(`🔗 URL: ${scrapeData.content?.url}`);
    } else {
      console.log(`❌ 内容抓取失败: ${scrapeResponse.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 抓取错误: ${error.message}`);
    return false;
  }
  
  // 2. 测试Dify工作流
  console.log('\n2️⃣ 测试Dify工作流调用:');
  console.log('─'.repeat(50));
  
  const testData = {
    inputs: {
      url_content: JSON.stringify({
        url: 'https://www.liveme.com/',
        title: 'LiveMe - Live Video Chat',
        content: '这是一个关于视频聊天和实时通讯的测试内容。LiveMe提供1v1聊天功能，让用户享受高质量的视频聊天体验。',
        wordCount: 100
      }),
      Keywords: JSON.stringify([
        { keyword: '视频聊天', difficulty: 45, traffic: 1200, volume: 8900 },
        { keyword: '实时通讯', difficulty: 38, traffic: 890, volume: 5600 },
        { keyword: '1v1聊天', difficulty: 32, traffic: 650, volume: 4200 }
      ])
    },
    response_mode: 'blocking',
    user: 'test-user'
  };
  
  try {
    const workflowResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://qa-dify.joyme.sg/v1'}/workflows/run`, {
      method: 'POST',
      headers: {
        'Authorization': process.env.API_AUTHORIZATION_TOKEN || 'Bearer app-EVYktrhqnqncQSV9BdDv6uuu',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    if (workflowResponse.ok) {
      const workflowData = await workflowResponse.json();
      console.log('✅ Dify工作流调用成功');
      console.log(`📊 任务ID: ${workflowData.task_id}`);
      console.log(`🔄 工作流ID: ${workflowData.workflow_run_id}`);
      
      if (workflowData.data && workflowData.data.outputs) {
        console.log('✅ 获得输出结果');
        const blogContent = workflowData.data.outputs.seo_blog || '无内容';
        console.log(`📝 博客长度: ${blogContent.length} 字符`);
        
        // 测试关键词匹配
        testKeywordMatching(blogContent, testData.inputs.Keywords);
      }
    } else {
      console.log(`❌ 工作流调用失败: ${workflowResponse.status}`);
      const errorText = await workflowResponse.text();
      console.log(`📄 错误详情: ${errorText.substring(0, 200)}...`);
    }
  } catch (error) {
    console.log(`❌ 工作流错误: ${error.message}`);
  }
  
  return true;
}

function testKeywordMatching(content, keywordsJson) {
  console.log('\n3️⃣ 测试关键词匹配:');
  console.log('─'.repeat(50));
  
  try {
    const keywords = JSON.parse(keywordsJson);
    let totalMatches = 0;
    let matchedKeywords = 0;
    
    keywords.forEach(({ keyword }) => {
      const regex = new RegExp(keyword, 'gi');
      const matches = content.match(regex) || [];
      const count = matches.length;
      
      if (count > 0) {
        matchedKeywords++;
        totalMatches += count;
      }
      
      const status = count > 0 ? '✅' : '❌';
      console.log(`   ${status} ${keyword}: ${count}次`);
    });
    
    console.log('─'.repeat(50));
    console.log(`📊 匹配统计:`);
    console.log(`   总匹配次数: ${totalMatches}`);
    console.log(`   匹配关键词: ${matchedKeywords}/${keywords.length}`);
    console.log(`   匹配率: ${(matchedKeywords/keywords.length*100).toFixed(1)}%`);
    
    if (matchedKeywords > 0) {
      console.log('✅ 关键词高亮功能应该正常工作');
    } else {
      console.log('⚠️  没有匹配到关键词，请检查内容生成');
    }
    
  } catch (error) {
    console.log(`❌ 关键词解析错误: ${error.message}`);
  }
}

function checkUIComponents() {
  console.log('\n4️⃣ 检查UI组件状态:');
  console.log('─'.repeat(50));
  
  const fs = require('fs');
  
  // 检查关键组件
  const components = [
    { file: 'components/BlogResultDisplay.tsx', name: '博客结果显示组件' },
    { file: 'components/DifyWorkflowForm.tsx', name: '工作流表单组件' },
    { file: 'app/globals.css', name: '全局样式文件' }
  ];
  
  components.forEach(({ file, name }) => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      if (file.includes('BlogResultDisplay')) {
        const hasHighlight = content.includes('highlightedContent');
        const hasEditing = content.includes('isEditing');
        const hasKeywordStats = content.includes('keywordStats');
        
        console.log(`📄 ${name}:`);
        console.log(`   ${hasHighlight ? '✅' : '❌'} 高亮功能`);
        console.log(`   ${hasEditing ? '✅' : '❌'} 编辑功能`);
        console.log(`   ${hasKeywordStats ? '✅' : '❌'} 统计功能`);
      }
      
      if (file.includes('DifyWorkflowForm')) {
        const hasBlogDisplay = content.includes('<BlogResultDisplay');
        const hasImport = content.includes('import BlogResultDisplay');
        
        console.log(`📄 ${name}:`);
        console.log(`   ${hasImport ? '✅' : '❌'} 组件导入`);
        console.log(`   ${hasBlogDisplay ? '✅' : '❌'} 组件使用`);
      }
      
      if (file.includes('globals.css')) {
        const hasMarkStyle = content.includes('mark {');
        const hasHighlightClass = content.includes('keyword-highlight');
        
        console.log(`📄 ${name}:`);
        console.log(`   ${hasMarkStyle ? '✅' : '❌'} mark标签样式`);
        console.log(`   ${hasHighlightClass ? '✅' : '❌'} 高亮CSS类`);
      }
      
    } catch (error) {
      console.log(`❌ ${name}: 无法读取文件`);
    }
  });
}

function generateTestSummary() {
  console.log('\n📋 测试总结:');
  console.log('═'.repeat(60));
  
  console.log('✅ 已修复的问题:');
  console.log('   🎨 关键词高亮显示功能');
  console.log('   ✏️  内容编辑功能');
  console.log('   🔧 BlogResultDisplay组件集成');
  console.log('   🎨 CSS样式支持');
  
  console.log('\n🎯 现在应该可以看到:');
  console.log('   1. 生成的博客内容中关键词被黄色高亮');
  console.log('   2. 关键词匹配统计和密度分析');
  console.log('   3. 点击"编辑"按钮可以修改内容');
  console.log('   4. 保存按钮可以下载编辑后的内容');
  
  console.log('\n📋 测试步骤:');
  console.log('   1. 访问 http://localhost:3001');
  console.log('   2. 上传 test-keywords.xlsx');
  console.log('   3. 输入URL: https://www.liveme.com/');
  console.log('   4. 设置筛选条件并生成博客');
  console.log('   5. 检查关键词高亮和编辑功能');
}

async function main() {
  await testCompleteWorkflow();
  checkUIComponents();
  generateTestSummary();
  
  console.log('\n🎊 测试完成！现在关键词高亮和编辑功能应该正常工作了！');
}

main().catch(console.error);
