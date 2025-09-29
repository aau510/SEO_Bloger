import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 测试网络连接...')
    
    // 测试多个目标
    const targets = [
      'http://47.90.156.219/v1/workflows/run',
      'http://httpbin.org/get',
      'http://api.github.com',
      'https://api.github.com'
    ]
    
    const results = []
    
    for (const target of targets) {
      try {
        console.log(`   测试: ${target}`)
        const start = Date.now()
        
        const response = await axios.get(target, {
          timeout: 10000,
          validateStatus: () => true
        })
        
        const duration = Date.now() - start
        
        results.push({
          target,
          status: response.status,
          duration,
          success: true,
          error: null
        })
        
        console.log(`   ✅ ${target}: ${response.status} (${duration}ms)`)
        
      } catch (error) {
        const duration = Date.now() - start
        results.push({
          target,
          status: null,
          duration,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
        
        console.log(`   ❌ ${target}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    
    return NextResponse.json({
      message: '网络连接测试完成',
      results,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
    
    return NextResponse.json({
      error: '测试失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}