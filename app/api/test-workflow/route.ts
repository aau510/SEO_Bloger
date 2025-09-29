import { NextRequest, NextResponse } from 'next/server'

const DIFY_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://qa-dify.joyme.sg/v1'
const DIFY_API_TOKEN = process.env.API_AUTHORIZATION_TOKEN || 'Bearer app-EVYktrhqnqncQSV9BdDv6uuu'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 测试工作流端点（不实际执行，只测试连接）
    const response = await fetch(`${DIFY_API_BASE_URL}/workflows/run`, {
      method: 'POST',
      headers: {
        'Authorization': DIFY_API_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...body,
        inputs: {
          URL: 'https://test.example.com',
          URL_subpage: '/test-connection',
          Keywords: JSON.stringify([{keyword: 'test', difficulty: 1, traffic: 1}])
        },
        response_mode: 'blocking',
        user: 'connection-test'
      })
    })

    const responseText = await response.text()
    let responseData
    
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = responseText
    }

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: '工作流端点可访问',
        data: responseData,
        status: response.status,
        endpoint: `${DIFY_API_BASE_URL}/workflows/run`,
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        success: false,
        message: `工作流调用失败: ${response.status} ${response.statusText}`,
        data: responseData,
        status: response.status,
        endpoint: `${DIFY_API_BASE_URL}/workflows/run`,
        timestamp: new Date().toISOString()
      }, { status: 200 }) // 返回200让前端处理显示
    }
  } catch (error) {
    console.error('工作流测试失败:', error)
    return NextResponse.json({
      success: false,
      message: '工作流测试失败',
      error: error instanceof Error ? error.message : 'Unknown error',
      endpoint: `${DIFY_API_BASE_URL}/workflows/run`,
      timestamp: new Date().toISOString()
    }, { status: 200 })
  }
}
