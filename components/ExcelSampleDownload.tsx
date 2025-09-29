'use client'

import { useState } from 'react'
import { generateSampleExcel } from '@/lib/excel-sample'
import { DocumentArrowDownIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

export default function ExcelSampleDownload() {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownloadSample = async () => {
    setIsGenerating(true)
    try {
      const blob = await generateSampleExcel()
      
      // 创建下载链接
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `关键词模板_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // 清理URL对象
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('生成示例文件失败:', error)
      alert('生成示例文件失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <InformationCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            需要Excel模板？
          </h4>
          <p className="text-sm text-blue-700 mb-3">
            下载我们的示例Excel文件，了解正确的数据格式。文件包含关键词、难度、流量等必要列。
          </p>
          <button
            onClick={handleDownloadSample}
            disabled={isGenerating}
            className="inline-flex items-center space-x-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>生成中...</span>
              </>
            ) : (
              <>
                <DocumentArrowDownIcon className="h-4 w-4" />
                <span>下载示例Excel</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
