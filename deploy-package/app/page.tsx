'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import DifyWorkflowForm from '@/components/DifyWorkflowForm'
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  GlobeAltIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline'

export default function Home() {
  const [generatedBlog, setGeneratedBlog] = useState<string>('')

  const handleBlogGenerated = (blog: string) => {
    setGeneratedBlog(blog)
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6 py-12">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
              <SparklesIcon className="h-4 w-4 mr-2" />
              AI驱动的SEO内容生成
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-tight">
              SEO博客智能体
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              基于Dify工作流的智能SEO博客生成系统。上传关键词Excel文件，智能筛选高价值关键词，生成优质SEO博客内容。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <div className="flex items-center text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                实时内容抓取
              </div>
              <div className="flex items-center text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                智能关键词高亮
              </div>
              <div className="flex items-center text-gray-600">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                可视化编辑器
              </div>
            </div>
          </div>

          {/* 功能特色 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-blue-200">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-bl-3xl"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <GlobeAltIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">智能抓取</h3>
                <p className="text-gray-600 text-sm leading-relaxed">深度分析目标网站内容，提取核心信息和结构化数据</p>
              </div>
            </div>
            
            <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-green-200">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-green-600/20 rounded-bl-3xl"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <DocumentTextIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Excel解析</h3>
                <p className="text-gray-600 text-sm leading-relaxed">智能识别Excel文件格式，自动解析关键词数据</p>
              </div>
            </div>
            
            <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-yellow-200">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-500/10 to-yellow-600/20 rounded-bl-3xl"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">智能筛选</h3>
                <p className="text-gray-600 text-sm leading-relaxed">基于难度和流量双重维度，筛选最优关键词组合</p>
              </div>
            </div>
            
            <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-purple-200">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-purple-600/20 rounded-bl-3xl"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">AI生成</h3>
                <p className="text-gray-600 text-sm leading-relaxed">基于Dify工作流，生成SEO优化的高质量博客内容</p>
              </div>
            </div>
          </div>

          {/* 工作流表单 - 全宽度显示 */}
          <div className="max-w-4xl mx-auto">
            <DifyWorkflowForm onBlogGenerated={handleBlogGenerated} />
          </div>
        </div>
      </main>
    </div>
  )
}
