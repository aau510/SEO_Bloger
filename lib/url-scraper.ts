// 网站内容抓取工具 - 标准化输出格式

export interface StandardUrlContent {
  url: string
  canonical_url?: string
  status: number
  fetched_at: string
  lang?: string
  title?: string
  meta?: { 
    description?: string
    author?: string
    publishDate?: string
  }
  markdown?: string  // 优先提供，最大12k字符
  text?: string      // 备选内容，最大12k字符
  content?: string   // 向后兼容，将映射到text
  headings?: { h1: string[]; h2: string[]; h3: string[] }
  internal_links?: { anchor: string; href: string }[]
  faq?: { q: string; a: string }[]
  keywords?: string[] // 从内容中提取的关键词
  wordCount: number
}

/**
 * 抓取网站内容 - 返回标准化对象
 */
export async function scrapeUrlContent(url: string): Promise<StandardUrlContent> {
  try {
    // 验证URL格式
    const urlObj = new URL(url)
    
    // 调用抓取API
    const response = await fetch('/api/scrape-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    })

    if (!response.ok) {
      throw new Error(`抓取失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.content

  } catch (error) {
    console.error('网站内容抓取错误:', error)
    
    // 返回标准化备用内容
    const fallbackContent = `这是从 ${url} 抓取的内容摘要。由于抓取限制，这里是模拟的内容数据。网站提供了基础的信息和服务。`
    const urlObj = new URL(url)
    
    return {
      url,
      canonical_url: url,
      status: 0,
      fetched_at: new Date().toISOString(),
      lang: 'zh-CN',
      title: `${urlObj.hostname} - 网站内容`,
      meta: { 
        description: `${url} 页面的描述信息`,
        publishDate: new Date().toISOString()
      },
      markdown: fallbackContent,
      text: fallbackContent,
      content: fallbackContent, // 向后兼容
      headings: { 
        h1: ['主要内容'], 
        h2: ['相关信息', '服务介绍'], 
        h3: ['详细说明'] 
      },
      internal_links: [],
      faq: [],
      keywords: ['网站', '内容', '服务'],
      wordCount: fallbackContent.length
    }
  }
}

/**
 * 格式化URL内容为Dify标准对象
 */
export function formatUrlContentForDify(urlContent: StandardUrlContent): string {
  // 确保有内容可供LLM使用，优先markdown，其次text
  const llmContent = urlContent.markdown || urlContent.text || urlContent.content || ''
  
  const formatted = {
    url: urlContent.url,
    canonical_url: urlContent.canonical_url,
    status: urlContent.status,
    title: urlContent.title,
    description: urlContent.meta?.description,
    language: urlContent.lang,
    
    // LLM消费的主要内容 - 优先提供最好的格式，限制在12k字符内
    content: llmContent.slice(0, 12000), // 主要内容，向后兼容
    markdown: urlContent.markdown ? urlContent.markdown.slice(0, 12000) : undefined,
    text: urlContent.text ? urlContent.text.slice(0, 12000) : undefined,
    
    // 结构化数据 - 简化以减少大小
    headings: {
      h1: urlContent.headings?.h1?.slice(0, 3) || [],
      h2: urlContent.headings?.h2?.slice(0, 5) || []
    },
    
    // 关键词和链接 - 精选重要的
    keywords: urlContent.keywords?.slice(0, 15) || [], // 统一关键词字段
    internal_links: urlContent.internal_links?.slice(0, 5) || [],
    faq: urlContent.faq?.slice(0, 3) || [],
    
    // 元数据
    wordCount: urlContent.wordCount,
    fetched_at: urlContent.fetched_at
  }
  
  // 移除undefined字段以减少大小
  Object.keys(formatted).forEach(key => {
    if ((formatted as any)[key] === undefined) {
      delete (formatted as any)[key]
    }
  })
  
  return JSON.stringify(formatted, null, 2)
}
