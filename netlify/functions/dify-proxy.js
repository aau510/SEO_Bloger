const axios = require('axios')

// 使用统一的API端点
const DIFY_API_BASE_URL = 'http://47.90.156.219/v1'
const DIFY_API_TOKEN = process.env.API_AUTHORIZATION_TOKEN || 'app-EVYktrhqnqncQSV9BdDv6uuu'

exports.handler = async (event, context) => {
  // 设置CORS头部
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  // 处理OPTIONS预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  // 只处理POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    console.log('🔄 Netlify函数: Dify代理请求开始')
    
    // 解析请求体
    const body = JSON.parse(event.body || '{}')
    console.log('   目标URL:', `${DIFY_API_BASE_URL}/workflows/run`)
    console.log('   Token:', `Bearer ${DIFY_API_TOKEN.substring(0, 25)}...`)
    console.log('   请求数据:', JSON.stringify(body, null, 2).substring(0, 500) + '...')
    
    // 调用Dify API
    const response = await axios.post(`${DIFY_API_BASE_URL}/workflows/run`, body, {
      headers: {
        'Authorization': `Bearer ${DIFY_API_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SEO-Blog-Agent/1.0',
      },
      timeout: 20000, // 20秒超时
      validateStatus: () => true
    })
    
    console.log('   响应状态:', response.status, response.statusText)
    
    if (response.status < 200 || response.status >= 300) {
      console.error('❌ Dify API错误:', response.data)
      
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: 'Dify API调用失败',
          status: response.status,
          message: response.data
        })
      }
    }
    
    // 返回成功响应
    const data = response.data
    console.log('✅ 代理请求成功')
    console.log('   响应数据预览:', JSON.stringify(data, null, 2).substring(0, 500) + '...')
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    }
    
  } catch (error) {
    console.error('❌ 代理请求失败:', error)
    
    // 详细的错误处理
    let errorMessage = '未知错误'
    let statusCode = 500
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      if (error.message.includes('timeout')) {
        errorMessage = '请求超时 - Dify API处理时间过长，请稍后重试'
        statusCode = 408
      } else if (error.message.includes('ETIMEDOUT')) {
        errorMessage = '网络连接超时 - 正在尝试连接Dify API服务器'
        statusCode = 503
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = '连接被拒绝 - Dify API服务器可能拒绝了连接'
        statusCode = 503
      }
    }
    
    return {
      statusCode: statusCode,
      headers,
      body: JSON.stringify({
        error: '代理请求失败',
        message: errorMessage,
        details: {
          timestamp: new Date().toISOString(),
          target: `${DIFY_API_BASE_URL}/workflows/run`,
          errorType: error instanceof Error ? error.name : 'Unknown'
        }
      })
    }
  }
}
