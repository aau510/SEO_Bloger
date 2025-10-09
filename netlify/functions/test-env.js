exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      DIFY_PROXY_URL: process.env.DIFY_PROXY_URL,
      API_AUTHORIZATION_TOKEN: process.env.API_AUTHORIZATION_TOKEN ? 'SET' : 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    })
  }
}
