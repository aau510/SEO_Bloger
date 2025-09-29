import { NextRequest, NextResponse } from 'next/server'

/**
 * Dify API代理路由
 * 解决HTTPS网站调用HTTP API的Mixed Content问题
 */

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
    
    // 发送请求到Dify API - 添加超时和重试
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超时
    
    const response = await fetch(`${DIFY_API_BASE_URL}/workflows/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SEO-Blog-Agent/1.0',
      },
      body: JSON.stringify(body),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    console.log('   响应状态:', response.status, response.statusText)
    console.log('   响应头:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Dify API错误:', errorText)
      
      return NextResponse.json({
        error: 'Dify API调用失败',
        status: response.status,
        message: errorText
      }, { status: response.status })
    }
    
    // 获取响应数据
    const data = await response.json()
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
        errorMessage = '请求超时 (30秒)'
        statusCode = 408
      } else if (error.message.includes('fetch failed')) {
        errorMessage = '网络连接失败，无法连接到Dify API服务器'
        statusCode = 503
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'DNS解析失败，无法找到Dify API服务器'
        statusCode = 503
      }
    }
    
    return NextResponse.json({
      error: '代理请求失败',
      message: errorMessage,
      details: {
        timestamp: new Date().toISOString(),
        target: `${DIFY_API_BASE_URL}/workflows/run`,
        errorType: error instanceof Error ? error.name : 'Unknown'
      }
    }, { status: statusCode })
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