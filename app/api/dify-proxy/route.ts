import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

/**
 * Dify API代理路由
 * 解决HTTPS网站调用HTTP API的Mixed Content问题
 */

// 使用高级代理服务器
const USE_MOCK_RESPONSE = false
const DIFY_PROXY_URL = 'http://10.61.197.191:3001/api/dify-proxy'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Dify代理请求开始')
    
    // 获取请求体
    const body = await request.json()
    console.log('   目标URL:', DIFY_PROXY_URL)
    console.log('   请求数据:', JSON.stringify(body, null, 2).substring(0, 500) + '...')
    
    // 转发请求到高级代理服务器
    const response = await axios.post(DIFY_PROXY_URL, body, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SEO-Blog-Agent-NextJS/1.0',
      },
      timeout: 1000 * 180, // 180秒超时
      validateStatus: () => true
    })
    
    console.log('   响应状态:', response.status, response.statusText)
    
    if (response.status < 200 || response.status >= 300) {
      console.error('❌ 代理服务器错误:', response.status, response.statusText, response.data)
      
      // 直接透传代理服务器的错误响应
      console.log('🔄 代理透传错误:', {
        source: DIFY_PROXY_URL,
        status: response.status,
        statusText: response.statusText,
        timestamp: new Date().toISOString()
      })
      
      return NextResponse.json(response.data, { 
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': 'application/json',
          'X-Proxy-Source': DIFY_PROXY_URL,
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
    
    // 直接透传网络错误
    console.error('❌ 网络连接到代理服务器失败:', error)
    console.log('🔄 代理透传网络错误:', {
      target: DIFY_PROXY_URL,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    })
    
    // 构建网络错误响应
    const networkErrorResponse = {
      error: error instanceof Error ? error.message : 'Network connection failed',
      message: `Failed to connect to proxy server at ${DIFY_PROXY_URL}`,
      code: error && typeof error === 'object' && 'code' in error ? (error as any).code : 'NETWORK_ERROR',
      details: {
        target: DIFY_PROXY_URL,
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
        'X-Proxy-Source': DIFY_PROXY_URL,
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