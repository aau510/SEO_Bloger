import { NextRequest, NextResponse } from 'next/server'
import https from 'https'
import http from 'http'

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
    
    // 使用Node.js原生http模块发送请求
    const response = await new Promise<any>((resolve, reject) => {
      const postData = JSON.stringify(body)
      const url = new URL(`${DIFY_API_BASE_URL}/workflows/run`)
      
      const options = {
        hostname: url.hostname,
        port: url.port || 80,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DIFY_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'User-Agent': 'SEO-Blog-Agent/1.0',
        },
        timeout: 30000
      }
      
      const req = http.request(options, (res) => {
        let data = ''
        
        res.on('data', (chunk) => {
          data += chunk
        })
        
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data)
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              statusText: res.statusMessage,
              headers: res.headers,
              json: () => Promise.resolve(jsonData)
            })
          } catch (error) {
            reject(new Error(`JSON解析失败: ${error}`))
          }
        })
      })
      
      req.on('error', (error) => {
        reject(error)
      })
      
      req.on('timeout', () => {
        req.destroy()
        reject(new Error('请求超时'))
      })
      
      req.write(postData)
      req.end()
    })
    
    console.log('   响应状态:', response.status, response.statusText)
    console.log('   响应头:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Dify API错误:', errorData)
      
      return NextResponse.json({
        error: 'Dify API调用失败',
        status: response.status,
        message: errorData
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