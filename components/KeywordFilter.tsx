'use client'

import { useState, useEffect } from 'react'
import { KeywordData, KeywordFilter as FilterType } from '@/types/dify'
import { 
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  ChartBarIcon,
  BoltIcon
} from '@heroicons/react/24/outline'

interface KeywordFilterProps {
  keywords: KeywordData[]
  onFilterChange: (filteredKeywords: KeywordData[]) => void
  isLoading?: boolean
}

export default function KeywordFilter({ keywords, onFilterChange, isLoading }: KeywordFilterProps) {
  const [filter, setFilter] = useState<FilterType>({
    maxDifficulty: 60,
    minTraffic: 1000
  })
  
  const [showAdvanced, setShowAdvanced] = useState(false)

  // 计算筛选后的关键词
  const filteredKeywords = keywords.filter(keyword => 
    keyword.difficulty <= filter.maxDifficulty && 
    keyword.traffic >= filter.minTraffic
  )

  // 在组件初始化和关键词变化时自动应用默认筛选
  useEffect(() => {
    if (keywords.length > 0) {
      const filtered = keywords.filter(keyword => 
        keyword.difficulty <= filter.maxDifficulty && 
        keyword.traffic >= filter.minTraffic
      )
      onFilterChange(filtered)
    }
  }, [keywords, filter.maxDifficulty, filter.minTraffic, onFilterChange])

  // 更新筛选条件
  const updateFilter = (newFilter: Partial<FilterType>) => {
    const updatedFilter = { ...filter, ...newFilter }
    setFilter(updatedFilter)
    
    const filtered = keywords.filter(keyword => 
      keyword.difficulty <= updatedFilter.maxDifficulty && 
      keyword.traffic >= updatedFilter.minTraffic
    )
    
    onFilterChange(filtered)
  }

  // 获取统计信息
  const stats = {
    total: keywords.length,
    filtered: filteredKeywords.length,
    avgDifficulty: filteredKeywords.length > 0 
      ? Math.round(filteredKeywords.reduce((sum, k) => sum + k.difficulty, 0) / filteredKeywords.length)
      : 0,
    totalTraffic: filteredKeywords.reduce((sum, k) => sum + k.traffic, 0)
  }

  return (
    <div className="space-y-6">
      {/* 筛选控制面板 */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">关键词筛选</h3>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
            <span>{showAdvanced ? '简单模式' : '高级设置'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 难度筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BoltIcon className="h-4 w-4 inline mr-1" />
              最大难度: {filter.maxDifficulty}
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={filter.maxDifficulty}
              onChange={(e) => updateFilter({ maxDifficulty: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              disabled={isLoading}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>简单 (1)</span>
              <span>困难 (100)</span>
            </div>
          </div>

          {/* 流量筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ChartBarIcon className="h-4 w-4 inline mr-1" />
              最小流量: {filter.minTraffic.toLocaleString()}
            </label>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={filter.minTraffic}
              onChange={(e) => updateFilter({ minTraffic: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              disabled={isLoading}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>10,000+</span>
            </div>
          </div>
        </div>

        {/* 高级设置 */}
        {showAdvanced && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  精确难度值
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={filter.maxDifficulty}
                  onChange={(e) => updateFilter({ maxDifficulty: parseInt(e.target.value) || 60 })}
                  className="input-field"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  精确流量值
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={filter.minTraffic}
                  onChange={(e) => updateFilter({ minTraffic: parseInt(e.target.value) || 1000 })}
                  className="input-field"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-blue-800">总关键词</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.filtered}</div>
          <div className="text-sm text-green-800">筛选结果</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{stats.avgDifficulty}</div>
          <div className="text-sm text-yellow-800">平均难度</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.totalTraffic.toLocaleString()}</div>
          <div className="text-sm text-purple-800">总流量</div>
        </div>
      </div>

      {/* 筛选结果预览 */}
      {filteredKeywords.length > 0 && (
        <div className="card">
          <h4 className="text-md font-semibold text-gray-900 mb-3">筛选结果预览</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredKeywords.slice(0, 10).map((keyword, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium text-gray-900">{keyword.keyword}</span>
                <div className="flex space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <BoltIcon className="h-3 w-3 mr-1" />
                    {keyword.difficulty}
                  </span>
                  <span className="flex items-center">
                    <ChartBarIcon className="h-3 w-3 mr-1" />
                    {keyword.traffic.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
            {filteredKeywords.length > 10 && (
              <div className="text-center text-sm text-gray-500 py-2">
                还有 {filteredKeywords.length - 10} 个关键词...
              </div>
            )}
          </div>
        </div>
      )}

      {/* 无结果提示 */}
      {filteredKeywords.length === 0 && keywords.length > 0 && (
        <div className="card text-center py-8">
          <FunnelIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">没有符合条件的关键词</h4>
          <p className="text-gray-600 mb-4">
            请调整筛选条件以获得更多结果
          </p>
          <button
            onClick={() => updateFilter({ maxDifficulty: 80, minTraffic: 100 })}
            className="btn-secondary"
          >
            放宽筛选条件
          </button>
        </div>
      )}
    </div>
  )
}
