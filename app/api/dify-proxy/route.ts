import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

/**
 * Dify API代理路由
 * 解决HTTPS网站调用HTTP API的Mixed Content问题
 */

// 尝试多种连接方式
const DIFY_API_ENDPOINTS = [
  'http://47.90.156.219/v1',
  'http://47.90.156.219:80/v1',
  // 如果有HTTPS支持可以尝试
  // 'https://47.90.156.219/v1'
]
const DIFY_API_TOKEN = process.env.API_AUTHORIZATION_TOKEN || 'app-EVYktrhqnqncQSV9BdDv6uuu'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Dify代理请求开始')
    
    // 获取请求体
    const body = await request.json()
    console.log('   Token:', `Bearer ${DIFY_API_TOKEN.substring(0, 25)}...`)
    console.log('   请求数据:', JSON.stringify(body, null, 2).substring(0, 500) + '...')
    
    // 尝试多个端点
    let response = null
    let lastError = null
    
    for (const baseUrl of DIFY_API_ENDPOINTS) {
      try {
        console.log(`   尝试连接: ${baseUrl}/workflows/run`)
        
        response = await axios.post(`${baseUrl}/workflows/run`, body, {
          headers: {
            'Authorization': `Bearer ${DIFY_API_TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': 'SEO-Blog-Agent/1.0',
          },
          timeout: 15000, // 缩短超时时间
          validateStatus: () => true
        })
        
        console.log(`   ✅ 连接成功: ${baseUrl}`)
        break
        
      } catch (error) {
        console.log(`   ❌ 连接失败: ${baseUrl} - ${error instanceof Error ? error.message : String(error)}`)
        lastError = error
        continue
      }
    }
    
    if (!response) {
      throw lastError || new Error('所有端点连接失败')
    }
    
    console.log('   响应状态:', response.status, response.statusText)
    console.log('   响应头:', response.headers)
    
    if (response.status < 200 || response.status >= 300) {
      console.error('❌ Dify API错误:', response.data)
      
      return NextResponse.json({
        error: 'Dify API调用失败',
        status: response.status,
        message: response.data
      }, { status: response.status })
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
        errorMessage = '请求超时 (15秒)'
        statusCode = 408
      } else if (error.message.includes('ETIMEDOUT')) {
        errorMessage = '网络连接超时 - Dify API服务器可能限制了Netlify服务器的访问'
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
    
    return NextResponse.json({
      error: '代理请求失败',
      message: errorMessage,
      details: {
        timestamp: new Date().toISOString(),
        target: DIFY_API_ENDPOINTS.map(url => `${url}/workflows/run`).join(', '),
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