#!/usr/bin/env node

/**
 * 测试环境变量配置
 * 验证所有必需的环境变量是否正确设置
 */

const fs = require('fs')
const path = require('path')

console.log('🧪 测试环境变量配置')
console.log('=' .repeat(50))

// 1. 检查.env.local文件
console.log('\n📋 1. 检查.env.local文件')

const envPath = path.join(__dirname, '../.env.local')
const envExists = fs.existsSync(envPath)

console.log(`   ✅ .env.local文件存在: ${envExists ? '是' : '否'}`)

if (envExists) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  
  // 检查必需的环境变量
  const requiredVars = [
    'NEXT_PUBLIC_API_BASE_URL',
    'API_AUTHORIZATION_TOKEN',
    'NEXT_PUBLIC_SITE_NAME',
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_SITE_DESCRIPTION'
  ]
  
  console.log('   📊 环境变量检查:')
  requiredVars.forEach(varName => {
    const hasVar = envContent.includes(varName)
    const isEmpty = envContent.includes(`${varName}=`) && 
                   !envContent.match(new RegExp(`${varName}=.+`))
    
    console.log(`      ${varName}: ${hasVar ? '✅' : '❌'} ${isEmpty ? '(空值)' : ''}`)
  })
  
  // 检查API配置
  const apiBaseUrlMatch = envContent.match(/NEXT_PUBLIC_API_BASE_URL=(.+)/)
  const apiTokenMatch = envContent.match(/API_AUTHORIZATION_TOKEN=(.+)/)
  
  if (apiBaseUrlMatch) {
    console.log(`   🌐 API Base URL: ${apiBaseUrlMatch[1]}`)
  }
  
  if (apiTokenMatch) {
    const token = apiTokenMatch[1]
    const maskedToken = token.length > 10 ? 
      token.substring(0, 10) + '...' + token.substring(token.length - 4) :
      token
    console.log(`   🔑 API Token: ${maskedToken}`)
  }
}

// 2. 检查vercel.json配置
console.log('\n🚀 2. 检查Vercel配置')

const vercelPath = path.join(__dirname, '../vercel.json')
const vercelExists = fs.existsSync(vercelPath)

console.log(`   ✅ vercel.json文件存在: ${vercelExists ? '是' : '否'}`)

if (vercelExists) {
  try {
    const vercelContent = fs.readFileSync(vercelPath, 'utf-8')
    const vercelConfig = JSON.parse(vercelContent)
    
    if (vercelConfig.env) {
      console.log('   📊 Vercel环境变量:')
      Object.entries(vercelConfig.env).forEach(([key, value]) => {
        const isSecret = typeof value === 'string' && value.startsWith('@')
        const displayValue = isSecret ? value : (value.length > 30 ? value.substring(0, 30) + '...' : value)
        console.log(`      ${key}: ${displayValue} ${isSecret ? '(密钥引用)' : '(直接值)'}`)
      })
      
      // 检查是否有不存在的密钥引用
      const secretRefs = Object.entries(vercelConfig.env)
        .filter(([key, value]) => typeof value === 'string' && value.startsWith('@'))
        .map(([key, value]) => ({ key, secret: value.substring(1) }))
      
      if (secretRefs.length > 0) {
        console.log('   ⚠️  需要在Vercel中设置的密钥:')
        secretRefs.forEach(({ key, secret }) => {
          console.log(`      ${secret} (用于 ${key})`)
        })
      }
    }
  } catch (error) {
    console.log(`   ❌ vercel.json解析失败: ${error.message}`)
  }
}

// 3. 检查Next.js配置
console.log('\n⚙️ 3. 检查Next.js配置')

const nextConfigPath = path.join(__dirname, '../next.config.js')
const nextConfigExists = fs.existsSync(nextConfigPath)

console.log(`   ✅ next.config.js文件存在: ${nextConfigExists ? '是' : '否'}`)

if (nextConfigExists) {
  const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf-8')
  
  // 检查环境变量相关配置
  const hasEnvConfig = nextConfigContent.includes('env:') || 
                      nextConfigContent.includes('publicRuntimeConfig') ||
                      nextConfigContent.includes('serverRuntimeConfig')
  
  console.log(`   📊 包含环境变量配置: ${hasEnvConfig ? '是' : '否'}`)
}

// 4. 模拟环境变量加载
console.log('\n🔄 4. 模拟环境变量加载')

if (envExists) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const envVars = {}
  
  // 解析环境变量
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        envVars[key] = valueParts.join('=')
      }
    }
  })
  
  console.log('   📊 解析的环境变量:')
  Object.entries(envVars).forEach(([key, value]) => {
    const displayValue = key.includes('TOKEN') || key.includes('SECRET') ?
      (value.length > 10 ? value.substring(0, 10) + '...' + value.substring(value.length - 4) : value) :
      value
    console.log(`      ${key}=${displayValue}`)
  })
  
  // 验证关键配置
  const apiBaseUrl = envVars['NEXT_PUBLIC_API_BASE_URL']
  const apiToken = envVars['API_AUTHORIZATION_TOKEN']
  
  console.log('\n   🔍 配置验证:')
  console.log(`      API Base URL格式: ${apiBaseUrl && apiBaseUrl.startsWith('http') ? '✅' : '❌'}`)
  console.log(`      API Token格式: ${apiToken && (apiToken.startsWith('app-') || apiToken.startsWith('Bearer ')) ? '✅' : '❌'}`)
  console.log(`      API URL可达性: 需要网络测试`)
}

// 5. 生成修复建议
console.log('\n💡 5. 修复建议')

const suggestions = []

if (!envExists) {
  suggestions.push('创建.env.local文件，包含所有必需的环境变量')
}

if (vercelExists) {
  try {
    const vercelContent = fs.readFileSync(vercelPath, 'utf-8')
    const vercelConfig = JSON.parse(vercelContent)
    
    if (vercelConfig.env) {
      const secretRefs = Object.entries(vercelConfig.env)
        .filter(([key, value]) => typeof value === 'string' && value.startsWith('@'))
      
      if (secretRefs.length > 0) {
        suggestions.push('在Vercel项目设置中添加以下环境变量:')
        secretRefs.forEach(({ key, secret }) => {
          suggestions.push(`  - ${secret.substring(1)}: 对应 ${key} 的值`)
        })
      }
    }
  } catch (error) {
    suggestions.push('修复vercel.json文件的JSON格式错误')
  }
}

if (suggestions.length === 0) {
  console.log('   🎉 配置看起来正确！')
} else {
  suggestions.forEach((suggestion, index) => {
    console.log(`   ${index + 1}. ${suggestion}`)
  })
}

// 6. 总结
console.log('\n🎯 6. 配置总结')

const configStatus = {
  localEnv: envExists,
  vercelConfig: vercelExists,
  hasApiUrl: envExists && fs.readFileSync(envPath, 'utf-8').includes('NEXT_PUBLIC_API_BASE_URL='),
  hasApiToken: envExists && fs.readFileSync(envPath, 'utf-8').includes('API_AUTHORIZATION_TOKEN=')
}

const allGood = Object.values(configStatus).every(status => status)

if (allGood) {
  console.log('   🎉 环境变量配置完成！')
  console.log('   ✨ 本地开发环境已就绪')
  console.log('   ✨ Vercel部署配置已更新')
} else {
  console.log('   ⚠️ 还有配置需要完善')
  console.log('   📋 请按照上述建议进行修复')
}

console.log('\n' + '='.repeat(50))
console.log('🏁 环境变量配置测试完成')
