// Dify工作流相关类型定义

export interface DifyWorkflowInput {
  url_content: string           // 网站内容抓取结果
  Keywords: File | string       // ahref关键词Excel文件
}

export interface DifyWorkflowOutput {
  seo_blog: string              // 生成的SEO博客内容
}

export interface KeywordData {
  keyword: string               // 关键词
  difficulty: number            // 难度分数 (0-100)
  traffic: number              // 流量数据
  volume: number               // 搜索量
  cpc?: number                 // 每次点击成本
  competition?: string         // 竞争程度
}

export interface KeywordFilter {
  maxDifficulty: number        // 最大难度阈值
  minTraffic: number          // 最小流量阈值
}

export interface UrlAnalysis {
  url: string
  subpage: string
  title?: string
  metaDescription?: string
  headings?: string[]
  content?: string
  keywords?: string[]
}

export interface DifyApiRequest {
  inputs: {
    url_content: string         // 网站内容JSON字符串
    Keywords: string            // 处理后的关键词JSON字符串
  }
  response_mode: 'blocking' | 'streaming'
  user: string
  conversation_id?: string
}

export interface DifyApiResponse {
  event: string
  message_id: string
  conversation_id: string
  mode: string
  answer: string
  metadata: {
    usage: {
      prompt_tokens: number
      completion_tokens: number
      total_tokens: number
    }
  }
  created_at: number
}
