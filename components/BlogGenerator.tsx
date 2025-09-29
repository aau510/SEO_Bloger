'use client'

import { useState } from 'react'
import { BlogPost, BlogGenerationRequest } from '@/types/blog'
import { generateBlogPost } from '@/lib/api'
import { SparklesIcon } from '@heroicons/react/24/outline'

interface BlogGeneratorProps {
  onBlogGenerated: (post: BlogPost) => void
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
}

export default function BlogGenerator({ 
  onBlogGenerated, 
  isGenerating, 
  setIsGenerating 
}: BlogGeneratorProps) {
  const [formData, setFormData] = useState<BlogGenerationRequest>({
    topic: '',
    keywords: [],
    tone: 'professional',
    length: 'medium',
    targetAudience: '',
    includeImages: false
  })
  const [keywordInput, setKeywordInput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.topic.trim()) return

    setIsGenerating(true)
    try {
      const blogPost = await generateBlogPost(formData)
      onBlogGenerated(blogPost)
      
      // Reset form
      setFormData({
        topic: '',
        keywords: [],
        tone: 'professional',
        length: 'medium',
        targetAudience: '',
        includeImages: false
      })
      setKeywordInput('')
    } catch (error) {
      console.error('Error generating blog post:', error)
      alert('Failed to generate blog post. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }))
      setKeywordInput('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <SparklesIcon className="h-6 w-6 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-900">Generate Blog Post</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Topic */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blog Topic *
          </label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
            placeholder="Enter your blog topic..."
            className="input-field"
            required
          />
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SEO Keywords
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="Add a keyword..."
              className="input-field"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
            />
            <button
              type="button"
              onClick={addKeyword}
              className="btn-secondary whitespace-nowrap"
            >
              Add
            </button>
          </div>
          {formData.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => removeKeyword(keyword)}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Settings Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tone
            </label>
            <select
              value={formData.tone}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                tone: e.target.value as BlogGenerationRequest['tone']
              }))}
              className="input-field"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="technical">Technical</option>
              <option value="friendly">Friendly</option>
            </select>
          </div>

          {/* Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Length
            </label>
            <select
              value={formData.length}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                length: e.target.value as BlogGenerationRequest['length']
              }))}
              className="input-field"
            >
              <option value="short">Short (500-800 words)</option>
              <option value="medium">Medium (800-1500 words)</option>
              <option value="long">Long (1500+ words)</option>
            </select>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience
            </label>
            <input
              type="text"
              value={formData.targetAudience}
              onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
              placeholder="e.g., beginners, professionals..."
              className="input-field"
            />
          </div>
        </div>

        {/* Include Images */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="includeImages"
            checked={formData.includeImages}
            onChange={(e) => setFormData(prev => ({ ...prev, includeImages: e.target.checked }))}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="includeImages" className="ml-2 text-sm text-gray-700">
            Include image suggestions
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isGenerating || !formData.topic.trim()}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="h-4 w-4" />
              <span>Generate Blog Post</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
