export interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string
  keywords: string[]
  metaDescription: string
  slug: string
  createdAt: Date
  readingTime: number
  seoScore?: number
  tags: string[]
}

export interface BlogGenerationRequest {
  topic: string
  keywords: string[]
  tone: 'professional' | 'casual' | 'technical' | 'friendly'
  length: 'short' | 'medium' | 'long'
  targetAudience: string
  includeImages?: boolean
}

export interface SEOAnalysis {
  score: number
  suggestions: string[]
  keywordDensity: { [key: string]: number }
  readabilityScore: number
  metaTagsOptimized: boolean
}
