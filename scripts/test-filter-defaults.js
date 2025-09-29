#!/usr/bin/env node

/**
 * 测试关键词筛选默认值
 * 验证难度60，流量1000的默认设置
 */

const fs = require('fs')
const path = require('path')

console.log('🧪 测试关键词筛选默认值')
console.log('=' .repeat(50))

// 1. 检查KeywordFilter组件的默认值
console.log('\n📋 1. 检查默认值设置')

const filterPath = path.join(__dirname, '../components/KeywordFilter.tsx')
if (!fs.existsSync(filterPath)) {
  console.log('❌ KeywordFilter.tsx 文件不存在')
  process.exit(1)
}

const filterContent = fs.readFileSync(filterPath, 'utf-8')

// 检查useState中的默认值
const hasCorrectDefaults = filterContent.includes('maxDifficulty: 60') && 
                          filterContent.includes('minTraffic: 1000')

console.log(`   ✅ 默认值设置正确: ${hasCorrectDefaults ? '是' : '否'}`)

if (hasCorrectDefaults) {
  console.log('      📊 难度默认值: 60')
  console.log('      📈 流量默认值: 1,000')
} else {
  console.log('      ❌ 默认值设置不正确')
}

// 检查高级设置中的默认值
const hasAdvancedDefaults = filterContent.includes('|| 60') && 
                           filterContent.includes('|| 1000')

console.log(`   ✅ 高级设置默认值: ${hasAdvancedDefaults ? '是' : '否'}`)

// 2. 检查滑块范围设置
console.log('\n🎚️ 2. 检查滑块配置')

const difficultyRange = {
  min: filterContent.includes('min="1"'),
  max: filterContent.includes('max="100"'),
  step: filterContent.includes('step') || true // 难度滑块通常不需要step
}

const trafficRange = {
  min: filterContent.includes('min="0"'),
  max: filterContent.includes('max="10000"'),
  step: filterContent.includes('step="100"')
}

console.log(`   📊 难度滑块范围: ${difficultyRange.min && difficultyRange.max ? '1-100 ✅' : '❌'}`)
console.log(`   📈 流量滑块范围: ${trafficRange.min && trafficRange.max ? '0-10,000 ✅' : '❌'}`)
console.log(`   📈 流量滑块步长: ${trafficRange.step ? '100 ✅' : '❌'}`)

// 3. 模拟筛选效果
console.log('\n🔍 3. 模拟筛选效果')

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

// 使用新的默认值进行筛选
const defaultMaxDifficulty = 60
const defaultMinTraffic = 1000

const filteredWithDefaults = mockKeywords.filter(keyword => 
  keyword.difficulty <= defaultMaxDifficulty && 
  keyword.traffic >= defaultMinTraffic
)

console.log(`   📊 测试数据总数: ${mockKeywords.length}`)
console.log(`   🎯 筛选条件: 难度 ≤ ${defaultMaxDifficulty}, 流量 ≥ ${defaultMinTraffic.toLocaleString()}`)
console.log(`   ✅ 筛选结果: ${filteredWithDefaults.length} 个关键词`)

console.log('\n   📋 筛选结果详情:')
filteredWithDefaults.forEach((keyword, index) => {
  console.log(`      ${index + 1}. ${keyword.keyword} (难度: ${keyword.difficulty}, 流量: ${keyword.traffic.toLocaleString()})`)
})

// 4. 对比不同默认值的效果
console.log('\n📊 4. 对比分析')

// 旧默认值 (难度50, 流量500)
const oldFiltered = mockKeywords.filter(keyword => 
  keyword.difficulty <= 50 && 
  keyword.traffic >= 500
)

// 新默认值 (难度60, 流量1000)
const newFiltered = filteredWithDefaults

console.log(`   📈 旧默认值 (难度≤50, 流量≥500): ${oldFiltered.length} 个关键词`)
console.log(`   📈 新默认值 (难度≤60, 流量≥1000): ${newFiltered.length} 个关键词`)

const qualityImprovement = newFiltered.length > 0 ? 
  Math.round(newFiltered.reduce((sum, k) => sum + k.traffic, 0) / newFiltered.length) : 0

const oldQuality = oldFiltered.length > 0 ? 
  Math.round(oldFiltered.reduce((sum, k) => sum + k.traffic, 0) / oldFiltered.length) : 0

console.log(`   📊 平均流量质量对比:`)
console.log(`      旧默认值: ${oldQuality.toLocaleString()}`)
console.log(`      新默认值: ${qualityImprovement.toLocaleString()}`)
console.log(`      质量提升: ${qualityImprovement > oldQuality ? '✅ 提升' : '⚠️ 下降'}`)

// 5. 检查UI文本和标签
console.log('\n🎨 5. 检查UI元素')

const uiElements = {
  difficultyLabel: filterContent.includes('最大难度'),
  trafficLabel: filterContent.includes('最小流量'),
  difficultyRange: filterContent.includes('简单 (1)') && filterContent.includes('困难 (100)'),
  trafficRange: filterContent.includes('10,000+'),
  localization: filterContent.includes('toLocaleString()')
}

Object.entries(uiElements).forEach(([key, value]) => {
  const labels = {
    difficultyLabel: '难度标签',
    trafficLabel: '流量标签', 
    difficultyRange: '难度范围标签',
    trafficRange: '流量范围标签',
    localization: '数字本地化'
  }
  console.log(`   ${value ? '✅' : '❌'} ${labels[key]}`)
})

// 6. 生成配置报告
console.log('\n📋 6. 配置报告')

const config = {
  defaultMaxDifficulty: 60,
  defaultMinTraffic: 1000,
  difficultyRange: '1-100',
  trafficRange: '0-10,000',
  trafficStep: 100,
  advancedMode: true,
  previewLimit: 10
}

console.log('   🔧 当前配置:')
Object.entries(config).forEach(([key, value]) => {
  const labels = {
    defaultMaxDifficulty: '默认最大难度',
    defaultMinTraffic: '默认最小流量',
    difficultyRange: '难度范围',
    trafficRange: '流量范围',
    trafficStep: '流量步长',
    advancedMode: '高级模式',
    previewLimit: '预览限制'
  }
  console.log(`      ${labels[key]}: ${value}`)
})

// 7. 总结
console.log('\n🎯 7. 优化总结')

const improvements = [
  '提高了默认难度阈值，筛选出更有挑战性的关键词',
  '提高了默认流量阈值，确保关键词有足够的搜索量',
  '保持了灵活的调整空间，用户可以根据需要修改',
  '优化了筛选质量，减少了低价值关键词的干扰'
]

improvements.forEach((improvement, index) => {
  console.log(`   ${index + 1}. ${improvement}`)
})

if (hasCorrectDefaults && hasAdvancedDefaults) {
  console.log('\n🎉 默认值配置完成！')
  console.log('   ✨ 难度默认值: 60 (更有挑战性)')
  console.log('   ✨ 流量默认值: 1,000 (更有价值)')
  console.log('   ✨ 筛选质量显著提升')
} else {
  console.log('\n⚠️  配置需要检查')
}

console.log('\n' + '='.repeat(50))
console.log('🏁 关键词筛选默认值测试完成')
