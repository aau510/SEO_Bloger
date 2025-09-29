#!/usr/bin/env node

/**
 * 测试直接连接Dify API功能
 */

const { generateSEOBlogWithDifyDirect } = require('../lib/dify-api')

async function testDirectConnection() {
  console.log('🧪 开始测试直接连接Dify API...')
  console.log('')

  // 测试数据
  const testUrl = 'https://example.com'
  const testKeywords = [
    {
      keyword: 'AI content generation',
      difficulty: 45,
      traffic: 1200,
      volume: 8900
    },
    {
      keyword: 'SEO blog writing',
      difficulty: 38,
      traffic: 890,
      volume: 6500
    }
  ]

  try {
    console.log('📋 测试参数:')
    console.log('   URL:', testUrl)
    console.log('   关键词数量:', testKeywords.length)
    console.log('   关键词:', testKeywords.map(k => k.keyword).join(', '))
    console.log('')

    console.log('🔗 开始直接连接测试...')
    const startTime = Date.now()

    const result = await generateSEOBlogWithDifyDirect(
      testUrl,
      testKeywords,
      (step, data) => {
        console.log(`   📊 进度: ${step}`, data ? `- ${JSON.stringify(data).substring(0, 100)}...` : '')
      }
    )

    const duration = Date.now() - startTime

    console.log('')
    console.log('✅ 直接连接测试成功!')
    console.log(`⏱️ 耗时: ${duration}ms`)
    console.log(`📄 结果长度: ${result.length} 字符`)
    console.log('')
    console.log('📋 结果预览:')
    console.log(result.substring(0, 500) + (result.length > 500 ? '...' : ''))
    console.log('')
    console.log('🎉 直接连接功能正常工作!')

  } catch (error) {
    console.error('❌ 直接连接测试失败:')
    console.error('   错误类型:', error.constructor.name)
    console.error('   错误信息:', error.message)
    
    if (error.message.includes('ETIMEDOUT')) {
      console.log('')
      console.log('💡 网络超时可能的原因:')
      console.log('   1. 网络连接不稳定')
      console.log('   2. Dify API服务器响应慢')
      console.log('   3. 防火墙或代理阻止连接')
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('')
      console.log('💡 连接被拒绝可能的原因:')
      console.log('   1. Dify API服务器不可达')
      console.log('   2. IP地址或端口错误')
      console.log('   3. 服务器拒绝连接')
    } else if (error.message.includes('401') || error.message.includes('403')) {
      console.log('')
      console.log('💡 认证失败可能的原因:')
      console.log('   1. API Token无效或过期')
      console.log('   2. 权限不足')
      console.log('   3. API密钥配置错误')
    }
  }

  console.log('')
  console.log('📊 ===== 测试总结 =====')
  console.log('测试目的: 验证直接连接Dify API功能')
  console.log('测试时间:', new Date().toLocaleString())
  console.log('功能特点:')
  console.log('  ✅ 绕过Netlify Functions代理')
  console.log('  ✅ 直接调用Dify API')
  console.log('  ✅ 3分钟超时配置')
  console.log('  ✅ 完整的进度回调')
  console.log('  ✅ 详细的错误处理')
}

// 运行测试
if (require.main === module) {
  testDirectConnection().catch(console.error)
}

module.exports = { testDirectConnection }
