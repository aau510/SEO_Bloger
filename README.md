# SEO博客智能体

基于Dify工作流的智能SEO博客生成系统，使用Next.js、React和Tailwind CSS构建。通过Excel关键词文件智能筛选和AI生成，创建高质量的SEO优化博客内容。

## 核心功能

- 🤖 **Dify工作流集成**: 基于Dify平台的智能内容生成工作流
- 📊 **Excel关键词解析**: 智能解析Excel文件中的关键词数据
- 🔍 **智能关键词筛选**: 根据难度和流量范围筛选最优关键词
- 🌐 **URL深度分析**: 分析目标网站和子页面内容结构
- 📈 **SEO优化**: 内置SEO分析和优化建议
- 🎨 **现代化界面**: 清洁、响应式的用户界面设计
- 📱 **移动端友好**: 完全响应式设计，支持所有设备
- 📄 **内容预览**: 格式化的博客内容预览和导出
- 📋 **一键导出**: 复制内容到剪贴板或下载Markdown文件

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API access token for content generation

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd blog
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Edit `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.dify.ai/v1
API_AUTHORIZATION_TOKEN=Bearer your-api-token-here
NEXT_PUBLIC_SITE_NAME=SEO Blog Agent
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_DESCRIPTION=AI-powered SEO blog generation system
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 使用方法

### Dify工作流博客生成

1. **输入基本信息**:
   - **目标网站URL**: 输入要分析的网站地址
   - **子页面路径**: 可选的具体页面路径
   - **上传Excel文件**: 包含关键词数据的Excel文件

2. **Excel文件格式要求**:
   - 必须包含"关键词"或"keyword"列
   - 建议包含"难度"、"流量"、"搜索量"等列
   - 支持中英文列名自动识别

3. **智能关键词筛选**:
   - **难度筛选**: 设置最大难度阈值（1-100）
   - **流量筛选**: 设置最小流量要求
   - **实时预览**: 查看筛选结果和统计信息

4. **生成SEO博客**:
   - 系统调用Dify工作流
   - 基于筛选的关键词生成优化内容
   - 自动生成SEO友好的博客文章

5. **导出和使用**:
   - 复制内容到剪贴板
   - 下载Markdown格式文件
   - 直接用于网站发布

### 工作流输入变量

- **URL**: 目标网站地址
- **URL_subpage**: 子页面路径
- **Keywords**: 筛选后的关键词数据（JSON格式）

### 工作流输出变量

- **seo_blog**: 生成的SEO优化博客内容

## Project Structure

```
blog/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Header.tsx         # Navigation header
│   ├── BlogGenerator.tsx  # Blog generation form
│   └── BlogList.tsx       # Generated posts list
├── lib/                   # Utility functions
│   └── api.ts            # API integration
├── types/                 # TypeScript definitions
│   └── blog.ts           # Blog-related types
├── public/               # Static assets
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## Dify工作流集成

系统与Dify平台深度集成，主要API功能包括：

- `parseKeywordsFromExcel()`: 解析Excel关键词文件
- `filterKeywords()`: 智能关键词筛选
- `generateSEOBlogWithDify()`: 调用Dify工作流生成博客
- `analyzeUrl()`: URL和子页面内容分析

### API配置

系统已预配置Dify API连接，可直接使用。如需修改配置，请编辑`.env.local`文件。

### Excel文件格式

支持的Excel列名（中英文自动识别）：

- **关键词列**: `关键词`, `keyword`, `keywords`, `关键字`
- **难度列**: `难度`, `difficulty`, `kd`, `keyword difficulty`
- **流量列**: `流量`, `traffic`, `volume`, `search volume`, `搜索量`
- **搜索量列**: `搜索量`, `volume`, `search volume`, `monthly searches`

## Customization

### Styling

The project uses Tailwind CSS for styling. Customize the design by:

1. Editing `tailwind.config.js` for theme customization
2. Modifying `app/globals.css` for global styles
3. Updating component styles in individual files

### Content Generation

Customize content generation by modifying:

- `lib/api.ts`: Adjust prompts and API calls
- `types/blog.ts`: Add new content types
- Components: Enhance UI and user experience

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The app can be deployed to any platform supporting Next.js:

- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review existing issues for solutions

## 开发路线图

- [ ] 高级SEO分析工具
- [ ] 内容调度和发布功能
- [ ] 多语言支持
- [ ] 与主流CMS平台集成
- [ ] 分析和性能跟踪
- [ ] 批量内容生成
- [ ] 自定义AI模型训练
- [ ] 更多Excel格式支持
- [ ] 关键词竞争分析
- [ ] 内容质量评分系统

## 技术特色

### Excel智能解析
- 支持多种Excel格式（.xlsx, .xls, .csv）
- 智能列名识别（中英文）
- 容错处理和数据验证
- 示例文件生成和下载

### 关键词筛选算法
- 基于难度和流量的双重筛选
- 实时统计和可视化
- 灵活的筛选条件设置
- 筛选结果预览

### Dify工作流集成
- 标准化的工作流输入输出
- 错误处理和备用方案
- 实时状态监控
- 高性能API调用
# SEO_Bloger
