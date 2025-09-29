'use client'

import { useState, useEffect, useRef } from 'react'
import { KeywordData } from '@/types/dify'

interface BlogResultDisplayProps {
  content: string
  keywords: KeywordData[]
  onContentChange?: (newContent: string) => void
  onSave?: (content: string) => void
}

export default function BlogResultDisplay({ 
  content, 
  keywords, 
  onContentChange, 
  onSave 
}: BlogResultDisplayProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(content)
  const [highlightedContent, setHighlightedContent] = useState('')
  const [keywordStats, setKeywordStats] = useState<{[key: string]: number}>({})
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 关键词高亮处理
  useEffect(() => {
    if (!content || !keywords.length) {
      setHighlightedContent(content)
      return
    }

    let highlighted = content
    const stats: {[key: string]: number} = {}

    // 按关键词长度降序排列，避免短词匹配覆盖长词
    const sortedKeywords = [...keywords].sort((a, b) => b.keyword.length - a.keyword.length)

    sortedKeywords.forEach(({ keyword }) => {
      if (!keyword.trim()) return

      // 创建正则表达式，支持中英文匹配
      const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
      const matches = content.match(regex) || []
      stats[keyword] = matches.length

      if (matches.length > 0) {
        // 为每个匹配的关键词添加高亮标记
        highlighted = highlighted.replace(regex, `<mark class="bg-yellow-200 px-1 py-0.5 rounded font-medium text-yellow-800">$1</mark>`)
      }
    })

    setHighlightedContent(highlighted)
    setKeywordStats(stats)
  }, [content, keywords])

  // 处理编辑模式切换
  const handleEditToggle = () => {
    if (isEditing) {
      // 保存编辑
      onContentChange?.(editContent)
      setIsEditing(false)
    } else {
      // 进入编辑模式
      setEditContent(content)
      setIsEditing(true)
    }
  }

  // 处理保存
  const handleSave = () => {
    onSave?.(editContent)
    onContentChange?.(editContent)
    setIsEditing(false)
  }

  // 处理取消
  const handleCancel = () => {
    setEditContent(content)
    setIsEditing(false)
  }

  // 自动调整textarea高度
  useEffect(() => {
    if (textareaRef.current && isEditing) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [editContent, isEditing])

  // 获取关键词密度统计
  const getTotalKeywordMatches = () => {
    return Object.values(keywordStats).reduce((sum, count) => sum + count, 0)
  }

  const [showKeywordStats, setShowKeywordStats] = useState(false)

  return (
    <div className="space-y-6">
      {/* SEO博客内容区域 */}
      <div className="space-y-4">
        {/* 可收起的关键词匹配统计 */}
        {keywords.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowKeywordStats(!showKeywordStats)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                <h4 className="font-medium text-blue-900">关键词匹配统计</h4>
                <span className="ml-2 text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                  {Object.values(keywordStats).filter(count => count > 0).length}/{keywords.length}
                </span>
              </div>
              <svg 
                className={`w-5 h-5 text-blue-600 transition-transform duration-200 ${showKeywordStats ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showKeywordStats && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {keywords.map(({ keyword, difficulty, traffic }) => {
                    const count = keywordStats[keyword] || 0
                    const isMatched = count > 0
                    
                    return (
                      <div 
                        key={keyword}
                        className={`p-3 rounded-lg border ${
                          isMatched 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-medium ${
                            isMatched ? 'text-green-800' : 'text-gray-600'
                          }`}>
                            {keyword}
                          </span>
                          <span className={`text-sm px-2 py-1 rounded ${
                            isMatched 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {count}次
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          难度: {difficulty} | 流量: {traffic.toLocaleString()}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="text-sm text-blue-700 bg-blue-100 px-3 py-2 rounded">
                  📊 总匹配次数: <strong>{getTotalKeywordMatches()}</strong> | 
                  匹配关键词: <strong>{Object.values(keywordStats).filter(count => count > 0).length}</strong>/{keywords.length}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SEO博客内容显示/编辑区域 */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {/* 工具栏 */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {isEditing ? '编辑博客内容' : 'SEO博客结果'}
                  </h3>
                  {!isEditing && (
                    <p className="text-green-100 text-sm">
                      {content.length.toLocaleString()} 字符 | 关键词已高亮显示
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-white text-green-600 hover:bg-gray-50 text-sm rounded-lg transition-colors font-medium"
                    >
                      保存
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditToggle}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    编辑内容
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="p-6">
            {isEditing ? (
              <div className="space-y-4">
                <textarea
                  ref={textareaRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="编辑您的博客内容..."
                  style={{ minHeight: '500px' }}
                />
                
                <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
                  <span>{editContent.length.toLocaleString()} 字符</span>
                  <span>💡 Ctrl+Enter 快速保存</span>
                </div>
              </div>
            ) : (
              <div className="prose prose-lg max-w-none">
                {highlightedContent ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: highlightedContent }}
                    className="whitespace-pre-wrap leading-relaxed"
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500 italic">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    暂无内容
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 关键词密度分析 - 放在下方 */}
      {!isEditing && Object.keys(keywordStats).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
            <h4 className="font-semibold text-white flex items-center">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">关键词密度分析</h3>
                <p className="text-purple-100 text-sm">SEO优化建议和密度评估</p>
              </div>
            </h4>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {Object.entries(keywordStats)
                .filter(([_, count]) => count > 0)
                .sort(([_, a], [__, b]) => b - a)
                .map(([keyword, count]) => {
                  const density = ((count * keyword.length) / content.length * 100).toFixed(2)
                  const densityNum = parseFloat(density)
                  
                  return (
                    <div key={keyword} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors border border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-gray-900">{keyword}</span>
                        <span className="text-lg text-purple-600 font-bold">{density}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500">{count}次出现</span>
                        <div className={`text-xs px-3 py-1 rounded-full font-medium ${
                          densityNum > 3 ? 'bg-red-100 text-red-700' :
                          densityNum > 1.5 ? 'bg-green-100 text-green-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {densityNum > 3 ? '过高' : densityNum > 1.5 ? '适中' : '偏低'}
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            densityNum > 3 ? 'bg-red-500' :
                            densityNum > 1.5 ? 'bg-green-500' :
                            'bg-yellow-500'
                          }`}
                          style={{ width: `${Math.min(densityNum * 20, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
            </div>
            
            {/* 密度分析总结 */}
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h5 className="text-lg font-bold text-purple-900">SEO优化建议</h5>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="font-semibold text-purple-900 mb-2">理想密度范围</div>
                  <div className="text-purple-700">1.5% - 3.0%</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="font-semibold text-purple-900 mb-2">匹配关键词</div>
                  <div className="text-purple-700">{Object.values(keywordStats).filter(count => count > 0).length} / {keywords.length} 个</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="font-semibold text-purple-900 mb-2">总出现次数</div>
                  <div className="text-purple-700">{getTotalKeywordMatches()} 次</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

