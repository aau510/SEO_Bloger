#!/usr/bin/env node

console.log('🔍 调试关键词高亮功能...\n');

// 模拟博客内容
const mockBlogContent = `# 探索LiveMe一对一视频聊天的魅力

在当今数字化时代，视频聊天已经成为我们日常沟通不可或缺的一部分。LiveMe作为一个领先的实时通讯平台，为用户提供了高质量的1v1聊天体验。

## 什么是视频聊天？

视频聊天是一种通过互联网进行的实时视频通信方式。用户可以通过摄像头和麦克风与世界各地的人进行面对面的交流。这种实时通讯技术让距离不再是沟通的障碍。

## LiveMe 1v1聊天的优势

### 高清视频质量
LiveMe的视频聊天平台采用了先进的视频压缩技术，确保即使在网络条件不理想的情况下，用户也能享受到清晰的视频聊天体验。

### 安全的实时通讯
平台注重用户隐私保护，所有的视频聊天会话都经过加密处理，确保用户的实时通讯内容安全可靠。

### 智能匹配系统
通过先进的算法，LiveMe能够为用户匹配最合适的聊天对象，让每一次视频聊天都更有意义。

## 视频聊天的未来发展

随着5G技术的普及，视频聊天的质量将进一步提升。实时通讯技术也将更加成熟，为用户带来更好的沟通体验。

## 总结

LiveMe的1v1聊天功能为用户提供了一个安全、高效的实时通讯平台。无论是商务会议还是个人交流，视频聊天都能满足用户的各种需求。

立即体验LiveMe，开启您的高质量视频聊天之旅！`;

// 模拟关键词数据
const mockKeywords = [
  { keyword: '视频聊天', difficulty: 45, traffic: 1200, volume: 8900 },
  { keyword: '实时通讯', difficulty: 38, traffic: 890, volume: 5600 },
  { keyword: '1v1聊天', difficulty: 32, traffic: 650, volume: 4200 },
  { keyword: 'LiveMe', difficulty: 28, traffic: 800, volume: 3200 },
  { keyword: '在线交流', difficulty: 42, traffic: 750, volume: 5100 }
];

function testKeywordMatching() {
  console.log('🎯 测试关键词匹配算法:');
  console.log('═'.repeat(60));
  
  let highlighted = mockBlogContent;
  const stats = {};
  
  // 按关键词长度降序排列
  const sortedKeywords = [...mockKeywords].sort((a, b) => b.keyword.length - a.keyword.length);
  
  console.log('📋 关键词处理顺序 (按长度排序):');
  sortedKeywords.forEach((kw, index) => {
    console.log(`   ${index + 1}. ${kw.keyword} (${kw.keyword.length}字符)`);
  });
  
  console.log('\n🔍 匹配结果:');
  sortedKeywords.forEach(({ keyword }) => {
    if (!keyword.trim()) return;
    
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const matches = mockBlogContent.match(regex) || [];
    stats[keyword] = matches.length;
    
    const status = matches.length > 0 ? '✅' : '❌';
    console.log(`   ${status} ${keyword}: ${matches.length}次`);
    
    if (matches.length > 0) {
      highlighted = highlighted.replace(regex, `【${keyword.toUpperCase()}】`);
    }
  });
  
  return { highlighted, stats };
}

function testHighlightHTML() {
  console.log('\n🎨 测试HTML高亮标记:');
  console.log('═'.repeat(60));
  
  let highlighted = mockBlogContent;
  const sortedKeywords = [...mockKeywords].sort((a, b) => b.keyword.length - a.keyword.length);
  
  sortedKeywords.forEach(({ keyword }) => {
    if (!keyword.trim()) return;
    
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const matches = mockBlogContent.match(regex) || [];
    
    if (matches.length > 0) {
      highlighted = highlighted.replace(regex, `<mark class="bg-yellow-200 px-1 py-0.5 rounded font-medium text-yellow-800">$1</mark>`);
    }
  });
  
  // 显示前300字符的HTML
  console.log('HTML高亮预览 (前300字符):');
  console.log('─'.repeat(60));
  console.log(highlighted.substring(0, 300) + '...');
  
  return highlighted;
}

function checkComponentIntegration() {
  console.log('\n🔧 检查组件集成:');
  console.log('═'.repeat(60));
  
  const fs = require('fs');
  
  // 检查关键文件
  const files = [
    'components/BlogResultDisplay.tsx',
    'components/DifyWorkflowForm.tsx'
  ];
  
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      if (file.includes('DifyWorkflowForm')) {
        const hasBlogResultDisplay = content.includes('BlogResultDisplay');
        const hasImport = content.includes('import BlogResultDisplay');
        const hasUsage = content.includes('<BlogResultDisplay');
        
        console.log(`📄 ${file}:`);
        console.log(`   ${hasImport ? '✅' : '❌'} 导入 BlogResultDisplay`);
        console.log(`   ${hasUsage ? '✅' : '❌'} 使用 <BlogResultDisplay>`);
        console.log(`   ${hasBlogResultDisplay ? '✅' : '❌'} 包含组件引用`);
      }
      
      if (file.includes('BlogResultDisplay')) {
        const hasHighlight = content.includes('highlighted');
        const hasKeywordStats = content.includes('keywordStats');
        const hasEditing = content.includes('isEditing');
        
        console.log(`📄 ${file}:`);
        console.log(`   ${hasHighlight ? '✅' : '❌'} 高亮功能`);
        console.log(`   ${hasKeywordStats ? '✅' : '❌'} 关键词统计`);
        console.log(`   ${hasEditing ? '✅' : '❌'} 编辑功能`);
      }
    } catch (error) {
      console.log(`❌ ${file}: 文件不存在或无法读取`);
    }
  });
}

function generateDebugReport() {
  console.log('\n📊 生成调试报告:');
  console.log('═'.repeat(60));
  
  const { highlighted, stats } = testKeywordMatching();
  const htmlHighlighted = testHighlightHTML();
  
  const totalMatches = Object.values(stats).reduce((sum, count) => sum + count, 0);
  const matchedKeywords = Object.values(stats).filter(count => count > 0).length;
  
  console.log('\n📈 统计结果:');
  console.log(`   总匹配次数: ${totalMatches}`);
  console.log(`   匹配关键词: ${matchedKeywords}/${mockKeywords.length}`);
  console.log(`   匹配率: ${(matchedKeywords/mockKeywords.length*100).toFixed(1)}%`);
  
  console.log('\n🎯 问题诊断:');
  if (totalMatches === 0) {
    console.log('   ❌ 没有匹配到任何关键词 - 检查正则表达式');
  } else if (matchedKeywords < mockKeywords.length) {
    console.log('   ⚠️  部分关键词未匹配 - 检查内容是否包含所有关键词');
  } else {
    console.log('   ✅ 关键词匹配正常');
  }
  
  if (htmlHighlighted.includes('<mark')) {
    console.log('   ✅ HTML高亮标记生成正常');
  } else {
    console.log('   ❌ HTML高亮标记生成失败');
  }
}

function main() {
  console.log('🔍 BlogResultDisplay组件调试');
  console.log('目标: 验证关键词高亮和编辑功能\n');
  
  generateDebugReport();
  checkComponentIntegration();
  
  console.log('\n🔧 修复建议:');
  console.log('   1. 确保BlogResultDisplay组件正确集成到DifyWorkflowForm');
  console.log('   2. 检查关键词数据是否正确传递');
  console.log('   3. 验证高亮CSS样式是否正确加载');
  console.log('   4. 确认编辑功能的事件处理器正常工作');
  
  console.log('\n🎊 调试完成！');
}

main();
