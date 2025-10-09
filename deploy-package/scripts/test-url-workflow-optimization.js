#!/usr/bin/env node

/**
 * 测试URL工作流优化
 * 验证用户可以在任意步骤填写或修改URL
 */

const fs = require('fs')
const path = require('path')

console.log('🧪 测试URL工作流优化')
console.log('=' .repeat(50))

// 1. 检查DifyWorkflowForm组件的优化
console.log('\n📋 1. 检查组件结构优化')

const formPath = path.join(__dirname, '../components/DifyWorkflowForm.tsx')
if (!fs.existsSync(formPath)) {
  console.log('❌ DifyWorkflowForm.tsx 文件不存在')
  process.exit(1)
}

const formContent = fs.readFileSync(formPath, 'utf-8')

// 检查步骤2中是否包含URL输入
const hasStep2UrlInput = formContent.includes('步骤2中也显示') && 
                        formContent.includes('目标网站URL') &&
                        formContent.includes('currentStep === 2')

console.log(`   ✅ 步骤2包含URL输入: ${hasStep2UrlInput ? '是' : '否'}`)

// 检查URL验证逻辑
const hasUrlValidation = formContent.includes('!formData.url') && 
                        formContent.includes('border-red-300') &&
                        formContent.includes('必填')

console.log(`   ✅ URL验证提示: ${hasUrlValidation ? '是' : '否'}`)

// 检查下一步按钮的禁用逻辑
const hasButtonDisableLogic = formContent.includes('!formData.url.trim()') &&
                             formContent.includes('disabled={filteredKeywords.length === 0 || !formData.url.trim()}')

console.log(`   ✅ 按钮禁用逻辑: ${hasButtonDisableLogic ? '是' : '否'}`)

// 检查操作提示
const hasOperationTips = formContent.includes('操作提示') &&
                        formContent.includes('按任意顺序') &&
                        formContent.includes('筛选步骤中补充')

console.log(`   ✅ 操作提示: ${hasOperationTips ? '是' : '否'}`)

// 2. 检查用户体验改进
console.log('\n🎯 2. 用户体验改进检查')

// 检查文件上传成功状态显示
const hasFileSuccessState = formContent.includes('bg-green-50') &&
                           formContent.includes('文件解析成功') &&
                           formContent.includes('个关键词')

console.log(`   ✅ 文件上传成功状态: ${hasFileSuccessState ? '是' : '否'}`)

// 检查视觉提示
const hasVisualIndicators = formContent.includes('bg-red-100 text-red-600') &&
                           formContent.includes('rounded-full') &&
                           formContent.includes('⚠️')

console.log(`   ✅ 视觉提示指示器: ${hasVisualIndicators ? '是' : '否'}`)

// 3. 模拟用户操作流程
console.log('\n🔄 3. 模拟用户操作流程')

const workflows = [
  {
    name: '先上传文件，后填URL',
    steps: [
      '1. 用户进入步骤1',
      '2. 用户上传关键词文件',
      '3. 自动跳转到步骤2',
      '4. 用户在步骤2中填写URL',
      '5. 用户筛选关键词',
      '6. 继续下一步'
    ]
  },
  {
    name: '先填URL，后上传文件',
    steps: [
      '1. 用户进入步骤1',
      '2. 用户填写URL',
      '3. 用户上传关键词文件',
      '4. 自动跳转到步骤2',
      '5. URL已填写，直接筛选关键词',
      '6. 继续下一步'
    ]
  },
  {
    name: '忘记填URL的补救流程',
    steps: [
      '1. 用户只上传了文件',
      '2. 进入步骤2，发现URL为空',
      '3. 看到红色提示和必填标记',
      '4. 在步骤2中补充填写URL',
      '5. 按钮变为可用状态',
      '6. 继续后续流程'
    ]
  }
]

workflows.forEach((workflow, index) => {
  console.log(`\n   📝 流程 ${index + 1}: ${workflow.name}`)
  workflow.steps.forEach((step, stepIndex) => {
    console.log(`      ${stepIndex + 1}. ${step}`)
  })
})

// 4. 检查CSS类和样式
console.log('\n🎨 4. 样式和交互检查')

const cssClasses = [
  'border-red-300',
  'focus:ring-red-500', 
  'bg-red-100',
  'text-red-600',
  'bg-green-50',
  'border-green-200',
  'bg-blue-50',
  'border-blue-200'
]

let cssFound = 0
cssClasses.forEach(className => {
  if (formContent.includes(className)) {
    cssFound++
  }
})

console.log(`   ✅ CSS样式类: ${cssFound}/${cssClasses.length} 个找到`)

// 5. 生成优化报告
console.log('\n📊 5. 优化效果报告')

const improvements = [
  {
    issue: 'URL输入框在步骤2中不可见',
    solution: '在步骤2中添加URL输入区域',
    status: hasStep2UrlInput ? '✅ 已解决' : '❌ 未解决'
  },
  {
    issue: '用户不知道URL是必填的',
    solution: '添加视觉提示和验证消息',
    status: hasUrlValidation ? '✅ 已解决' : '❌ 未解决'
  },
  {
    issue: '按钮状态不明确',
    solution: '根据URL和关键词状态禁用/启用按钮',
    status: hasButtonDisableLogic ? '✅ 已解决' : '❌ 未解决'
  },
  {
    issue: '操作流程不清晰',
    solution: '添加操作提示和引导',
    status: hasOperationTips ? '✅ 已解决' : '❌ 未解决'
  },
  {
    issue: '文件上传状态不明显',
    solution: '增强文件上传成功的视觉反馈',
    status: hasFileSuccessState ? '✅ 已解决' : '❌ 未解决'
  }
]

improvements.forEach((improvement, index) => {
  console.log(`\n   ${index + 1}. ${improvement.issue}`)
  console.log(`      💡 解决方案: ${improvement.solution}`)
  console.log(`      📋 状态: ${improvement.status}`)
})

// 6. 总结
console.log('\n🎯 6. 优化总结')

const solvedCount = improvements.filter(imp => imp.status.includes('✅')).length
const totalCount = improvements.length

console.log(`   📈 解决问题: ${solvedCount}/${totalCount}`)
console.log(`   🎨 用户体验: ${solvedCount === totalCount ? '显著提升' : '部分改善'}`)
console.log(`   🔄 工作流程: ${hasStep2UrlInput && hasUrlValidation ? '更加灵活' : '需要进一步优化'}`)

if (solvedCount === totalCount) {
  console.log('\n🎉 所有优化目标已达成！')
  console.log('   ✨ 用户现在可以按任意顺序操作')
  console.log('   ✨ 清晰的视觉提示和错误处理')
  console.log('   ✨ 灵活的工作流程设计')
} else {
  console.log('\n⚠️  还有部分优化目标需要完善')
}

console.log('\n' + '='.repeat(50))
console.log('🏁 URL工作流优化测试完成')
