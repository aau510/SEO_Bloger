'use client'

import { BlogPost } from '@/types/blog'
import { format } from 'date-fns'
import { 
  ClockIcon, 
  TagIcon, 
  EyeIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline'

interface BlogListProps {
  posts: BlogPost[]
}

export default function BlogList({ posts }: BlogListProps) {
  const handleViewPost = (post: BlogPost) => {
    // Create a new window/tab to display the blog post
    const newWindow = window.open('', '_blank')
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="description" content="${post.metaDescription}">
          <meta name="keywords" content="${post.keywords.join(', ')}">
          <title>${post.title}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 2rem;
              color: #333;
            }
            h1 { color: #2563eb; margin-bottom: 1rem; }
            h2, h3 { color: #374151; margin-top: 2rem; margin-bottom: 1rem; }
            p { margin-bottom: 1rem; }
            .meta { 
              color: #6b7280; 
              font-size: 0.9rem; 
              margin-bottom: 2rem;
              padding-bottom: 1rem;
              border-bottom: 1px solid #e5e7eb;
            }
            .tags {
              margin-top: 2rem;
              padding-top: 1rem;
              border-top: 1px solid #e5e7eb;
            }
            .tag {
              display: inline-block;
              background: #dbeafe;
              color: #1e40af;
              padding: 0.25rem 0.75rem;
              border-radius: 9999px;
              font-size: 0.8rem;
              margin-right: 0.5rem;
              margin-bottom: 0.5rem;
            }
          </style>
        </head>
        <body>
          <article>
            <h1>${post.title}</h1>
            <div class="meta">
              <p><strong>Published:</strong> ${format(post.createdAt, 'MMMM dd, yyyy')}</p>
              <p><strong>Reading time:</strong> ${post.readingTime} minutes</p>
              <p><strong>Description:</strong> ${post.metaDescription}</p>
            </div>
            <div>${post.content.replace(/\n/g, '<br>')}</div>
            <div class="tags">
              <strong>Tags:</strong><br>
              ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          </article>
        </body>
        </html>
      `)
      newWindow.document.close()
    }
  }

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      alert('Content copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy content:', err)
      alert('Failed to copy content')
    }
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div key={post.id} className="card hover:shadow-md transition-shadow">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {post.excerpt}
                </p>
              </div>
              {post.seoScore && (
                <div className="ml-4 flex-shrink-0">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    post.seoScore >= 80 
                      ? 'bg-green-100 text-green-800' 
                      : post.seoScore >= 60 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    SEO: {post.seoScore}/100
                  </div>
                </div>
              )}
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <ClockIcon className="h-4 w-4" />
                <span>{post.readingTime} min read</span>
              </div>
              <div className="flex items-center space-x-1">
                <DocumentTextIcon className="h-4 w-4" />
                <span>{format(post.createdAt, 'MMM dd, yyyy')}</span>
              </div>
              {post.keywords.length > 0 && (
                <div className="flex items-center space-x-1">
                  <TagIcon className="h-4 w-4" />
                  <span>{post.keywords.length} keywords</span>
                </div>
              )}
            </div>

            {/* Keywords */}
            {post.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.keywords.slice(0, 5).map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {keyword}
                  </span>
                ))}
                {post.keywords.length > 5 && (
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    +{post.keywords.length - 5} more
                  </span>
                )}
              </div>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleViewPost(post)}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                <EyeIcon className="h-4 w-4" />
                <span>View Post</span>
              </button>
              <button
                onClick={() => copyToClipboard(post.content)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 font-medium"
              >
                <DocumentTextIcon className="h-4 w-4" />
                <span>Copy Content</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
