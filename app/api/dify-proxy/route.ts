import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

/**
 * Dify API代理路由
 * 解决HTTPS网站调用HTTP API的Mixed Content问题
 */

// 使用统一的API端点
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
    
    // 在Netlify 26秒限制内尽快完成
    const response = await axios.post(`${DIFY_API_BASE_URL}/workflows/run`, body, {
      headers: {
        'Authorization': `Bearer ${DIFY_API_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SEO-Blog-Agent/1.0',
      },
      timeout: 1000 * 180, // 20秒超时，留出6秒缓冲
      validateStatus: () => true
    })
    
    console.log('   响应状态:', response.status, response.statusText)
    
    if (response.status < 200 || response.status >= 300) {
      console.error('❌ Dify API原始错误:', response.status, response.statusText, response.data)
      
      // 完整透传 Dify API 的原始错误信息
      const difyError = {
        error: 'Dify API原始错误',
        dify_status: response.status,
        dify_statusText: response.statusText,
        dify_url: `${DIFY_API_BASE_URL}/workflows/run`,
        dify_response: response.data, // 完整的 Dify 响应数据
        dify_headers: response.headers,
        proxy_info: {
          message: '这是来自 Dify API 服务器的原始错误响应',
          timestamp: new Date().toISOString(),
          proxy_url: '/api/dify-proxy'
        }
      }
      
      return NextResponse.json(difyError, { status: response.status })
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
        errorMessage = '网络连接超时 - 正在尝试连接Dify API服务器'
        statusCode = 503
      } else if (error.message.includes('fetch failed')) {
        errorMessage = '网络连接失败，无法连接到Dify API服务器'
        statusCode = 503
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'DNS解析失败，无法找到Dify API服务器'
        statusCode = 503
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = '连接被拒绝 - Dify API服务器可能拒绝了Netlify的连接'
        statusCode = 503
      }
    }
    
    // 构建包含原始错误的详细信息
    const networkError = {
      error: 'Dify API网络连接错误',
      network_error: {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        // 如果是 axios 错误，提取更多信息
        ...(error && typeof error === 'object' && 'code' in error ? {
          code: (error as any).code,
          errno: (error as any).errno,
          syscall: (error as any).syscall,
          hostname: (error as any).hostname,
          port: (error as any).port
        } : {})
      },
      dify_target: {
        url: `${DIFY_API_BASE_URL}/workflows/run`,
        method: 'POST',
        timeout: 180000
      },
      proxy_info: {
        message: '这是连接到 Dify API 服务器时发生的网络错误',
        timestamp: new Date().toISOString(),
        proxy_url: '/api/dify-proxy'
      }
    }
    
    return NextResponse.json(networkError, { status: statusCode })
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