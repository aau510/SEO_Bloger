#!/usr/bin/env node

const XLSX = require('xlsx');

console.log('📊 创建测试Excel文件...\n');

// 创建测试关键词数据
const testKeywords = [
  { '关键词': '视频聊天', '难度': 45, '流量': 1200, '搜索量': 8900 },
  { '关键词': '实时通讯', '难度': 38, '流量': 890, '搜索量': 5600 },
  { '关键词': '1v1聊天', '难度': 32, '流量': 650, '搜索量': 4200 },
  { '关键词': 'LiveMe', '难度': 28, '流量': 800, '搜索量': 3200 },
  { '关键词': '在线交流', '难度': 42, '流量': 750, '搜索量': 5100 },
  { '关键词': '视频通话', '难度': 35, '流量': 920, '搜索量': 6800 },
  { '关键词': '直播聊天', '难度': 40, '流量': 680, '搜索量': 4500 },
  { '关键词': '社交视频', '难度': 48, '流量': 1100, '搜索量': 7200 },
  { '关键词': '移动聊天', '难度': 33, '流量': 580, '搜索量': 3800 },
  { '关键词': '视频社交', '难度': 44, '流量': 970, '搜索量': 6100 }
];

// 创建工作簿
const wb = XLSX.utils.book_new();

// 创建工作表
const ws = XLSX.utils.json_to_sheet(testKeywords);

// 添加工作表到工作簿
XLSX.utils.book_append_sheet(wb, ws, '关键词数据');

// 保存文件
const filename = 'test-keywords.xlsx';
XLSX.writeFile(wb, filename);

console.log('✅ 测试Excel文件创建成功！');
console.log(`📁 文件名: ${filename}`);
console.log(`📊 包含 ${testKeywords.length} 个关键词`);
console.log('\n📋 文件内容预览:');
console.log('═'.repeat(60));
console.log('关键词\t\t难度\t流量\t搜索量');
console.log('─'.repeat(60));
testKeywords.slice(0, 5).forEach(item => {
  console.log(`${item['关键词']}\t\t${item['难度']}\t${item['流量']}\t${item['搜索量']}`);
});
console.log('...');

console.log('\n🎯 使用说明:');
console.log('1. 在浏览器中访问 http://localhost:3001');
console.log(`2. 上传文件: ${filename}`);
console.log('3. 设置筛选条件 (建议: 难度<50, 流量>600)');
console.log('4. 输入URL: https://www.liveme.com/');
console.log('5. 点击生成SEO博客');
console.log('6. 检查关键词高亮和编辑功能');

console.log('\n🎊 准备就绪，可以开始测试！');
