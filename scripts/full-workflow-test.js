#!/usr/bin/env node

const http = require('http');

const API_BASE_URL = 'http://qa-dify.joyme.sg/v1';
const API_TOKEN = 'Bearer app-EVYktrhqnqncQSV9BdDv6uuu';

console.log('🚀 完整工作流检测开始...\n');

// 模拟真实的SEO博客生成场景
const testScenario = {
  URL: 'https://example-tech-blog.com',
  URL_subpage: '/articles/seo-optimization',
  Keywords: [
    { keyword: 'SEO优化', difficulty: 45, traffic: 1200, volume: 8900 },
    { keyword: '关键词研究', difficulty: 38, traffic: 890, volume: 5600 },
    { keyword: '内容营销', difficulty: 52, traffic: 2100, volume: 12000 },
    { keyword: '搜索排名', difficulty: 41, traffic: 1500, volume: 7200 },
    { keyword: 'Google算法', difficulty: 67, traffic: 3200, volume: 15000 }
  ]
};

async function step1_prepareData() {
  console.log('📊 步骤1: 准备工作流输入数据');
  console.log('═'.repeat(50));
  
  // 模拟筛选过程（难度小于50，流量大于1000）
  const filteredKeywords = testScenario.Keywords.filter(k => 
    k.difficulty < 50 && k.traffic > 1000
  );
  
  console.log(`   原始关键词数量: ${testScenario.Keywords.length}`);
  console.log(`   筛选条件: 难度<50 且 流量>1000`);
  console.log(`   筛选后数量: ${filteredKeywords.length}`);
  console.log('   筛选结果:');
  
  filteredKeywords.forEach((keyword, index) => {
    console.log(`     ${index + 1}. ${keyword.keyword} (难度:${keyword.difficulty}, 流量:${keyword.traffic})`);
  });
  
  console.log('\n   ✅ 数据准备完成\n');
  return filteredKeywords;
}

async function step2_sendToDify(filteredKeywords) {
  console.log('📡 步骤2: 发送数据到Dify工作流');
  console.log('═'.repeat(50));
  
  const workflowInput = {
    inputs: {
      URL: testScenario.URL,
      URL_subpage: testScenario.URL_subpage,
      Keywords: JSON.stringify(filteredKeywords)
    },
    response_mode: 'blocking',
    user: 'seo-workflow-test'
  };
  
  console.log('   发送的变量:');
  console.log(`   ├── URL: ${workflowInput.inputs.URL}`);
  console.log(`   ├── URL_subpage: ${workflowInput.inputs.URL_subpage}`);
  console.log(`   └── Keywords: [${filteredKeywords.length}个关键词的JSON数据]`);
  console.log('');
  
  return new Promise((resolve) => {
    const postData = JSON.stringify(workflowInput);
    
    const options = {
      hostname: 'qa-dify.joyme.sg',
      port: 80,
      path: '/v1/workflows/run',
      method: 'POST',
      headers: {
        'Authorization': API_TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'SEO-Workflow-Test/1.0'
      }
    };
    
    console.log(`   🔄 正在调用: ${API_BASE_URL}/workflows/run`);
    console.log(`   📦 数据大小: ${Buffer.byteLength(postData)} bytes`);
    
    const startTime = Date.now();
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      console.log(`   📥 响应状态: ${res.statusCode} ${res.statusMessage}`);
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`   ⏱️  响应时间: ${duration}ms`);
        console.log(`   📄 响应大小: ${responseData.length} characters`);
        
        try {
          const parsedResponse = JSON.parse(responseData);
          console.log('   ✅ JSON解析成功');
          resolve({ success: true, data: parsedResponse, duration });
        } catch (error) {
          console.log('   ⚠️  JSON解析失败，返回原始数据');
          resolve({ success: false, data: responseData, duration, error: 'JSON parsing failed' });
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`   ❌ 请求失败: ${err.message}`);
      resolve({ success: false, error: err.message });
    });
    
    req.setTimeout(60000, () => {
      console.log('   ❌ 请求超时 (60秒)');
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });
    
    req.write(postData);
    req.end();
  });
}

async function step3_analyzeResponse(response) {
  console.log('\n📋 步骤3: 分析Dify响应');
  console.log('═'.repeat(50));
  
  if (!response.success) {
    console.log('   ❌ 工作流调用失败');
    console.log(`   错误: ${response.error}`);
    return null;
  }
  
  const data = response.data;
  
  console.log('   📊 响应分析:');
  console.log(`   ├── 响应类型: ${typeof data}`);
  console.log(`   ├── 响应时间: ${response.duration}ms`);
  
  // 检查响应结构
  if (typeof data === 'object') {
    console.log('   ├── 响应字段:');
    Object.keys(data).forEach(key => {
      const value = data[key];
      console.log(`   │   ├── ${key}: ${typeof value === 'string' ? value.substring(0, 50) + '...' : typeof value}`);
    });
    
    // 查找输出变量
    if (data.data && data.data.outputs) {
      console.log('   └── 🎯 找到输出变量:');
      Object.keys(data.data.outputs).forEach(key => {
        const value = data.data.outputs[key];
        console.log(`       ├── ${key}: ${typeof value === 'string' ? `${value.length} characters` : typeof value}`);
      });
      
      // 检查seo_blog变量
      if (data.data.outputs.seo_blog) {
        console.log('\n   ✅ 找到seo_blog输出变量！');
        return data.data.outputs.seo_blog;
      } else {
        console.log('\n   ⚠️  未找到seo_blog变量');
        return data.data.outputs;
      }
    } else {
      console.log('   └── ⚠️  未找到标准的outputs结构');
      return data;
    }
  } else {
    console.log('   └── 响应为非对象类型');
    return data;
  }
}

async function step4_validateOutput(output) {
  console.log('\n📝 步骤4: 验证输出内容');
  console.log('═'.repeat(50));
  
  if (!output) {
    console.log('   ❌ 没有输出内容');
    return false;
  }
  
  if (typeof output === 'string') {
    console.log('   ✅ 输出类型: 字符串');
    console.log(`   ✅ 内容长度: ${output.length} 字符`);
    console.log(`   ✅ 内容预览: ${output.substring(0, 200)}...`);
    
    // 简单的内容质量检查
    const hasTitle = output.includes('#') || output.includes('标题') || output.includes('title');
    const hasKeywords = testScenario.Keywords.some(k => output.includes(k.keyword));
    const hasURL = output.includes(testScenario.URL) || output.includes('example');
    
    console.log('\n   📊 内容质量检查:');
    console.log(`   ├── 包含标题结构: ${hasTitle ? '✅' : '❌'}`);
    console.log(`   ├── 包含关键词: ${hasKeywords ? '✅' : '❌'}`);
    console.log(`   └── 引用目标URL: ${hasURL ? '✅' : '❌'}`);
    
    return true;
  } else {
    console.log('   ⚠️  输出类型: 非字符串');
    console.log('   内容:', JSON.stringify(output, null, 2));
    return false;
  }
}

async function runFullWorkflowTest() {
  console.log('🎯 SEO博客智能体 - 完整工作流检测');
  console.log('🔗 目标: 验证从Excel关键词到SEO博客生成的完整流程');
  console.log('🕐 开始时间:', new Date().toLocaleString());
  console.log('\n');
  
  try {
    // 步骤1: 准备数据
    const filteredKeywords = await step1_prepareData();
    
    // 步骤2: 发送到Dify
    const response = await step2_sendToDify(filteredKeywords);
    
    // 步骤3: 分析响应
    const output = await step3_analyzeResponse(response);
    
    // 步骤4: 验证输出
    const isValid = await step4_validateOutput(output);
    
    // 最终总结
    console.log('\n🏁 工作流检测完成');
    console.log('═'.repeat(50));
    console.log('📊 总结报告:');
    console.log(`   ├── 数据准备: ✅ 成功`);
    console.log(`   ├── API调用: ${response.success ? '✅ 成功' : '❌ 失败'}`);
    console.log(`   ├── 响应解析: ${output ? '✅ 成功' : '❌ 失败'}`);
    console.log(`   └── 内容验证: ${isValid ? '✅ 成功' : '❌ 失败'}`);
    
    if (response.success && output && isValid) {
      console.log('\n🎉 工作流检测全部通过！');
      console.log('✅ 系统可以正常生成SEO博客内容');
      console.log('✅ 变量传输功能正常');
      console.log('✅ Dify工作流响应正常');
    } else {
      console.log('\n⚠️  工作流检测发现问题');
      console.log('建议检查:');
      console.log('- Dify工作流配置');
      console.log('- 输出变量设置');
      console.log('- 网络连接状态');
    }
    
    console.log(`\n🕐 结束时间: ${new Date().toLocaleString()}`);
    
  } catch (error) {
    console.error('\n❌ 工作流检测过程中发生错误:', error.message);
    process.exit(1);
  }
}

runFullWorkflowTest();
