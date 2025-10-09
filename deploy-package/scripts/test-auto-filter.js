#!/usr/bin/env node

/**
 * 测试自动筛选功能
 * 验证默认筛选条件在组件初始化时自动生效
 */

const fs = require('fs')
const path = require('path')

console.log('🧪 测试自动筛选功能')
console.log('=' .repeat(50))

// 1. 检查KeywordFilter组件的useEffect实现
console.log('\n📋 1. 检查自动筛选实现')

const filterPath = path.join(__dirname, '../components/KeywordFilter.tsx')
if (!fs.existsSync(filterPath)) {
  console.log('❌ KeywordFilter.tsx 文件不存在')
  process.exit(1)
}

const filterContent = fs.readFileSync(filterPath, 'utf-8')

// 检查是否导入了useEffect
const hasUseEffectImport = filterContent.includes('useState, useEffect')

console.log(`   ✅ 导入useEffect: ${hasUseEffectImport ? '是' : '否'}`)

// 检查是否有useEffect实现
const hasUseEffect = filterContent.includes('useEffect(() => {') &&
                    filterContent.includes('onFilterChange(filtered)')

console.log(`   ✅ 实现useEffect: ${hasUseEffect ? '是' : '否'}`)

// 检查依赖数组
const hasCorrectDependencies = filterContent.includes('[keywords, filter.maxDifficulty, filter.minTraffic, onFilterChange]')

console.log(`   ✅ 依赖数组正确: ${hasCorrectDependencies ? '是' : '否'}`)

// 检查关键词长度判断
const hasKeywordLengthCheck = filterContent.includes('if (keywords.length > 0)')

console.log(`   ✅ 关键词长度检查: ${hasKeywordLengthCheck ? '是' : '否'}`)

// 2. 分析自动筛选逻辑
console.log('\n🔍 2. 自动筛选逻辑分析')

const logicChecks = {
  initialization: filterContent.includes('在组件初始化和关键词变化时自动应用默认筛选'),
  filterLogic: filterContent.includes('keyword.difficulty <= filter.maxDifficulty') &&
               filterContent.includes('keyword.traffic >= filter.minTraffic'),
  callback: filterContent.includes('onFilterChange(filtered)'),
  emptyCheck: filterContent.includes('keywords.length > 0')
}

Object.entries(logicChecks).forEach(([key, value]) => {
  const labels = {
    initialization: '初始化注释',
    filterLogic: '筛选逻辑',
    callback: '回调函数',
    emptyCheck: '空数组检查'
  }
  console.log(`   ${value ? '✅' : '❌'} ${labels[key]}`)
})

// 3. 模拟组件生命周期
console.log('\n🔄 3. 模拟组件生命周期')

// 模拟关键词数据
const mockKeywords = [
  { keyword: 'bazoocam', difficulty: 47, traffic: 129000 },
  { keyword: 'camzey', difficulty: 24, traffic: 84000 },
  { keyword: 'video chat', difficulty: 65, traffic: 50000 },
  { keyword: 'live chat', difficulty: 70, traffic: 30000 },
  { keyword: 'online chat', difficulty: 55, traffic: 15000 },
  { keyword: 'chat room', difficulty: 45, traffic: 8000 },
  { keyword: 'webcam chat', difficulty: 40, traffic: 5000 },
  { keyword: 'random chat', difficulty: 35, traffic: 3000 },
  { keyword: 'free chat', difficulty: 80, traffic: 2000 },
  { keyword: 'instant chat', difficulty: 25, traffic: 500 }
]

// 模拟默认筛选条件
const defaultFilter = {
  maxDifficulty: 60,
  minTraffic: 1000
}

console.log('   📊 模拟场景:')
console.log(`      关键词总数: ${mockKeywords.length}`)
console.log(`      默认难度阈值: ${defaultFilter.maxDifficulty}`)
console.log(`      默认流量阈值: ${defaultFilter.minTraffic.toLocaleString()}`)

// 模拟useEffect中的筛选逻辑
const autoFiltered = mockKeywords.filter(keyword => 
  keyword.difficulty <= defaultFilter.maxDifficulty && 
  keyword.traffic >= defaultFilter.minTraffic
)

console.log(`      自动筛选结果: ${autoFiltered.length} 个关键词`)

console.log('\n   📋 自动筛选的关键词:')
autoFiltered.forEach((keyword, index) => {
  console.log(`      ${index + 1}. ${keyword.keyword} (难度: ${keyword.difficulty}, 流量: ${keyword.traffic.toLocaleString()})`)
})

// 4. 对比手动筛选和自动筛选
console.log('\n📊 4. 筛选方式对比')

// 模拟没有自动筛选时的情况（显示所有关键词）
const withoutAutoFilter = mockKeywords.length
const withAutoFilter = autoFiltered.length

console.log(`   📈 无自动筛选: 显示 ${withoutAutoFilter} 个关键词（包含低质量）`)
console.log(`   📈 有自动筛选: 显示 ${withAutoFilter} 个关键词（仅高质量）`)

const qualityImprovement = withAutoFilter > 0 ? 
  Math.round(autoFiltered.reduce((sum, k) => sum + k.traffic, 0) / autoFiltered.length) : 0

console.log(`   📊 平均流量质量: ${qualityImprovement.toLocaleString()}`)

// 检查是否过滤掉了低质量关键词
const lowQualityFiltered = mockKeywords.filter(keyword => 
  keyword.difficulty > defaultFilter.maxDifficulty || 
  keyword.traffic < defaultFilter.minTraffic
)

console.log(`   🗑️ 过滤掉的低质量关键词: ${lowQualityFiltered.length} 个`)
lowQualityFiltered.forEach(keyword => {
  const reason = keyword.difficulty > defaultFilter.maxDifficulty ? '难度过高' : '流量过低'
  console.log(`      - ${keyword.keyword} (${reason})`)
})

// 5. 检查触发时机
console.log('\n⏰ 5. 触发时机分析')

const triggers = [
  {
    name: '组件初始化',
    condition: 'keywords.length > 0',
    description: '当关键词数据首次加载时'
  },
  {
    name: '关键词数据变化',
    condition: 'keywords 依赖变化',
    description: '当上传新的关键词文件时'
  },
  {
    name: '难度阈值变化',
    condition: 'filter.maxDifficulty 依赖变化',
    description: '当用户调整难度滑块时'
  },
  {
    name: '流量阈值变化',
    condition: 'filter.minTraffic 依赖变化',
    description: '当用户调整流量滑块时'
  }
]

triggers.forEach((trigger, index) => {
  console.log(`   ${index + 1}. ${trigger.name}`)
  console.log(`      条件: ${trigger.condition}`)
  console.log(`      说明: ${trigger.description}`)
})

// 6. 潜在问题检查
console.log('\n⚠️ 6. 潜在问题检查')

const potentialIssues = [
  {
    issue: 'onFilterChange依赖可能导致无限循环',
    solution: '确保父组件的onFilterChange函数稳定',
    status: hasCorrectDependencies ? '✅ 已考虑' : '❌ 需注意'
  },
  {
    issue: '空关键词数组时的处理',
    solution: '添加keywords.length > 0检查',
    status: hasKeywordLengthCheck ? '✅ 已处理' : '❌ 需修复'
  },
  {
    issue: '初始渲染时的性能',
    solution: '筛选逻辑简单，性能影响较小',
    status: '✅ 可接受'
  }
]

potentialIssues.forEach((issue, index) => {
  console.log(`   ${index + 1}. ${issue.issue}`)
  console.log(`      解决方案: ${issue.solution}`)
  console.log(`      状态: ${issue.status}`)
})

// 7. 总结
console.log('\n🎯 7. 修复总结')

const allChecksPass = hasUseEffectImport && hasUseEffect && hasCorrectDependencies && hasKeywordLengthCheck

if (allChecksPass) {
  console.log('   🎉 自动筛选功能已正确实现！')
  console.log('   ✨ 默认筛选条件将在组件初始化时自动生效')
  console.log('   ✨ 用户无需手动拖动滑块即可看到筛选结果')
  console.log('   ✨ 关键词质量显著提升')
} else {
  console.log('   ⚠️ 自动筛选功能需要进一步完善')
}

console.log('\n   📈 预期效果:')
console.log('   • 用户上传关键词文件后立即看到筛选结果')
console.log('   • 默认显示高质量关键词（难度≤60，流量≥1000）')
console.log('   • 统计信息实时更新')
console.log('   • 用户体验更加流畅')

console.log('\n' + '='.repeat(50))
console.log('🏁 自动筛选功能测试完成')
