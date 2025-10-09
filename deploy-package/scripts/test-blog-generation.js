#!/usr/bin/env node

console.log('🧪 测试SEO博客生成功能...\n');

// 测试环境变量
function testEnvironmentVariables() {
  console.log('🔧 环境变量检查:');
  console.log('═'.repeat(50));
  
  const requiredEnvs = {
    'NEXT_PUBLIC_API_BASE_URL': process.env.NEXT_PUBLIC_API_BASE_URL,
    'API_AUTHORIZATION_TOKEN': process.env.API_AUTHORIZATION_TOKEN
  };
  
  let allConfigured = true;
  
  Object.entries(requiredEnvs).forEach(([key, value]) => {
    const status = value ? '✅' : '❌';
    const displayValue = value ? (key.includes('TOKEN') ? value.substring(0, 20) + '...' : value) : '未配置';
    console.log(`${status} ${key}: ${displayValue}`);
    if (!value) allConfigured = false;
  });
  
  console.log('═'.repeat(50));
  console.log(`总体状态: ${allConfigured ? '✅ 配置完整' : '❌ 配置缺失'}\n`);
  
  return allConfigured;
}

// 测试API连接
async function testApiConnection() {
  console.log('🌐 API连接测试:');
  console.log('═'.repeat(50));
  
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://qa-dify.joyme.sg/v1';
  const token = process.env.API_AUTHORIZATION_TOKEN || 'Bearer app-EVYktrhqnqncQSV9BdDv6uuu';
  
  try {
    const response = await fetch(`${baseUrl}/info`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API连接成功');
      console.log(`📊 应用信息: ${data.name} (${data.mode})`);
      console.log(`👤 作者: ${data.author_name}`);
      return true;
    } else {
      console.log(`❌ API连接失败: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 连接错误: ${error.message}`);
    return false;
  }
}

// 测试工作流端点
async function testWorkflowEndpoint() {
  console.log('\n🔄 工作流端点测试:');
  console.log('═'.repeat(50));
  
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://qa-dify.joyme.sg/v1';
  const token = process.env.API_AUTHORIZATION_TOKEN || 'Bearer app-EVYktrhqnqncQSV9BdDv6uuu';
  
  // 测试数据
  const testData = {
    inputs: {
      url_content: JSON.stringify({
        url: 'https://example.com',
        title: '测试页面',
        content: '这是一个测试页面的内容，用于验证工作流是否正常工作。',
        wordCount: 50
      }),
      Keywords: JSON.stringify([
        { keyword: '测试关键词', difficulty: 30, traffic: 1000, volume: 5000 }
      ])
    },
    response_mode: 'blocking',
    user: 'test-user'
  };
  
  try {
    const response = await fetch(`${baseUrl}/workflows/run`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`📡 请求状态: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 工作流端点可访问');
      console.log(`📊 响应数据: ${JSON.stringify(result).substring(0, 100)}...`);
      return true;
    } else {
      const errorText = await response.text();
      console.log('❌ 工作流调用失败');
      console.log(`📄 错误详情: ${errorText.substring(0, 200)}...`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 工作流测试错误: ${error.message}`);
    return false;
  }
}

// 检查关键组件
function checkComponents() {
  console.log('\n📦 组件完整性检查:');
  console.log('═'.repeat(50));
  
  const fs = require('fs');
  const path = require('path');
  
  const criticalFiles = [
    'components/DifyWorkflowForm.tsx',
    'components/BlogResultDisplay.tsx',
    'lib/dify-api.ts',
    'lib/url-scraper.ts',
    'app/api/scrape-content/route.ts'
  ];
  
  let allExist = true;
  
  criticalFiles.forEach(file => {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${file}`);
    if (!exists) allExist = false;
  });
  
  console.log('═'.repeat(50));
  console.log(`组件状态: ${allExist ? '✅ 完整' : '❌ 缺失文件'}\n`);
  
  return allExist;
}

// 主测试函数
async function runDiagnostics() {
  console.log('🎯 SEO博客智能体诊断报告');
  console.log('目标: 检查博客生成功能是否正常\n');
  
  // 运行所有测试
  const envOk = testEnvironmentVariables();
  const componentsOk = checkComponents();
  const apiOk = await testApiConnection();
  const workflowOk = await testWorkflowEndpoint();
  
  // 生成诊断报告
  console.log('\n📋 诊断总结:');
  console.log('═'.repeat(60));
  
  const tests = [
    { name: '环境变量配置', status: envOk },
    { name: '组件完整性', status: componentsOk },
    { name: 'API基础连接', status: apiOk },
    { name: '工作流端点', status: workflowOk }
  ];
  
  tests.forEach(test => {
    const status = test.status ? '✅ 通过' : '❌ 失败';
    console.log(`${status} ${test.name}`);
  });
  
  const allPassed = tests.every(test => test.status);
  
  console.log('═'.repeat(60));
  console.log(`🎊 总体状态: ${allPassed ? '✅ 系统正常' : '❌ 需要修复'}`);
  
  if (!allPassed) {
    console.log('\n🔧 修复建议:');
    if (!envOk) console.log('   • 检查 .env.local 文件是否存在并配置正确');
    if (!componentsOk) console.log('   • 检查关键组件文件是否完整');
    if (!apiOk) console.log('   • 验证API令牌和服务器地址');
    if (!workflowOk) console.log('   • 检查Dify工作流配置');
  } else {
    console.log('\n🚀 系统就绪，可以开始生成SEO博客！');
  }
}

// 运行诊断
runDiagnostics().catch(console.error);
