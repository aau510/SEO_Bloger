'use client'

import { useState } from 'react'
import { KeywordData, KeywordFilter, WordPressConfig } from '@/types/dify'
import { parseKeywordsFromExcel, filterKeywords, generateSEOBlogWithDify, generateSEOBlogWithDifyDirect, generateSEOBlogWithDifyStream, analyzeUrl, generateAndPublishToWordPress } from '@/lib/dify-api'
import { processWordPressWorkflow } from '@/lib/wordpress-local'
import KeywordFilterComponent from './KeywordFilter'
import WorkflowProgress from './WorkflowProgress'
import BlogResultDisplay from './BlogResultDisplay'
import { 
  DocumentArrowUpIcon,
  GlobeAltIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import ExcelSampleDownload from './ExcelSampleDownload'

interface DifyWorkflowFormProps {
  onBlogGenerated: (blog: string) => void
}

export default function DifyWorkflowForm({ onBlogGenerated }: DifyWorkflowFormProps) {
  const [formData, setFormData] = useState({
    url: '',
    keyword: '',                    // 新增：单个关键词输入
    keywordsFile: null as File | null
  })
  
  const [keywords, setKeywords] = useState<KeywordData[]>([])
  const [filteredKeywords, setFilteredKeywords] = useState<KeywordData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [workflowProgress, setWorkflowProgress] = useState({
    isRunning: false,
    inputData: null as any,
    outputData: null as string | null,
    error: null as string | null,
    currentStep: null as string | null,
    stepData: null as any
  })
  const [useStreaming, setUseStreaming] = useState(false)
  const [connectionMode, setConnectionMode] = useState<'proxy' | 'direct'>('proxy') // 连接方式选择
  const [generatedBlog, setGeneratedBlog] = useState<string>('')
  
  // WordPress发布配置
  const [wordpressConfig, setWordpressConfig] = useState<WordPressConfig>({
    enabled: false,
    templateUrl: 'https://imastudio.com/sora-2-video-generator',
    siteUrl: 'https://imastudio.com',
    username: 'qiaoyu',
    appPassword: 'eecY1C2G8Uf2u3XyPhTclHx8'
  })

  // 处理文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setIsLoading(true)

    try {
      // 验证文件类型
      if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
        throw new Error('请上传Excel文件 (.xlsx, .xls) 或CSV文件')
      }

      setFormData(prev => ({ ...prev, keywordsFile: file }))
      
      // 解析关键词
      const parsedKeywords = await parseKeywordsFromExcel(file)
      setKeywords(parsedKeywords)
      setFilteredKeywords(parsedKeywords)
      setCurrentStep(2)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件解析失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 处理关键词筛选
  const handleKeywordFilter = (filtered: KeywordData[]) => {
    setFilteredKeywords(filtered)
  }

  // 生成SEO博客
  const handleGenerateBlog = async () => {
    // 检查输入条件：URL和关键词必填，文件上传可选
    if (!formData.url) {
      setError('请填写目标网站URL')
      return
    }
    
    if (!formData.keyword.trim()) {
      setError('请输入目标关键词')
      return
    }

    setIsLoading(true)
    setError(null)
    
    // 准备工作流输入数据 - 匹配Dify工作流的输入变量
    const inputData: any = {
      url: formData.url,
      Keywords: formData.keyword.trim() // 单个关键词 - 必填（注意是复数）
    }
    
    // 如果有文件上传的关键词，添加Keyword_list
    if (filteredKeywords.length > 0) {
      inputData.Keyword_list = filteredKeywords
    }
    
    setWorkflowProgress({
      isRunning: true,
      inputData,
      outputData: null,
      error: null,
      currentStep: null,
      stepData: null
    })

    try {
      let blog = ''
      
      console.log('📊 表单数据:', {
        url: formData.url,
        keyword: formData.keyword,
        keywordLength: formData.keyword.length,
        useStreaming,
        connectionMode,
        wordpressEnabled: wordpressConfig.enabled
      })
      
        // 判断是否启用WordPress发布
        if (wordpressConfig.enabled) {
          console.log('🔄 使用WordPress集成工作流')
          
          // 调用WordPress工作流
          const wpResult = await generateAndPublishToWordPress(
            formData.url,
            formData.keyword.trim(),
            wordpressConfig.templateUrl,
            (step, data) => {
              console.log('WordPress工作流步骤:', step, data)
              setWorkflowProgress(prev => ({
                ...prev,
                currentStep: step,
                stepData: data
              }))
            }
          )
          
          // 处理WordPress发布结果
          console.log('📦 WordPress工作流返回:', wpResult)
          
          // 检查success字段（Dify返回的是字符串 "true" 或 "false"）
          const isSuccess = wpResult.success === 'true'
          
          if (isSuccess && wpResult.post_url) {
            // 发布成功
            setWorkflowProgress({
              isRunning: false,
              inputData,
              outputData: null,
              error: null,
              currentStep: 'wordpress_published',
              stepData: {
                success: true,
                message: '文章已成功发布到WordPress！',
                post_url: wpResult.post_url,
                details: wpResult
              }
            })
            
            console.log('✅ WordPress发布成功!')
            console.log('📍 文章链接:', wpResult.post_url)
            setCurrentStep(4)
            return // 直接返回，不继续执行后续的博客内容设置
          } else {
            // 发布失败
            const errorMsg = wpResult.error || 'WordPress发布失败，未返回文章链接'
            console.error('❌ WordPress发布失败:', errorMsg)
            throw new Error(errorMsg)
          }
        }
        
        // 未启用WordPress时，生成博客内容
        console.log('🔄 开始生成博客内容')
        console.log('   使用流式API:', useStreaming)
        console.log('   关键词:', formData.keyword)
        
        if (useStreaming) {
        // 关键词输入参数 - 单个关键词用字符串
        const keywordInput = formData.keyword.trim()
        
        console.log('📤 调用流式API...')
        
        // 使用流式API，传递主关键词和可选的关键词列表
        blog = await generateSEOBlogWithDifyStream(
          formData.url,
          keywordInput,
          (step, data) => {
            console.log('工作流步骤:', step, data)
            // 更新真实进度
            setWorkflowProgress(prev => ({
              ...prev,
              currentStep: step,
              stepData: data
            }))
          },
          (chunk) => {
            // 实时显示流式输出
            console.log('📝 收到内容块:', chunk.substring(0, 50))
            setWorkflowProgress(prev => ({
              ...prev,
              outputData: (prev.outputData || '') + chunk
            }))
          },
          filteredKeywords.length > 0 ? filteredKeywords : undefined
        )
        
        console.log('✅ 流式API返回完成')
        console.log('   内容长度:', blog?.length || 0)
      } else {
        // 关键词输入参数 - 单个关键词用字符串
        const keywordInput = formData.keyword.trim()
        console.log('🔍 关键词输入:', keywordInput, '长度:', keywordInput.length)
        
        // 根据连接方式选择API
        if (connectionMode === 'direct') {
          console.log('🔗 使用直接连接模式')
          blog = await generateSEOBlogWithDifyDirect(
            formData.url,
            keywordInput,
            (step, data) => {
              console.log('直接连接工作流步骤:', step, data)
              // 更新真实进度
              setWorkflowProgress(prev => ({
                ...prev,
                currentStep: step,
                stepData: data
              }))
            },
            filteredKeywords.length > 0 ? filteredKeywords : undefined
          )
        } else {
          console.log('🔄 使用代理连接模式')
          blog = await generateSEOBlogWithDify(
            formData.url,
            keywordInput,
            (step, data) => {
              console.log('代理连接工作流步骤:', step, data)
              // 更新真实进度
              setWorkflowProgress(prev => ({
                ...prev,
                currentStep: step,
                stepData: data
              }))
            },
            filteredKeywords.length > 0 ? filteredKeywords : undefined
          )
        }
      }
      
      // 未启用WordPress时，设置生成的博客内容
      console.log('🎯 设置生成的博客内容')
      console.log('   内容长度:', blog?.length || 0)
      console.log('   内容预览:', blog?.substring(0, 100))
      
      setWorkflowProgress({
        isRunning: false,
        inputData,
        outputData: blog,
        error: null,
        currentStep: 'complete',
        stepData: null
      })
      
      console.log('💾 保存到state...')
      setGeneratedBlog(blog)
      onBlogGenerated(blog)
      setCurrentStep(4)
      
      console.log('✅ 博客内容设置完成，currentStep:', 4)
      
    } catch (err) {
      console.error('博客生成失败:', err)
      
      // 提取详细错误信息
      let errorInfo: any = '博客生成失败'
      
      if (err instanceof Error) {
        errorInfo = err.message
        
        // 如果是增强的错误对象，使用详细错误信息
        if ('detailedError' in err && (err as any).detailedError) {
          errorInfo = (err as any).detailedError
        }
      }
      
      setError(typeof errorInfo === 'string' ? errorInfo : errorInfo.message || '博客生成失败')
      setWorkflowProgress(prev => ({
        ...prev,
        isRunning: false,
        error: errorInfo  // 传递完整的错误信息（可能是字符串或对象）
      }))
    } finally {
      setIsLoading(false)
    }
  }

  // 重置表单
  const resetForm = () => {
    setFormData({ url: '', keyword: '', keywordsFile: null })
    setKeywords([])
    setFilteredKeywords([])
    setCurrentStep(1)
    setError(null)
    setGeneratedBlog('')
    setWordpressConfig(prev => ({ ...prev, enabled: false }))
    setWorkflowProgress({
      isRunning: false,
      inputData: null,
      outputData: null,
      error: null,
      currentStep: null,
      stepData: null
    })
  }

  // 处理博客内容变更
  const handleBlogContentChange = (newContent: string) => {
    setGeneratedBlog(newContent)
    setWorkflowProgress(prev => ({
      ...prev,
      outputData: newContent
    }))
  }

  // 处理博客保存
  const handleBlogSave = (content: string) => {
    // 这里可以添加保存到本地存储或服务器的逻辑
    console.log('保存博客内容:', content.length, '字符')
    
    // 创建下载链接
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `seo-blog-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }


  return (
    <div className="space-y-6">
      {/* 进度指示器 - 3步流程 */}
      <div className="flex items-center justify-between">
        {[1, 3, 4].map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step <= currentStep 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {step < currentStep ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : (
                index + 1
              )}
            </div>
            {index < 2 && (
              <div className={`w-16 h-1 mx-2 ${
                step < currentStep ? 'bg-primary-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-600">
        <span className="font-medium">
          {currentStep === 1 && '📝 输入URL和关键词'}
          {currentStep === 3 && '✨ AI生成SEO优化博客'}
          {currentStep === 4 && '✅ 生成完成，可编辑和导出'}
        </span>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-800">错误</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* 步骤1: 基本信息输入 */}
      {currentStep === 1 && (
        <div className="card">
          <div className="flex items-center space-x-2 mb-6">
            <GlobeAltIcon className="h-6 w-6 text-primary-600" />
            <h3 className="text-xl font-bold text-gray-900">输入基本信息</h3>
          </div>

          <div className="space-y-6">
            {/* URL输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                目标网站URL *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://www.liveme.com/1v1chat"
                className="input-field"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                系统将自动抓取该网站的内容，并结合关键词生成SEO博客
              </p>
            </div>

            {/* 关键词输入 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-3">关键词输入</h4>
              <div className="space-y-4">
                {/* 单个关键词输入 - 必填 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    目标关键词 *
                  </label>
                  <input
                    type="text"
                    value={formData.keyword}
                    onChange={(e) => setFormData(prev => ({ ...prev, keyword: e.target.value }))}
                    placeholder="例如：AI video generator"
                    className="input-field"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 输入目标关键词，系统将自动进行竞品调研前5名
                  </p>
                </div>

                <div className="flex items-center">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-3 text-xs text-gray-500 bg-blue-50">同时可选</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* 文件上传 - 可选 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    补充关键词文件（可选）
                  </label>
                  <p className="text-xs text-gray-500">
                    可选择上传Excel文件补充更多关键词进行筛选和生成
                  </p>
                </div>
              </div>
            </div>

            {/* 关键词文件上传 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                关键词Excel文件（可选）
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
                <div className="space-y-1 text-center">
                  <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                      <span>上传文件</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        disabled={isLoading}
                      />
                    </label>
                    <p className="pl-1">或拖拽到此处</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    支持 XLSX, XLS, CSV 格式
                  </p>
                </div>
              </div>
              {formData.keywordsFile && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-green-700 font-medium">
                        已选择: {formData.keywordsFile.name}
                      </span>
                    </div>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      {keywords.length} 个关键词
                    </span>
                  </div>
                  {keywords.length > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      ✅ 文件解析成功，可以进入下一步进行筛选
                    </p>
                  )}
                </div>
              )}
              
              {/* 示例文件下载 */}
              <div className="mt-4">
                <ExcelSampleDownload />
              </div>
            </div>

            {/* 操作提示 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">💡</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">操作提示</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• 必须填写URL和目标关键词才能继续</li>
                    <li>• 关键词文件是可选的，用于补充更多关键词</li>
                    <li>• 上传文件后会自动进入关键词确认步骤</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 手动进入下一步按钮 - 直接跳到步骤3 */}
            {formData.url.trim() && formData.keyword.trim() && (
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="btn-primary"
                >
                  下一步：生成博客
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 步骤2: 关键词确认和筛选 - 已隐藏 */}
      {false && currentStep === 2 && formData.keyword.trim() && (
        <div className="space-y-6">
          {/* URL输入区域 - 在步骤2中也显示 */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <GlobeAltIcon className="h-5 w-5 text-primary-600" />
              <h4 className="text-lg font-semibold text-gray-900">目标网站URL</h4>
              {!formData.url && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                  必填
                </span>
              )}
            </div>
            
            <div>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://www.liveme.com/1v1chat"
                className={`input-field ${!formData.url ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                系统将自动抓取该网站的内容，并结合筛选的关键词生成SEO博客
              </p>
              {!formData.url && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ 请填写目标网站URL才能继续下一步
                </p>
              )}
            </div>
          </div>

          {/* 目标关键词显示 */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <SparklesIcon className="h-5 w-5 text-primary-600" />
              <h4 className="text-lg font-semibold text-gray-900">目标关键词</h4>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-blue-900">主要关键词:</span>
                <span className="text-sm text-blue-800 bg-blue-100 px-2 py-1 rounded">
                  {formData.keyword}
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                💡 系统将以此关键词为主进行竞品调研和内容生成
              </p>
            </div>
          </div>

          {/* 补充关键词筛选 - 仅在有文件上传时显示 */}
          {keywords.length > 0 && (
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <DocumentTextIcon className="h-5 w-5 text-green-600" />
                <h4 className="text-lg font-semibold text-gray-900">补充关键词筛选</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                从上传的文件中筛选补充关键词，与目标关键词一起使用
              </p>
              <KeywordFilterComponent
                keywords={keywords}
                onFilterChange={handleKeywordFilter}
                isLoading={isLoading}
              />
            </div>
          )}
          
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentStep(1)}
              className="btn-secondary"
            >
              上一步
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={!formData.keyword.trim() || !formData.url.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一步 (主关键词: {formData.keyword}{keywords.length > 0 ? ` + ${filteredKeywords.length} 个补充关键词` : ''})
            </button>
          </div>
        </div>
      )}

      {/* 步骤3: 生成确认 */}
      {currentStep === 3 && (
        <div className="card">
          <div className="flex items-center space-x-2 mb-6">
            <SparklesIcon className="h-6 w-6 text-primary-600" />
            <h3 className="text-xl font-bold text-gray-900">生成SEO博客</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">生成参数确认</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>目标URL:</strong> {formData.url}</p>
                <p><strong>内容抓取:</strong> 将自动抓取网站内容</p>
                <p><strong>主要关键词:</strong> {formData.keyword}</p>
                {filteredKeywords.length > 0 && (
                  <>
                    <p><strong>补充关键词:</strong> {filteredKeywords.length} 个</p>
                    <p><strong>平均难度:</strong> {Math.round(filteredKeywords.reduce((sum, k) => sum + k.difficulty, 0) / filteredKeywords.length)}</p>
                    <p><strong>总流量:</strong> {filteredKeywords.reduce((sum, k) => sum + k.traffic, 0).toLocaleString()}</p>
                  </>
                )}
              </div>
            </div>

            {/* 流式输出选项 - 已隐藏 */}
            {/* <div className="flex items-center">
              <input
                type="checkbox"
                id="useStreaming"
                checked={useStreaming}
                onChange={(e) => setUseStreaming(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="useStreaming" className="ml-2 text-sm text-gray-700">
                启用流式输出（实时显示生成过程）
              </label>
            </div> */}

            {/* 连接方式选择 - 已隐藏，默认使用代理模式 */}
            {/* <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-3">连接方式选择</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="proxy-mode"
                    name="connectionMode"
                    value="proxy"
                    checked={connectionMode === 'proxy'}
                    onChange={(e) => setConnectionMode(e.target.value as 'proxy' | 'direct')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <label htmlFor="proxy-mode" className="ml-2 text-sm text-blue-800">
                    <span className="font-medium">代理连接</span> - 通过Netlify Functions（推荐，解决跨域问题）
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="direct-mode"
                    name="connectionMode"
                    value="direct"
                    checked={connectionMode === 'direct'}
                    onChange={(e) => setConnectionMode(e.target.value as 'proxy' | 'direct')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <label htmlFor="direct-mode" className="ml-2 text-sm text-blue-800">
                    <span className="font-medium">直接连接</span> - 绕过代理直接连接Dify API（本地开发用）
                  </label>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                💡 生产环境建议使用代理连接，本地开发可以尝试直接连接
              </p>
            </div> */}

            {/* WordPress发布配置 */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-green-900">WordPress自动发布</h4>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="wordpress-enabled"
                    checked={wordpressConfig.enabled}
                    onChange={(e) => setWordpressConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="wordpress-enabled" className="ml-2 text-sm text-green-800">
                    启用WordPress发布
                  </label>
                </div>
              </div>
              
              {wordpressConfig.enabled && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-green-800 mb-1">
                      模板页面URL
                    </label>
                    <input
                      type="url"
                      value={wordpressConfig.templateUrl}
                      onChange={(e) => setWordpressConfig(prev => ({ ...prev, templateUrl: e.target.value }))}
                      placeholder="https://imastudio.com/sora-2-video-generator"
                      className="w-full px-3 py-2 text-xs border border-green-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                    <p className="text-xs text-green-600 mt-1">
                      系统将根据此模板页面的样式和结构生成WordPress文章
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-green-800 mb-1">
                        WordPress站点
                      </label>
                      <input
                        type="url"
                        value={wordpressConfig.siteUrl}
                        onChange={(e) => setWordpressConfig(prev => ({ ...prev, siteUrl: e.target.value }))}
                        className="w-full px-3 py-2 text-xs border border-green-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-green-800 mb-1">
                        用户名
                      </label>
                      <input
                        type="text"
                        value={wordpressConfig.username}
                        onChange={(e) => setWordpressConfig(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full px-3 py-2 text-xs border border-green-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div className="bg-green-100 p-3 rounded border border-green-200">
                    <p className="text-xs text-green-700">
                      ✅ 已配置WordPress发布参数，生成完成后将自动发布到WordPress
                    </p>
                  </div>
                </div>
              )}
              
              {!wordpressConfig.enabled && (
                <p className="text-xs text-green-600">
                  勾选启用后，系统将在生成博客内容后自动匹配模板并发布到WordPress
                </p>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="btn-secondary"
              >
                上一步
              </button>
              <button
                onClick={handleGenerateBlog}
                disabled={isLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>生成中...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4" />
                    <span>生成SEO博客</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 步骤4: 完成 */}
      {currentStep === 4 && (
        <div className="space-y-6">
          {/* 工作流进度显示 - 已隐藏 */}
          {/* <div className="card">
                    <WorkflowProgress
                      isRunning={workflowProgress.isRunning}
                      inputData={workflowProgress.inputData}
                      outputData={workflowProgress.outputData}
                      error={workflowProgress.error}
                      currentStep={workflowProgress.currentStep}
                      stepData={workflowProgress.stepData}
                      onComplete={() => {
                        console.log('工作流完成')
                      }}
                    />
          </div> */}

          {/* WordPress发布结果 */}
          {!workflowProgress.isRunning && workflowProgress.currentStep === 'wordpress_published' && workflowProgress.stepData?.success && (
            <div className="card">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-green-900 mb-2">
                      ✅ WordPress Article Published Successfully
                    </h4>
                    <p className="text-sm text-green-700 mb-4">
                      {workflowProgress.stepData.message}
                    </p>
                    
                    {workflowProgress.stepData.post_url && (
                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <p className="text-xs text-gray-500 mb-1">Article URL:</p>
                          <p className="text-sm font-mono text-gray-700 break-all">
                            {workflowProgress.stepData.post_url}
                          </p>
                        </div>
                        
                        <div className="flex gap-3">
                          <a 
                            href={workflowProgress.stepData.post_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                          >
                            🔗 View Published Article
                          </a>
                          
                          <a 
                            href={workflowProgress.stepData.post_url.replace('/?page_id=', '/wp-admin/post.php?post=').replace(/\?page_id=(\d+)/, '/wp-admin/post.php?post=$1&action=edit')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                          >
                            ✏️ Edit in WordPress
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 博客结果显示和编辑 */}
          {!workflowProgress.isRunning && workflowProgress.outputData && (
            <BlogResultDisplay
              content={workflowProgress.outputData}
              keywords={filteredKeywords}
              onContentChange={(newContent) => {
                setGeneratedBlog(newContent)
                setWorkflowProgress(prev => ({
                  ...prev,
                  outputData: newContent
                }))
              }}
              onSave={(content) => {
                console.log('保存博客内容:', content.length, '字符')
                
                // 创建下载链接
                const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `seo-blog-${new Date().toISOString().slice(0, 10)}.txt`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
              }}
            />
          )}

          {/* 完成状态 - 重新生成按钮 */}
          {!workflowProgress.isRunning && workflowProgress.outputData && (
            <div className="card text-center">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">博客生成完成！</h3>
              <p className="text-gray-600 mb-6">
                基于 {filteredKeywords.length} 个筛选关键词，已成功生成SEO优化博客内容。
              </p>
              <button
                onClick={resetForm}
                className="btn-primary"
              >
                生成新博客
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
