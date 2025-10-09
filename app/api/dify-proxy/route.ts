import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

/**
 * Dify API代理路由
 * 解决HTTPS网站调用HTTP API的Mixed Content问题
 */

// 使用真实的Dify API响应
const USE_MOCK_RESPONSE = false
const DIFY_API_BASE_URL = 'http://47.90.156.219/v1'
const DIFY_API_TOKEN = process.env.API_AUTHORIZATION_TOKEN || 'app-EVYktrhqnqncQSV9BdDv6uuu'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Dify代理请求开始')
    
    // 获取请求体
    const body = await request.json()
    console.log('   目标URL:', `${DIFY_API_BASE_URL}/workflows/run`)
    console.log('   Token:', `Bearer ${DIFY_API_TOKEN.substring(0, 25)}...`)
    console.log('   请求数据:', JSON.stringify(body, null, 2).substring(0, 500) + '...')
    
    let response: any
    
    if (USE_MOCK_RESPONSE) {
      console.log('🎭 使用模拟响应，避免网络连接问题')
      
      // 模拟Dify API的响应
      const mockResponse = {
        data: {
          data: {
            outputs: {
              seo_blog: `# SEO博客生成测试

## 基于关键词的SEO优化内容

这是一篇基于您提供的关键词生成的SEO博客文章。文章内容已经过优化，包含了相关的关键词和SEO最佳实践。

### 主要内容

1. **关键词优化**: 文章已根据您提供的关键词进行了优化
2. **内容结构**: 采用了清晰的标题结构和段落组织
3. **SEO友好**: 包含了适当的标题标签和关键词密度

### 技术实现

- 使用Dify工作流进行内容生成
- 基于AI的智能内容优化
- 符合SEO最佳实践的内容结构

### 总结

这篇博客文章展示了如何使用AI技术生成高质量的SEO内容，帮助提升网站的搜索引擎排名和用户体验。

---
*本文由SEO博客智能体自动生成*`
            }
          }
        }
      }
      
      response = {
        status: 200,
        statusText: 'OK',
        data: mockResponse.data
      }
    } else {
      // 直接调用Dify API
      response = await axios.post(`${DIFY_API_BASE_URL}/workflows/run`, body, {
        headers: {
          'Authorization': `Bearer ${DIFY_API_TOKEN}`,
          'Content-Type': 'application/json',
          'User-Agent': 'SEO-Blog-Agent/1.0',
        },
        timeout: 1000 * 180, // 180秒超时
        validateStatus: () => true
      })
    }
    
    console.log('   响应状态:', response.status, response.statusText)
    
    if (response.status < 200 || response.status >= 300) {
      console.error('❌ Dify API原始错误 (47.90.156.219):', response.status, response.statusText, response.data)
      
      // 直接透传 47.90.156.219 的原始错误响应，不做任何包装
      console.log('🔄 代理透传原始错误:', {
        source: '47.90.156.219/v1/workflows/run',
        status: response.status,
        statusText: response.statusText,
        timestamp: new Date().toISOString()
      })
      
      return NextResponse.json(response.data, { 
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': 'application/json',
          'X-Dify-Source': '47.90.156.219/v1/workflows/run',
          'X-Proxy-Timestamp': new Date().toISOString()
        }
      })
    }
    
    // 获取响应数据
    const data = response.data
    console.log('✅ 代理请求成功')
    console.log('   响应数据预览:', JSON.stringify(data, null, 2).substring(0, 500) + '...')
    
    // 返回数据
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('❌ 代理请求失败:', error)
    
    // 详细的错误信息
    let errorMessage = '未知错误'
    let statusCode = 500
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      // 处理特定错误类型
      if (error.name === 'AbortError') {
        errorMessage = '请求超时 (60秒) - Dify工作流处理时间较长'
        statusCode = 408
      } else if (error.message.includes('timeout')) {
        errorMessage = '请求超时 - Dify API处理时间过长，请稍后重试'
        statusCode = 408
      } else if (error.message.includes('ETIMEDOUT')) {
        errorMessage = '网络连接超时 - 正在尝试连接代理服务器'
        statusCode = 503
      } else if (error.message.includes('fetch failed')) {
        errorMessage = '网络连接失败，无法连接到代理服务器'
        statusCode = 503
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'DNS解析失败，无法找到代理服务器'
        statusCode = 503
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = '连接被拒绝 - 代理服务器可能拒绝了连接'
        statusCode = 503
      }
    }
    
    // 直接透传网络错误，模拟 47.90.156.219 可能返回的错误格式
    console.error('❌ 网络连接到 47.90.156.219 失败:', error)
    console.log('🔄 代理透传网络错误:', {
      target: '47.90.156.219/v1/workflows/run',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    })
    
    // 构建类似 Dify API 可能返回的错误格式
    const networkErrorResponse = {
      error: error instanceof Error ? error.message : 'Network connection failed',
      message: `Failed to connect to Dify API server at 47.90.156.219`,
      code: error && typeof error === 'object' && 'code' in error ? (error as any).code : 'NETWORK_ERROR',
      details: {
        target: '47.90.156.219/v1/workflows/run',
        ...(error && typeof error === 'object' && 'code' in error ? {
          errno: (error as any).errno,
          syscall: (error as any).syscall
        } : {})
      }
    }
    
    return NextResponse.json(networkErrorResponse, { 
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Dify-Source': '47.90.156.219/v1/workflows/run',
        'X-Proxy-Timestamp': new Date().toISOString(),
        'X-Error-Type': 'network'
      }
    })
  }
}

// 支持OPTIONS请求（CORS预检）
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}