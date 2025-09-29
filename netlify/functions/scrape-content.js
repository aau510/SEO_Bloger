const { scrapeUrlContent } = require('../../lib/url-scraper')

exports.handler = async (event, context) => {
  // 设置CORS头部
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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
    console.log('🔄 Netlify函数: 内容抓取请求开始')
    
    // 解析请求体
    const body = JSON.parse(event.body || '{}')
    const { url } = body
    
    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'URL is required' })
      }
    }
    
    console.log('   目标URL:', url)
    
    // 抓取内容
    const content = await scrapeUrlContent(url)
    
    console.log('✅ 内容抓取成功')
    console.log('   标题:', content.title)
    console.log('   内容长度:', content.text?.length || 0)
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(content)
    }
    
  } catch (error) {
    console.error('❌ 内容抓取失败:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: '内容抓取失败',
        message: error instanceof Error ? error.message : '未知错误'
      })
    }
  }
}
