#!/usr/bin/env node

/**
 * 生产环境健康检查脚本
 * 检查SEO博客智能体系统在生产环境中的运行状态
 */

const https = require('https');
const http = require('http');

const PRODUCTION_URL = 'https://seo-bloger-cvdf.vercel.app';
const API_BASE_URL = 'http://47.90.156.219/v1';
const API_TOKEN = 'app-EVYktrhqnqncQSV9BdDv6uuu';

console.log('🔍 开始生产环境健康检查...\n');

// 检查结果存储
const results = {
  deployment: null,
  api: null,
  envVars: null,
  performance: null,
  features: null
};

// HTTP请求工具函数
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const startTime = Date.now();
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          responseTime: responseTime
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// 1. 检查部署状态
async function checkDeployment() {
  console.log('📦 1. 检查部署状态...');
  
  try {
    const response = await makeRequest(PRODUCTION_URL, { method: 'HEAD' });
    
    results.deployment = {
      status: response.statusCode === 200 ? 'success' : 'failed',
      statusCode: response.statusCode,
      responseTime: response.responseTime,
      server: response.headers.server,
      cache: response.headers['x-vercel-cache'],
      contentLength: response.headers['content-length']
    };
    
    console.log(`   ✅ 部署状态: ${response.statusCode}`);
    console.log(`   ⚡ 响应时间: ${response.responseTime}ms`);
    console.log(`   🔧 服务器: ${response.headers.server}`);
    console.log(`   💾 缓存状态: ${response.headers['x-vercel-cache'] || 'N/A'}`);
    
  } catch (error) {
    results.deployment = { status: 'error', error: error.message };
    console.log(`   ❌ 部署检查失败: ${error.message}`);
  }
  
  console.log('');
}

// 2. 检查API连接
async function checkAPI() {
  console.log('🔗 2. 检查API连接...');
  
  try {
    // 检查API基础连接
    const apiResponse = await makeRequest(API_BASE_URL, { method: 'HEAD' });
    
    // 检查工作流端点
    const workflowResponse = await makeRequest(`${API_BASE_URL}/workflows/run`, {
      method: 'HEAD',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    
    results.api = {
      baseUrl: {
        status: apiResponse.statusCode,
        responseTime: apiResponse.responseTime
      },
      workflow: {
        status: workflowResponse.statusCode,
        responseTime: workflowResponse.responseTime,
        allowedMethods: workflowResponse.headers.allow
      }
    };
    
    console.log(`   ✅ API基础连接: ${apiResponse.statusCode} (${apiResponse.responseTime}ms)`);
    console.log(`   ✅ 工作流端点: ${workflowResponse.statusCode} (${workflowResponse.responseTime}ms)`);
    console.log(`   🔧 允许方法: ${workflowResponse.headers.allow || 'N/A'}`);
    
  } catch (error) {
    results.api = { status: 'error', error: error.message };
    console.log(`   ❌ API检查失败: ${error.message}`);
  }
  
  console.log('');
}

// 3. 检查环境变量
async function checkEnvironmentVariables() {
  console.log('🔧 3. 检查环境变量...');
  
  try {
    const response = await makeRequest(`${PRODUCTION_URL}/api/check-env`);
    const envData = JSON.parse(response.data);
    
    results.envVars = {
      configured: envData.configured,
      details: envData.details,
      responseTime: response.responseTime
    };
    
    console.log(`   📊 配置状态: ${envData.configured ? '✅ 已配置' : '❌ 未配置'}`);
    console.log(`   🌐 API Base URL: ${envData.details.API_BASE_URL}`);
    console.log(`   🔑 API Token: ${envData.details.API_TOKEN}`);
    
    if (envData.details.API_URL_VALUE && envData.details.API_URL_VALUE !== 'undefined') {
      console.log(`   🔗 API地址: ${envData.details.API_URL_VALUE}`);
    }
    
  } catch (error) {
    results.envVars = { status: 'error', error: error.message };
    console.log(`   ❌ 环境变量检查失败: ${error.message}`);
  }
  
  console.log('');
}

// 4. 检查核心功能
async function checkCoreFeatures() {
  console.log('🎯 4. 检查核心功能...');
  
  try {
    // 检查内容抓取API
    const scrapeResponse = await makeRequest(`${PRODUCTION_URL}/api/scrape-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: 'https://example.com' })
    });
    
    // 检查测试连接API
    const testResponse = await makeRequest(`${PRODUCTION_URL}/api/test-connection`);
    
    results.features = {
      scrapeContent: {
        status: scrapeResponse.statusCode,
        responseTime: scrapeResponse.responseTime
      },
      testConnection: {
        status: testResponse.statusCode,
        responseTime: testResponse.responseTime
      }
    };
    
    console.log(`   🌐 内容抓取API: ${scrapeResponse.statusCode} (${scrapeResponse.responseTime}ms)`);
    console.log(`   🔗 连接测试API: ${testResponse.statusCode} (${testResponse.responseTime}ms)`);
    
  } catch (error) {
    results.features = { status: 'error', error: error.message };
    console.log(`   ❌ 功能检查失败: ${error.message}`);
  }
  
  console.log('');
}

// 5. 性能检查
async function checkPerformance() {
  console.log('⚡ 5. 性能检查...');
  
  try {
    const tests = [];
    
    // 进行5次请求测试平均响应时间
    for (let i = 0; i < 5; i++) {
      const response = await makeRequest(PRODUCTION_URL, { method: 'HEAD' });
      tests.push(response.responseTime);
    }
    
    const avgResponseTime = tests.reduce((a, b) => a + b, 0) / tests.length;
    const minResponseTime = Math.min(...tests);
    const maxResponseTime = Math.max(...tests);
    
    results.performance = {
      avgResponseTime: Math.round(avgResponseTime),
      minResponseTime,
      maxResponseTime,
      tests: tests
    };
    
    console.log(`   📊 平均响应时间: ${Math.round(avgResponseTime)}ms`);
    console.log(`   ⚡ 最快响应: ${minResponseTime}ms`);
    console.log(`   🐌 最慢响应: ${maxResponseTime}ms`);
    console.log(`   📈 响应时间分布: [${tests.join(', ')}]ms`);
    
  } catch (error) {
    results.performance = { status: 'error', error: error.message };
    console.log(`   ❌ 性能检查失败: ${error.message}`);
  }
  
  console.log('');
}

// 6. 生成检测报告
function generateReport() {
  console.log('📋 6. 生成检测报告...\n');
  
  console.log('🎯 ===== 生产环境健康检查报告 =====');
  console.log(`📅 检查时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log(`🌐 生产地址: ${PRODUCTION_URL}`);
  console.log(`🔗 API服务器: ${API_BASE_URL}`);
  console.log('');
  
  // 部署状态
  console.log('📦 部署状态:');
  if (results.deployment?.status === 'success') {
    console.log(`   ✅ 状态: 正常运行 (${results.deployment.statusCode})`);
    console.log(`   ⚡ 响应时间: ${results.deployment.responseTime}ms`);
    console.log(`   🔧 服务器: ${results.deployment.server}`);
  } else {
    console.log(`   ❌ 状态: 异常 - ${results.deployment?.error || '未知错误'}`);
  }
  console.log('');
  
  // API连接
  console.log('🔗 API连接:');
  if (results.api?.baseUrl) {
    console.log(`   ✅ 基础连接: ${results.api.baseUrl.status} (${results.api.baseUrl.responseTime}ms)`);
    console.log(`   ✅ 工作流端点: ${results.api.workflow.status} (${results.api.workflow.responseTime}ms)`);
  } else {
    console.log(`   ❌ 连接失败: ${results.api?.error || '未知错误'}`);
  }
  console.log('');
  
  // 环境变量
  console.log('🔧 环境变量:');
  if (results.envVars?.configured !== undefined) {
    console.log(`   ${results.envVars.configured ? '✅' : '❌'} 配置状态: ${results.envVars.configured ? '已配置' : '未配置'}`);
    console.log(`   🌐 API Base URL: ${results.envVars.details.API_BASE_URL}`);
    console.log(`   🔑 API Token: ${results.envVars.details.API_TOKEN}`);
  } else {
    console.log(`   ❌ 检查失败: ${results.envVars?.error || '未知错误'}`);
  }
  console.log('');
  
  // 核心功能
  console.log('🎯 核心功能:');
  if (results.features?.scrapeContent) {
    console.log(`   ${results.features.scrapeContent.status === 200 ? '✅' : '❌'} 内容抓取: ${results.features.scrapeContent.status}`);
    console.log(`   ${results.features.testConnection.status === 200 ? '✅' : '❌'} 连接测试: ${results.features.testConnection.status}`);
  } else {
    console.log(`   ❌ 检查失败: ${results.features?.error || '未知错误'}`);
  }
  console.log('');
  
  // 性能指标
  console.log('⚡ 性能指标:');
  if (results.performance?.avgResponseTime) {
    console.log(`   📊 平均响应时间: ${results.performance.avgResponseTime}ms`);
    console.log(`   ⚡ 最佳性能: ${results.performance.minResponseTime}ms`);
    console.log(`   🎯 性能评级: ${results.performance.avgResponseTime < 500 ? '优秀' : results.performance.avgResponseTime < 1000 ? '良好' : '需优化'}`);
  } else {
    console.log(`   ❌ 检查失败: ${results.performance?.error || '未知错误'}`);
  }
  console.log('');
  
  // 总体评估
  const deploymentOk = results.deployment?.status === 'success';
  const apiOk = results.api?.baseUrl?.status;
  const envOk = results.envVars?.configured;
  const featuresOk = results.features?.scrapeContent?.status;
  const performanceOk = results.performance?.avgResponseTime < 2000;
  
  const overallScore = [deploymentOk, apiOk, envOk, featuresOk, performanceOk].filter(Boolean).length;
  
  console.log('🎊 总体评估:');
  console.log(`   📊 健康评分: ${overallScore}/5`);
  console.log(`   🎯 系统状态: ${overallScore >= 4 ? '✅ 健康' : overallScore >= 3 ? '⚠️ 需要关注' : '❌ 需要修复'}`);
  
  if (!envOk) {
    console.log('\n⚠️ 重要提醒:');
    console.log('   🔧 环境变量未正确配置，这可能影响系统功能');
    console.log('   💡 建议检查Vercel环境变量设置');
  }
  
  console.log('\n✨ 检查完成！');
}

// 主函数
async function main() {
  try {
    await checkDeployment();
    await checkAPI();
    await checkEnvironmentVariables();
    await checkCoreFeatures();
    await checkPerformance();
    generateReport();
  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 运行检查
main();
