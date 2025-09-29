import axios from 'axios'
import { DifyApiRequest, DifyApiResponse, KeywordData, KeywordFilter, UrlAnalysis } from '@/types/dify'
import { scrapeUrlContent, formatUrlContentForDify } from './url-scraper'

// 使用代理API避免Mixed Content问题
const DIFY_API_BASE_URL = '/api/dify-proxy'
const DIFY_API_TOKEN = process.env.API_AUTHORIZATION_TOKEN || 'app-EVYktrhqnqncQSV9BdDv6uuu'

// 创建Dify API客户端 - 使用代理
const difyClient = axios.create({
  baseURL: DIFY_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 解析Excel文件中的关键词数据
 */
export async function parseKeywordsFromExcel(file: File): Promise<KeywordData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const data = e.target?.result
        if (!data) throw new Error('无法读取文件')

        // 动态导入xlsx库
        const XLSX = await import('xlsx')
        
        // 解析Excel文件
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        
        // 转换为JSON格式
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        if (jsonData.length < 2) {
          throw new Error('Excel文件格式不正确，至少需要包含标题行和数据行')
        }
        
        // 获取标题行
        const headers = jsonData[0] as string[]
        
        // 查找关键列的索引
        const keywordIndex = findColumnIndex(headers, ['keyword', '关键词', 'keywords', '关键字'])
        const difficultyIndex = findColumnIndex(headers, ['difficulty', '难度', 'kd', 'keyword difficulty'])
        const trafficIndex = findColumnIndex(headers, ['traffic', '流量', 'volume', 'search volume', '搜索量'])
        const volumeIndex = findColumnIndex(headers, ['volume', '搜索量', 'search volume', 'monthly searches'])
        
        if (keywordIndex === -1) {
          throw new Error('未找到关键词列，请确保Excel文件包含"关键词"或"keyword"列')
        }
        
        // 解析数据行
        const keywords: KeywordData[] = []
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[]
          
          if (!row || row.length === 0) continue
          
          const keyword = row[keywordIndex]?.toString()?.trim()
          if (!keyword) continue
          
          const difficulty = difficultyIndex !== -1 ? parseFloat(row[difficultyIndex]) || 0 : Math.floor(Math.random() * 100)
          const traffic = trafficIndex !== -1 ? parseFloat(row[trafficIndex]) || 0 : Math.floor(Math.random() * 5000)
          const volume = volumeIndex !== -1 ? parseFloat(row[volumeIndex]) || 0 : Math.floor(Math.random() * 10000)
          
          keywords.push({
            keyword,
            difficulty,
            traffic,
            volume,
            cpc: Math.random() * 5, // 随机CPC值
            competition: difficulty > 70 ? 'High' : difficulty > 40 ? 'Medium' : 'Low'
          })
        }
        
        if (keywords.length === 0) {
          throw new Error('未找到有效的关键词数据')
        }
        
        resolve(keywords)
      } catch (error) {
        console.error('Excel解析错误:', error)
        reject(error instanceof Error ? error : new Error('Excel文件解析失败'))
      }
    }
    
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 查找列索引的辅助函数
 */
function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i]?.toString().toLowerCase().trim()
    if (possibleNames.some(name => header.includes(name.toLowerCase()))) {
      return i
    }
  }
  return -1
}

/**
 * 根据难度和流量筛选关键词
 */
export function filterKeywords(keywords: KeywordData[], filter: KeywordFilter): KeywordData[] {
  return keywords.filter(keyword => 
    keyword.difficulty <= filter.maxDifficulty && 
    keyword.traffic >= filter.minTraffic
  )
}

/**
 * 分析目标URL和子页面
 */
export async function analyzeUrl(url: string, subpage: string): Promise<UrlAnalysis> {
  try {
    // 构建完整URL
    const fullUrl = subpage ? `${url}${subpage}` : url
    
    // 这里应该实现真实的URL分析
    // 为了演示，返回模拟数据
    const analysis: UrlAnalysis = {
      url: url,
      subpage: subpage,
      title: `${url}的页面标题`,
      metaDescription: `这是${url}页面的元描述`,
      headings: ['主标题', '副标题1', '副标题2'],
      content: `这是从${fullUrl}提取的内容摘要...`,
      keywords: ['相关关键词1', '相关关键词2', '相关关键词3']
    }
    
    return analysis
  } catch (error) {
    console.error('URL分析失败:', error)
    throw new Error('无法分析目标URL')
  }
}

/**
 * 调用Dify工作流生成SEO博客（带进度回调）
 */
export async function generateSEOBlogWithDify(
  url: string,
  filteredKeywords: KeywordData[],
  onProgress?: (step: string, data?: any) => void
): Promise<string> {
  try {
    onProgress?.('prepare', { url, Keywords: filteredKeywords })
    
    // 第一步：抓取网站内容 - 现在返回标准化对象
    onProgress?.('scraping', { url })
    const urlContent = await scrapeUrlContent(url)
    const formattedUrlContent = formatUrlContentForDify(urlContent)
    
    console.log(`📊 内容准备完成: markdown=${urlContent.markdown?.length || 0}字符, text=${urlContent.text?.length || 0}字符`)
    
    // 准备关键词数据
    const keywordsData = filteredKeywords.map(k => ({
      keyword: k.keyword,
      difficulty: k.difficulty,
      traffic: k.traffic,
      volume: k.volume
    }))

    onProgress?.('send', { url_content: formattedUrlContent, Keywords: keywordsData })

    // 构建Dify API请求
    const request: DifyApiRequest = {
      inputs: {
        url_content: formattedUrlContent,
        Keywords: JSON.stringify(keywordsData)
      },
      response_mode: 'blocking',
      user: 'seo-blog-agent',
      conversation_id: ''
    }

    onProgress?.('process')

    // 调用Dify工作流
    const response = await difyClient.post('/workflows/run', request)
    
    onProgress?.('receive')
    
    let result = ''
    if (response.data && response.data.data && response.data.data.outputs) {
      result = response.data.data.outputs.seo_blog || response.data.data.outputs.answer || ''
    }
    
    // 直接返回Dify的原始输出，不做任何处理
    onProgress?.('display', result)
    return result
    
  } catch (error) {
    console.error('Dify API调用失败:', error)
    onProgress?.('error', error instanceof Error ? error.message : 'API调用失败')
    
    // 直接抛出错误，不生成备用内容
    throw error
  }
}

/**
 * 流式调用Dify工作流（支持实时输出）
 */
export async function generateSEOBlogWithDifyStream(
  url: string,
  filteredKeywords: KeywordData[],
  onProgress?: (step: string, data?: any) => void,
  onStream?: (chunk: string) => void
): Promise<string> {
  try {
    onProgress?.('prepare', { url, Keywords: filteredKeywords })
    
    // 第一步：抓取网站内容 - 现在返回标准化对象
    onProgress?.('scraping', { url })
    const urlContent = await scrapeUrlContent(url)
    const formattedUrlContent = formatUrlContentForDify(urlContent)
    
    console.log(`📊 流式内容准备: markdown=${urlContent.markdown?.length || 0}字符, text=${urlContent.text?.length || 0}字符`)
    
    // 准备关键词数据
    const keywordsData = filteredKeywords.map(k => ({
      keyword: k.keyword,
      difficulty: k.difficulty,
      traffic: k.traffic,
      volume: k.volume
    }))

    onProgress?.('send', { url_content: formattedUrlContent, Keywords: keywordsData })

    // 构建Dify API请求（流式模式）
    const request: DifyApiRequest = {
      inputs: {
        url_content: formattedUrlContent,
        Keywords: JSON.stringify(keywordsData)
      },
      response_mode: 'streaming',
      user: 'seo-blog-agent',
      conversation_id: ''
    }

    onProgress?.('process')

    // 调用Dify工作流（流式）- 使用代理
    const response = await fetch('/api/dify-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    onProgress?.('receive')

    let fullResult = ''
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.event === 'text_chunk' && data.data?.text) {
                fullResult += data.data.text
                onStream?.(data.data.text)
              } else if (data.event === 'workflow_finished') {
                onProgress?.('display', fullResult)
                return fullResult
              }
            } catch (e) {
              // 忽略JSON解析错误
            }
          }
        }
      }
    }

    // 直接返回Dify的原始输出，不做任何处理
    onProgress?.('display', fullResult)
    return fullResult
    
  } catch (error) {
    console.error('Dify流式API调用失败:', error)
    onProgress?.('error', error instanceof Error ? error.message : 'API调用失败')
    
    // 直接抛出错误，不生成备用内容
    throw error
  }
}


/**
 * 获取工作流运行状态
 */
export async function getWorkflowStatus(messageId: string): Promise<any> {
  try {
    const response = await difyClient.get(`/messages/${messageId}`)
    return response.data
  } catch (error) {
    console.error('获取工作流状态失败:', error)
    throw error
  }
}
