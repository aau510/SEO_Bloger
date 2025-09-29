import './globals.css'

// 使用系统字体避免Google Fonts网络连接问题
const fontClass = 'font-sans'

export const metadata = {
  title: 'SEO Blog Agent',
  description: 'AI-powered SEO blog generation system',
  keywords: 'SEO, blog, AI, content generation, marketing',
  authors: [{ name: 'SEO Blog Agent' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        <meta name="author" content="SEO Blog Agent" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:site_name" content="SEO Blog Agent" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={fontClass}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}
