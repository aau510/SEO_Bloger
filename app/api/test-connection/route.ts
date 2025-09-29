import { NextRequest, NextResponse } from 'next/server'

const DIFY_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://qa-dify.joyme.sg/v1'
const DIFY_API_TOKEN = process.env.API_AUTHORIZATION_TOKEN || 'Bearer app-EVYktrhqnqncQSV9BdDv6uuu'

export async function POST(request: NextRequest) {
  try {
    // 测试基本连接
    const response = await fetch(`${DIFY_API_BASE_URL}/info`, {
      method: 'GET',
      headers: {
        'Authorization': DIFY_API_TOKEN,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        success: true,
        message: 'Dify API连接成功',
        data: data,
        endpoint: DIFY_API_BASE_URL,
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        success: false,
        message: `连接失败: ${response.status} ${response.statusText}`,
        endpoint: DIFY_API_BASE_URL,
        timestamp: new Date().toISOString()
      }, { status: response.status })
    }
  } catch (error) {
    console.error('Dify连接测试失败:', error)
    return NextResponse.json({
      success: false,
      message: '网络连接失败',
      error: error instanceof Error ? error.message : 'Unknown error',
      endpoint: DIFY_API_BASE_URL,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
