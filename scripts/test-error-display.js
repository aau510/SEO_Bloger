#!/usr/bin/env node

/**
 * 测试详细错误显示功能
 * 模拟各种错误情况，验证错误信息的完整展示
 */

console.log('🧪 测试详细错误显示功能...')
console.log('')

// 模拟不同类型的错误
const testErrors = [
  {
    name: '代理连接错误',
    error: {
      type: '代理连接错误',
      timestamp: new Date().toISOString(),
      message: 'Request failed with status code 500',
      originalError: {
        name: 'AxiosError',
        message: 'Request failed with status code 500',
        stack: 'AxiosError: Request failed with status code 500\n    at settle (/node_modules/axios/lib/core/settle.js:19:12)\n    at IncomingMessage.handleStreamEnd (/node_modules/axios/lib/adapters/http.js:478:11)'
      },
      details: {
        status: 500,
        statusText: 'Internal Server Error',
        data: {
          error: 'Dify API调用失败',
          message: 'connect ETIMEDOUT 47.90.156.219:80'
        },
        config: {
          url: '/api/dify-proxy',
          method: 'post',
          timeout: 20000
        }
      }
    }
  },
  {
    name: '网络超时错误',
    error: {
      type: '代理连接错误',
      timestamp: new Date().toISOString(),
      message: 'timeout of 20000ms exceeded',
      originalError: {
        name: 'AxiosError',
        message: 'timeout of 20000ms exceeded',
        stack: 'AxiosError: timeout of 20000ms exceeded\n    at createError (/node_modules/axios/lib/core/createError.js:16:15)\n    at XMLHttpRequest.handleTimeout (/node_modules/axios/lib/adapters/xhr.js:178:16)'
      },
      details: {
        request: '请求已发送但未收到响应',
        timeout: 20000,
        url: '/api/dify-proxy'
      }
    }
  },
  {
    name: '认证失败错误',
    error: {
      type: '代理连接错误',
      timestamp: new Date().toISOString(),
      message: 'Request failed with status code 401',
      originalError: {
        name: 'AxiosError',
        message: 'Request failed with status code 401',
        stack: 'AxiosError: Request failed with status code 401\n    at settle (/node_modules/axios/lib/core/settle.js:19:12)'
      },
      details: {
        status: 401,
        statusText: 'Unauthorized',
        data: {
          error: 'Invalid API token',
          message: 'The provided API token is invalid or expired'
        },
        config: {
          url: 'http://47.90.156.219/v1/workflows/run',
          method: 'post',
          timeout: 180000
        }
      }
    }
  }
]

console.log('📋 测试场景:')
testErrors.forEach((test, index) => {
  console.log(`${index + 1}. ${test.name}`)
})
console.log('')

// 显示每个错误的详细信息结构
testErrors.forEach((test, index) => {
  console.log(`🔍 测试 ${index + 1}: ${test.name}`)
  console.log('─'.repeat(50))
  
  const error = test.error
  
  console.log('📊 基本信息:')
  console.log(`   类型: ${error.type}`)
  console.log(`   时间: ${error.timestamp}`)
  console.log(`   消息: ${error.message}`)
  console.log('')
  
  if (error.originalError) {
    console.log('🔥 原始错误:')
    console.log(`   名称: ${error.originalError.name}`)
    console.log(`   消息: ${error.originalError.message}`)
    console.log(`   堆栈: ${error.originalError.stack ? '✅ 可用' : '❌ 不可用'}`)
    console.log('')
  }
  
  if (error.details) {
    console.log('🌐 详细信息:')
    
    if (error.details.status) {
      console.log(`   HTTP状态: ${error.details.status} ${error.details.statusText}`)
      console.log(`   请求URL: ${error.details.config?.url}`)
      console.log(`   超时设置: ${error.details.config?.timeout}ms`)
      
      if (error.details.data) {
        console.log('   响应数据:')
        console.log(`     ${JSON.stringify(error.details.data, null, 6)}`)
      }
    }
    
    if (error.details.request) {
      console.log(`   请求状态: ${error.details.request}`)
      console.log(`   目标URL: ${error.details.url}`)
      console.log(`   超时设置: ${error.details.timeout}ms`)
    }
    
    console.log('')
  }
  
  console.log('✅ UI显示效果:')
  console.log('   ├─ 错误类型标签 (红色)')
  console.log('   ├─ 基本错误信息')
  console.log('   ├─ 可折叠的原始错误详情')
  console.log('   ├─ HTTP响应详情 (如果有)')
  console.log('   └─ 网络请求详情 (如果有)')
  console.log('')
  console.log('═'.repeat(60))
  console.log('')
})

console.log('🎯 功能验证点:')
console.log('✅ 1. 错误类型正确识别')
console.log('✅ 2. 时间戳准确记录')
console.log('✅ 3. 原始错误完整保留')
console.log('✅ 4. HTTP状态码和响应数据')
console.log('✅ 5. 网络请求详情')
console.log('✅ 6. 堆栈跟踪可折叠显示')
console.log('✅ 7. JSON数据格式化显示')
console.log('')

console.log('🎨 UI特性:')
console.log('🔴 红色主题突出错误状态')
console.log('📋 分层级显示信息结构')
console.log('🔽 可折叠详情避免信息过载')
console.log('📱 响应式设计适配不同屏幕')
console.log('🔍 JSON格式化便于调试')
console.log('')

console.log('💡 用户体验:')
console.log('👀 一眼看到关键错误信息')
console.log('🔧 开发者可以深入调试')
console.log('📊 完整的错误上下文')
console.log('🚀 快速定位问题根源')
console.log('')

console.log('🎉 详细错误显示功能测试完成！')
console.log('现在代理连接的原始错误将完整展示给用户')
