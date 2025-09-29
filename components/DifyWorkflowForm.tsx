'use client'

import { useState } from 'react'
import { KeywordData, KeywordFilter } from '@/types/dify'
import { parseKeywordsFromExcel, filterKeywords, generateSEOBlogWithDify, generateSEOBlogWithDifyDirect, generateSEOBlogWithDifyStream, analyzeUrl } from '@/lib/dify-api'
import KeywordFilterComponent from './KeywordFilter'
import WorkflowProgress from './WorkflowProgress'
import BlogResultDisplay from './BlogResultDisplay'
import { 
  DocumentArrowUpIcon,
  GlobeAltIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import ExcelSampleDownload from './ExcelSampleDownload'

interface DifyWorkflowFormProps {
  onBlogGenerated: (blog: string) => void
}

export default function DifyWorkflowForm({ onBlogGenerated }: DifyWorkflowFormProps) {
  const [formData, setFormData] = useState({
    url: '',
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
    if (!formData.url || filteredKeywords.length === 0) {
      setError('请确保填写了URL并筛选了关键词')
      return
    }

    setIsLoading(true)
    setError(null)
    
    // 准备工作流输入数据
    const inputData = {
      url: formData.url,
      Keywords: filteredKeywords
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
      
      if (useStreaming) {
        // 使用流式API
        blog = await generateSEOBlogWithDifyStream(
          formData.url,
          filteredKeywords,
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
            setWorkflowProgress(prev => ({
              ...prev,
              outputData: (prev.outputData || '') + chunk
            }))
          }
        )
      } else {
        // 根据连接方式选择API
        if (connectionMode === 'direct') {
          console.log('🔗 使用直接连接模式')
          blog = await generateSEOBlogWithDifyDirect(
            formData.url,
            filteredKeywords,
            (step, data) => {
              console.log('直接连接工作流步骤:', step, data)
              // 更新真实进度
              setWorkflowProgress(prev => ({
                ...prev,
                currentStep: step,
                stepData: data
              }))
            }
          )
        } else {
          console.log('🔄 使用代理连接模式')
          blog = await generateSEOBlogWithDify(
            formData.url,
            filteredKeywords,
            (step, data) => {
              console.log('代理连接工作流步骤:', step, data)
              // 更新真实进度
              setWorkflowProgress(prev => ({
                ...prev,
                currentStep: step,
                stepData: data
              }))
            }
          )
        }
      }
      
      setWorkflowProgress(prev => ({
        ...prev,
        isRunning: false,
        outputData: blog
      }))
      
      setGeneratedBlog(blog)
      onBlogGenerated(blog)
      setCurrentStep(4)
      
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
    setFormData({ url: '', keywordsFile: null })
    setKeywords([])
    setFilteredKeywords([])
    setCurrentStep(1)
    setError(null)
    setGeneratedBlog('')
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
      {/* 进度指示器 */}
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step <= currentStep 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {step < currentStep ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : (
                step
              )}
            </div>
            {step < 4 && (
              <div className={`w-16 h-1 mx-2 ${
                step < currentStep ? 'bg-primary-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-600">
        <span className="font-medium">
          {currentStep === 1 && '输入基本信息'}
          {currentStep === 2 && '筛选关键词'}
          {currentStep === 3 && '生成博客'}
          {currentStep === 4 && '完成'}
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

            {/* 关键词文件上传 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                关键词Excel文件 *
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
                    <li>• 您可以按任意顺序填写URL和上传文件</li>
                    <li>• 上传文件后会自动进入关键词筛选步骤</li>
                    <li>• 如果忘记填写URL，可以在筛选步骤中补充</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 步骤2: 关键词筛选 */}
      {currentStep === 2 && keywords.length > 0 && (
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

          {/* 关键词筛选组件 */}
          <KeywordFilterComponent
            keywords={keywords}
            onFilterChange={handleKeywordFilter}
            isLoading={isLoading}
          />
          
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentStep(1)}
              className="btn-secondary"
            >
              上一步
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={filteredKeywords.length === 0 || !formData.url.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一步 ({filteredKeywords.length} 个关键词)
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
                <p><strong>筛选关键词:</strong> {filteredKeywords.length} 个</p>
                <p><strong>平均难度:</strong> {Math.round(filteredKeywords.reduce((sum, k) => sum + k.difficulty, 0) / filteredKeywords.length)}</p>
                <p><strong>总流量:</strong> {filteredKeywords.reduce((sum, k) => sum + k.traffic, 0).toLocaleString()}</p>
              </div>
            </div>

            {/* 流式输出选项 */}
            <div className="flex items-center">
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
            </div>

            {/* 连接方式选择 */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
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
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="btn-secondary"
              >
                返回筛选
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
          {/* 工作流进度显示 */}
          <div className="card">
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
          </div>

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
