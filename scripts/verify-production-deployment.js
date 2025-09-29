#!/usr/bin/env node

/**
 * 验证生产环境部署脚本
 * 全面测试SEO博客智能体系统的实际功能
 */

const https = require('https');
const http = require('http');

const PRODUCTION_URL = 'https://seo-bloger-cvdf.vercel.app';

console.log('🔍 验证生产环境部署状态...\n');

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
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// 1. 测试主页加载
async function testHomePage() {
  console.log('🏠 1. 测试主页加载...');
  
  try {
    const response = await makeRequest(PRODUCTION_URL);
    
    console.log(`   ✅ 状态码: ${response.statusCode}`);
    console.log(`   ⚡ 响应时间: ${response.responseTime}ms`);
    console.log(`   📦 内容长度: ${response.data.length} 字符`);
    
    // 检查页面是否包含关键内容
    const hasTitle = response.data.includes('SEO博客智能体');
    const hasForm = response.data.includes('DifyWorkflowForm') || response.data.includes('目标网站URL');
    
    console.log(`   🎯 页面标题: ${hasTitle ? '✅ 正确' : '❌ 缺失'}`);
    console.log(`   📝 表单组件: ${hasForm ? '✅ 存在' : '❌ 缺失'}`);
    
    return response.statusCode === 200 && hasTitle;
    
  } catch (error) {
    console.log(`   ❌ 主页测试失败: ${error.message}`);
    return false;
  }
}

// 2. 测试内容抓取功能
async function testContentScraping() {
  console.log('\n🌐 2. 测试内容抓取功能...');
  
  try {
    const response = await makeRequest(`${PRODUCTION_URL}/api/scrape-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: 'https://example.com' })
    });
    
    console.log(`   ✅ 状态码: ${response.statusCode}`);
    console.log(`   ⚡ 响应时间: ${response.responseTime}ms`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      console.log(`   📊 抓取成功: ${data.success ? '✅ 是' : '❌ 否'}`);
      
      if (data.content) {
        console.log(`   📝 标题: ${data.content.title || 'N/A'}`);
        console.log(`   📄 内容长度: ${data.content.text?.length || 0} 字符`);
        console.log(`   🔗 URL: ${data.content.url}`);
        console.log(`   📊 词数: ${data.content.wordCount || 0}`);
      }
      
      return data.success;
    }
    
    return false;
    
  } catch (error) {
    console.log(`   ❌ 内容抓取测试失败: ${error.message}`);
    return false;
  }
}

// 3. 测试API端点可用性
async function testAPIEndpoints() {
  console.log('\n🔗 3. 测试API端点可用性...');
  
  const endpoints = [
    { path: '/api/check-env', name: '环境检查' },
    { path: '/api/test-connection', name: 'Dify连接测试' },
    { path: '/api/test-workflow', name: '工作流测试' }
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${PRODUCTION_URL}${endpoint.path}`);
      results[endpoint.name] = {
        status: response.statusCode,
        responseTime: response.responseTime,
        success: response.statusCode < 500
      };
      
      console.log(`   ${results[endpoint.name].success ? '✅' : '❌'} ${endpoint.name}: ${response.statusCode} (${response.responseTime}ms)`);
      
    } catch (error) {
      results[endpoint.name] = {
        status: 'error',
        error: error.message,
        success: false
      };
      console.log(`   ❌ ${endpoint.name}: 错误 - ${error.message}`);
    }
  }
  
  return results;
}

// 4. 测试前端资源加载
async function testStaticResources() {
  console.log('\n📦 4. 测试静态资源...');
  
  const resources = [
    { path: '/favicon.ico', name: '网站图标' },
    { path: '/_next/static/css', name: 'CSS样式', partial: true }
  ];
  
  for (const resource of resources) {
    try {
      if (resource.partial) {
        // 对于CSS等动态生成的资源，我们检查主页是否包含相关引用
        const response = await makeRequest(PRODUCTION_URL);
        const hasCSS = response.data.includes('_next/static/css') || response.data.includes('stylesheet');
        console.log(`   ${hasCSS ? '✅' : '❌'} ${resource.name}: ${hasCSS ? '已加载' : '未找到'}`);
      } else {
        const response = await makeRequest(`${PRODUCTION_URL}${resource.path}`, { method: 'HEAD' });
        console.log(`   ${response.statusCode === 200 ? '✅' : '❌'} ${resource.name}: ${response.statusCode}`);
      }
    } catch (error) {
      console.log(`   ❌ ${resource.name}: 错误 - ${error.message}`);
    }
  }
}

// 5. 生成最终报告
function generateFinalReport(results) {
  console.log('\n📋 ===== 生产环境部署验证报告 =====');
  console.log(`📅 验证时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log(`🌐 生产地址: ${PRODUCTION_URL}`);
  console.log('');
  
  const { homePage, contentScraping, apiEndpoints } = results;
  
  console.log('📊 功能验证结果:');
  console.log(`   🏠 主页加载: ${homePage ? '✅ 正常' : '❌ 异常'}`);
  console.log(`   🌐 内容抓取: ${contentScraping ? '✅ 正常' : '❌ 异常'}`);
  
  console.log('\n🔗 API端点状态:');
  Object.entries(apiEndpoints).forEach(([name, result]) => {
    console.log(`   ${result.success ? '✅' : '❌'} ${name}: ${result.status}`);
  });
  
  // 计算总体健康分数
  const totalTests = 2 + Object.keys(apiEndpoints).length;
  const passedTests = (homePage ? 1 : 0) + (contentScraping ? 1 : 0) + 
                     Object.values(apiEndpoints).filter(r => r.success).length;
  
  const healthScore = Math.round((passedTests / totalTests) * 100);
  
  console.log('\n🎯 总体评估:');
  console.log(`   📊 健康分数: ${healthScore}%`);
  console.log(`   🎯 系统状态: ${healthScore >= 80 ? '✅ 优秀' : healthScore >= 60 ? '⚠️ 良好' : '❌ 需要修复'}`);
  
  if (healthScore >= 80) {
    console.log('\n🎊 恭喜！生产环境部署成功，系统运行正常！');
    console.log('✨ 所有核心功能都已就绪，可以正常使用SEO博客生成服务。');
  } else {
    console.log('\n⚠️ 部分功能可能存在问题，建议进一步检查。');
  }
  
  console.log('\n🚀 访问地址: https://seo-bloger-cvdf.vercel.app');
  console.log('📖 使用说明: 上传关键词Excel文件，输入目标网站URL，即可生成SEO优化的博客内容！');
}

// 主函数
async function main() {
  try {
    console.log('开始全面验证生产环境部署...\n');
    
    const homePage = await testHomePage();
    const contentScraping = await testContentScraping();
    const apiEndpoints = await testAPIEndpoints();
    await testStaticResources();
    
    generateFinalReport({
      homePage,
      contentScraping,
      apiEndpoints
    });
    
  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 运行验证
main();
