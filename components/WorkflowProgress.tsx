'use client'

import { useState, useEffect } from 'react'
import { KeywordData } from '@/types/dify'
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationCircleIcon,
  ArrowRightIcon,
  CogIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

interface WorkflowStep {
  id: string
  title: string
  status: 'pending' | 'running' | 'completed' | 'error'
  description?: string
  data?: any
  timestamp?: Date
}

interface WorkflowProgressProps {
  isRunning: boolean
  inputData: {
    url: string
    Keywords: KeywordData[]
  } | null
  outputData: string | null
  error: string | any | null  // 支持字符串或详细错误对象
  currentStep?: string | null
  stepData?: any
  onComplete?: () => void
}

export default function WorkflowProgress({ 
  isRunning, 
  inputData, 
  outputData, 
  error,
  currentStep,
  stepData,
  onComplete 
}: WorkflowProgressProps) {
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: 'prepare',
      title: '准备输入数据',
      status: 'pending',
      description: '整理URL和筛选的关键词'
    },
    {
      id: 'scraping',
      title: '抓取网站内容',
      status: 'pending',
      description: '从目标网站提取内容并格式化'
    },
    {
      id: 'send',
      title: '发送到Dify工作流',
      status: 'pending',
      description: '将数据传输到Dify API'
    },
    {
      id: 'process',
      title: 'Dify工作流处理',
      status: 'pending',
      description: 'AI正在分析数据并生成SEO博客内容'
    },
    {
      id: 'receive',
      title: '接收输出结果',
      status: 'pending',
      description: '获取生成的seo_blog变量内容'
    }
  ])

  // 根据真实进度更新步骤状态
  useEffect(() => {
    if (!isRunning && !currentStep) {
      // 重置所有步骤状态
      setSteps(prev => prev.map(step => ({ 
        ...step, 
        status: 'pending' as const,
        timestamp: undefined,
        data: undefined
      })))
      return
    }

    if (currentStep) {
      setSteps(prev => {
        const newSteps = [...prev]
        const stepIndex = newSteps.findIndex(step => step.id === currentStep)
        
        if (stepIndex !== -1) {
          // 标记之前的步骤为完成
          for (let i = 0; i < stepIndex; i++) {
            if (newSteps[i].status !== 'completed') {
              newSteps[i].status = 'completed'
              newSteps[i].timestamp = new Date()
            }
          }
          
          // 标记当前步骤为运行中
          newSteps[stepIndex].status = 'running'
          newSteps[stepIndex].timestamp = new Date()
          newSteps[stepIndex].data = stepData
          
          // 如果是准备步骤，添加输入数据
          if (currentStep === 'prepare' && inputData) {
            newSteps[stepIndex].data = inputData
          }
        }
        
        return newSteps
      })
    }
  }, [currentStep, stepData, inputData, isRunning])

  // 处理完成和错误状态
  useEffect(() => {
    if (!isRunning && (outputData || error)) {
      setSteps(prev => {
        const newSteps = [...prev]
        
        if (error) {
          // 找到当前运行的步骤并标记为错误
          const runningStepIndex = newSteps.findIndex(step => step.status === 'running')
          if (runningStepIndex !== -1) {
            newSteps[runningStepIndex].status = 'error'
            newSteps[runningStepIndex].timestamp = new Date()
            
            // 处理详细错误信息
            if (typeof error === 'object' && error.type) {
              // 详细错误对象
              newSteps[runningStepIndex].description = `${error.type}: ${error.message}`
              newSteps[runningStepIndex].data = error  // 保存完整错误信息
            } else {
              // 简单字符串错误
              newSteps[runningStepIndex].description = typeof error === 'string' ? error : String(error)
            }
          }
        } else if (outputData) {
          // 标记所有步骤为完成
          newSteps.forEach((step, index) => {
            step.status = 'completed'
            step.timestamp = new Date()
            
            // 最后一个步骤添加输出数据
            if (index === newSteps.length - 1) {
              step.data = outputData
            }
          })
          onComplete?.()
        }
        
        return newSteps
      })
    }
  }, [isRunning, outputData, error, onComplete])

  // 重置状态
  useEffect(() => {
    if (!isRunning && !outputData && !error) {
      setSteps(prev => prev.map(step => ({ 
        ...step, 
        status: 'pending' as const,
        timestamp: undefined,
        data: undefined
      })))
    }
  }, [isRunning, outputData, error])

  const getStepIcon = (step: WorkflowStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'running':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
      case 'error':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const getStepColor = (step: WorkflowStep) => {
    switch (step.status) {
      case 'completed':
        return 'border-green-200 bg-green-50'
      case 'running':
        return 'border-blue-200 bg-blue-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <CogIcon className="h-6 w-6 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">Dify工作流进度</h3>
      </div>

      {/* 工作流步骤 */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className={`border rounded-lg p-4 ${getStepColor(step)}`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getStepIcon(step)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">
                    {step.title}
                  </h4>
                  {step.timestamp && (
                    <span className="text-xs text-gray-500">
                      {step.timestamp.toLocaleTimeString()}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mt-1">
                  {step.description}
                </p>

                {/* 显示具体数据 */}
                {step.data && step.id === 'prepare' && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <h5 className="text-xs font-medium text-gray-700 mb-2">输入到Dify的变量:</h5>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-medium text-blue-600">url:</span>
                        <span className="ml-2 text-gray-800">{step.data.url}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-600">Keywords:</span>
                        <div className="ml-2 mt-1">
                          <div className="text-gray-600">共 {step.data.Keywords.length} 个关键词:</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {step.data.Keywords.slice(0, 5).map((keyword: KeywordData, i: number) => (
                              <span key={i} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {keyword.keyword}
                              </span>
                            ))}
                            {step.data.Keywords.length > 5 && (
                              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                +{step.data.Keywords.length - 5} 更多
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 显示抓取内容数据 */}
                {step.data && step.id === 'scraping' && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <h5 className="text-xs font-medium text-gray-700 mb-2">网站内容抓取:</h5>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-medium text-green-600">URL:</span>
                        <span className="ml-2 text-gray-800">{step.data.url}</span>
                      </div>
                      {step.data.url_content && (
                        <div>
                          <span className="font-medium text-green-600">内容长度:</span>
                          <span className="ml-2 text-gray-800">{step.data.url_content.length.toLocaleString()} 字符</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 显示发送数据 */}
                {step.data && step.id === 'send' && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <h5 className="text-xs font-medium text-gray-700 mb-2">发送到Dify:</h5>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-medium text-purple-600">url_content:</span>
                        <span className="ml-2 text-gray-800">{step.data.url_content?.length.toLocaleString() || 0} 字符</span>
                      </div>
                      <div>
                        <span className="font-medium text-purple-600">Keywords:</span>
                        <span className="ml-2 text-gray-800">{step.data.Keywords?.length || 0} 个关键词</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 显示输出数据 */}
                {step.data && step.id === 'display' && typeof step.data === 'string' && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <h5 className="text-xs font-medium text-gray-700 mb-2">Dify输出变量 (seo_blog):</h5>
                    <div className="max-h-32 overflow-y-auto">
                      <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                        {step.data.substring(0, 200)}...
                      </pre>
                    </div>
                  </div>
                )}

                {/* 显示详细错误信息 */}
                {step.status === 'error' && step.data && typeof step.data === 'object' && step.data.type && (
                  <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h5 className="text-sm font-medium text-red-800 mb-3 flex items-center">
                      <ExclamationCircleIcon className="h-4 w-4 mr-2" />
                      详细错误信息
                    </h5>
                    
                    <div className="space-y-3 text-xs">
                      {/* 基本错误信息 */}
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <span className="font-medium text-red-700">错误类型:</span>
                          <span className="ml-2 text-red-900">{step.data.type}</span>
                        </div>
                        <div>
                          <span className="font-medium text-red-700">错误时间:</span>
                          <span className="ml-2 text-red-900">{step.data.timestamp}</span>
                        </div>
                        <div>
                          <span className="font-medium text-red-700">错误消息:</span>
                          <span className="ml-2 text-red-900">{step.data.message}</span>
                        </div>
                      </div>

                      {/* 原始错误 */}
                      {step.data.originalError && (
                        <div className="border-t border-red-200 pt-3">
                          <h6 className="font-medium text-red-700 mb-2">原始错误:</h6>
                          <div className="bg-red-100 p-2 rounded text-red-800">
                            <div><strong>名称:</strong> {step.data.originalError.name}</div>
                            <div><strong>消息:</strong> {step.data.originalError.message}</div>
                            {step.data.originalError.stack && (
                              <details className="mt-2">
                                <summary className="cursor-pointer font-medium">堆栈跟踪</summary>
                                <pre className="mt-1 text-xs overflow-x-auto whitespace-pre-wrap">
                                  {step.data.originalError.stack}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      )}

                      {/* HTTP响应详情 */}
                      {step.data.details && step.data.details.status && (
                        <div className="border-t border-red-200 pt-3">
                          <h6 className="font-medium text-red-700 mb-2">HTTP响应详情:</h6>
                          <div className="bg-red-100 p-2 rounded text-red-800 space-y-1">
                            <div><strong>状态码:</strong> {step.data.details.status}</div>
                            <div><strong>状态文本:</strong> {step.data.details.statusText}</div>
                            {step.data.details.config && (
                              <div><strong>请求URL:</strong> {step.data.details.config.url}</div>
                            )}
                            {step.data.details.config && (
                              <div><strong>超时设置:</strong> {step.data.details.config.timeout}ms</div>
                            )}
                            {step.data.details.data && (
                              <details className="mt-2">
                                <summary className="cursor-pointer font-medium">响应数据</summary>
                                <pre className="mt-1 text-xs overflow-x-auto whitespace-pre-wrap">
                                  {JSON.stringify(step.data.details.data, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 网络请求详情 */}
                      {step.data.details && step.data.details.request && (
                        <div className="border-t border-red-200 pt-3">
                          <h6 className="font-medium text-red-700 mb-2">网络请求详情:</h6>
                          <div className="bg-red-100 p-2 rounded text-red-800 space-y-1">
                            <div><strong>状态:</strong> {step.data.details.request}</div>
                            {step.data.details.url && (
                              <div><strong>目标URL:</strong> {step.data.details.url}</div>
                            )}
                            {step.data.details.timeout && (
                              <div><strong>超时设置:</strong> {step.data.details.timeout}ms</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 连接线 */}
            {index < steps.length - 1 && (
              <div className="flex justify-center mt-4">
                <ArrowRightIcon className="h-4 w-4 text-gray-400 transform rotate-90" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 总体状态 */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DocumentTextIcon className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-600">工作流状态:</span>
          </div>
          <div className="flex items-center space-x-2">
            {isRunning && (
              <>
                <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-blue-600 font-medium">运行中...</span>
              </>
            )}
            {outputData && !isRunning && (
              <>
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">完成</span>
              </>
            )}
            {error && !isRunning && (
              <>
                <ExclamationCircleIcon className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600 font-medium">错误</span>
              </>
            )}
            {!isRunning && !outputData && !error && (
              <span className="text-sm text-gray-500">等待启动</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
