import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 检查服务器端环境变量
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    const apiToken = process.env.API_AUTHORIZATION_TOKEN
    
    const configured = !!(apiUrl && apiToken)
    
    return NextResponse.json({
      configured,
      details: {
        API_BASE_URL: apiUrl ? '✓ 已配置' : '✗ 缺失',
        API_TOKEN: apiToken ? '✓ 已配置' : '✗ 缺失',
        API_URL_VALUE: apiUrl || 'undefined',
        API_TOKEN_PREVIEW: apiToken ? `${apiToken.substring(0, 25)}...` : 'undefined'
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('环境变量检查错误:', error)
    return NextResponse.json({
      configured: false,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
