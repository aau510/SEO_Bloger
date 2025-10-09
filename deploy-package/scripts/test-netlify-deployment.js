#!/usr/bin/env node

/**
 * Netlify部署测试脚本
 * 测试站点功能和API连接
 */

const https = require('https')
const http = require('http')

// 配置
const NETLIFY_SITE_URL = process.argv[2] || 'https://your-netlify-site.netlify.app'
const TEST_TIMEOUT = 30000

console.log('🧪 开始测试Netlify部署...')
console.log(`🌐 测试站点: ${NETLIFY_SITE_URL}`)
console.log('')

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http
    const timeout = setTimeout(() => {
      reject(new Error('请求超时'))
    }, TEST_TIMEOUT)

    const req = client.request(url, options, (res) => {
      clearTimeout(timeout)
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          data: data
        })
      })
    })

    req.on('error', (error) => {
      clearTimeout(timeout)
      reject(error)
    })

    if (options.body) {
      req.write(options.body)
    }
    
    req.end()
  })
}

async function testHomePage() {
  try {
    console.log('🏠 1. 测试主页加载...')
    const start = Date.now()
    
    const response = await makeRequest(NETLIFY_SITE_URL)
    const duration = Date.now() - start
    
    if (response.status === 200) {
      console.log(`   ✅ 主页加载成功 (${response.status}) - ${duration}ms`)
      console.log(`   📦 内容长度: ${response.data.length} 字符`)
      
      // 检查关键内容
      if (response.data.includes('SEO博客智能体') || response.data.includes('SEO Blog Agent')) {
        console.log('   ✅ 页面内容正确')
      } else {
        console.log('   ⚠️ 页面内容可能不完整')
      }
      
      return true
    } else {
      console.log(`   ❌ 主页加载失败: ${response.status} ${response.statusText}`)
      return false
    }
  } catch (error) {
    console.log(`   ❌ 主页测试失败: ${error.message}`)
    return false
  }
}

async function testApiProxy() {
  try {
    console.log('🔗 2. 测试API代理连接...')
    const start = Date.now()
    
    const testData = {
      inputs: {
        url_content: "测试内容",
        Keywords: "[]"
      },
      response_mode: "blocking",
      user: "test",
      conversation_id: ""
    }
    
    const response = await makeRequest(`${NETLIFY_SITE_URL}/api/dify-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    })
    
    const duration = Date.now() - start
    
    console.log(`   📊 响应状态: ${response.status} ${response.statusText}`)
    console.log(`   ⏱️ 响应时间: ${duration}ms`)
    
    if (response.status === 200) {
      try {
        const data = JSON.parse(response.data)
        if (data.task_id && data.data && data.data.outputs) {
          console.log('   ✅ API代理连接成功')
          console.log('   ✅ Dify工作流响应正常')
          console.log(`   📋 任务ID: ${data.task_id}`)
          return true
        } else {
          console.log('   ⚠️ API响应格式异常')
          console.log(`   📄 响应预览: ${response.data.substring(0, 200)}...`)
          return false
        }
      } catch (parseError) {
        console.log('   ❌ JSON解析失败')
        console.log(`   📄 响应内容: ${response.data.substring(0, 200)}...`)
        return false
      }
    } else {
      console.log(`   ❌ API代理连接失败: ${response.status}`)
      console.log(`   📄 错误信息: ${response.data.substring(0, 200)}...`)
      return false
    }
  } catch (error) {
    console.log(`   ❌ API测试失败: ${error.message}`)
    return false
  }
}

async function testContentScraping() {
  try {
    console.log('🌐 3. 测试内容抓取API...')
    const start = Date.now()
    
    const response = await makeRequest(`${NETLIFY_SITE_URL}/api/scrape-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: 'https://example.com' })
    })
    
    const duration = Date.now() - start
    
    if (response.status === 200) {
      try {
        const data = JSON.parse(response.data)
        console.log(`   ✅ 内容抓取成功 - ${duration}ms`)
        console.log(`   📄 标题: ${data.title || '未知'}`)
        console.log(`   📊 内容长度: ${data.text?.length || 0} 字符`)
        return true
      } catch (parseError) {
        console.log('   ❌ 响应解析失败')
        return false
      }
    } else {
      console.log(`   ❌ 内容抓取失败: ${response.status}`)
      return false
    }
  } catch (error) {
    console.log(`   ❌ 内容抓取测试失败: ${error.message}`)
    return false
  }
}

async function runTests() {
  console.log('📋 ===== Netlify部署测试报告 =====')
  console.log(`📅 测试时间: ${new Date().toLocaleString()}`)
  console.log('')
  
  const results = {
    homepage: await testHomePage(),
    apiProxy: await testApiProxy(),
    contentScraping: await testContentScraping()
  }
  
  console.log('')
  console.log('📊 ===== 测试结果总结 =====')
  console.log(`🏠 主页加载: ${results.homepage ? '✅ 正常' : '❌ 失败'}`)
  console.log(`🔗 API代理: ${results.apiProxy ? '✅ 正常' : '❌ 失败'}`)
  console.log(`🌐 内容抓取: ${results.contentScraping ? '✅ 正常' : '❌ 失败'}`)
  
  const successCount = Object.values(results).filter(Boolean).length
  const totalCount = Object.keys(results).length
  const successRate = Math.round((successCount / totalCount) * 100)
  
  console.log('')
  console.log(`📈 总体成功率: ${successCount}/${totalCount} (${successRate}%)`)
  
  if (successRate === 100) {
    console.log('🎉 所有测试通过！Netlify部署完全成功！')
  } else if (successRate >= 66) {
    console.log('⚠️ 部分功能正常，需要检查失败的项目')
  } else {
    console.log('❌ 多项测试失败，需要进一步调试')
  }
  
  console.log('')
  console.log('🎯 如果API代理成功，说明已解决Vercel的网络限制问题！')
}

// 运行测试
runTests().catch(console.error)
