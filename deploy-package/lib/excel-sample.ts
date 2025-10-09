// 生成示例Excel文件的工具函数

export interface ExcelSampleData {
  keyword: string
  difficulty: number
  traffic: number
  volume: number
  cpc: number
  competition: string
}

export const sampleKeywordsData: ExcelSampleData[] = [
  { keyword: 'SEO优化', difficulty: 45, traffic: 1200, volume: 8900, cpc: 2.5, competition: 'Medium' },
  { keyword: '关键词研究', difficulty: 38, traffic: 890, volume: 5600, cpc: 1.8, competition: 'Medium' },
  { keyword: '内容营销', difficulty: 52, traffic: 2100, volume: 12000, cpc: 3.2, competition: 'Medium' },
  { keyword: '搜索引擎优化', difficulty: 48, traffic: 1800, volume: 9500, cpc: 2.9, competition: 'Medium' },
  { keyword: '网站排名', difficulty: 41, traffic: 1500, volume: 7200, cpc: 2.1, competition: 'Medium' },
  { keyword: '长尾关键词', difficulty: 25, traffic: 650, volume: 3200, cpc: 1.2, competition: 'Low' },
  { keyword: 'Google SEO', difficulty: 68, traffic: 3500, volume: 15000, cpc: 4.5, competition: 'High' },
  { keyword: '网站优化', difficulty: 42, traffic: 1100, volume: 6800, cpc: 2.3, competition: 'Medium' },
  { keyword: '搜索排名', difficulty: 55, traffic: 2200, volume: 11000, cpc: 3.8, competition: 'Medium' },
  { keyword: 'SEO工具', difficulty: 35, traffic: 980, volume: 4500, cpc: 1.9, competition: 'Low' },
  { keyword: '网页优化', difficulty: 39, traffic: 1300, volume: 7500, cpc: 2.4, competition: 'Medium' },
  { keyword: '关键词密度', difficulty: 28, traffic: 720, volume: 3800, cpc: 1.5, competition: 'Low' },
  { keyword: 'Meta标签', difficulty: 33, traffic: 850, volume: 4200, cpc: 1.7, competition: 'Low' },
  { keyword: '外链建设', difficulty: 61, traffic: 2800, volume: 13500, cpc: 4.1, competition: 'High' },
  { keyword: '内链优化', difficulty: 29, traffic: 680, volume: 3600, cpc: 1.4, competition: 'Low' },
  { keyword: '页面速度', difficulty: 44, traffic: 1400, volume: 8200, cpc: 2.6, competition: 'Medium' },
  { keyword: '移动SEO', difficulty: 47, traffic: 1600, volume: 9200, cpc: 2.8, competition: 'Medium' },
  { keyword: '本地SEO', difficulty: 36, traffic: 920, volume: 4800, cpc: 1.8, competition: 'Low' },
  { keyword: 'SEO分析', difficulty: 40, traffic: 1200, volume: 6500, cpc: 2.2, competition: 'Medium' },
  { keyword: '竞争对手分析', difficulty: 58, traffic: 2500, volume: 12800, cpc: 3.9, competition: 'High' }
]

/**
 * 生成示例Excel文件
 */
export async function generateSampleExcel(): Promise<Blob> {
  const XLSX = await import('xlsx')
  
  // 创建工作簿
  const workbook = XLSX.utils.book_new()
  
  // 准备数据
  const data = [
    ['关键词', '难度', '流量', '搜索量', 'CPC', '竞争程度'],
    ...sampleKeywordsData.map(item => [
      item.keyword,
      item.difficulty,
      item.traffic,
      item.volume,
      item.cpc,
      item.competition
    ])
  ]
  
  // 创建工作表
  const worksheet = XLSX.utils.aoa_to_sheet(data)
  
  // 设置列宽
  worksheet['!cols'] = [
    { width: 20 }, // 关键词
    { width: 10 }, // 难度
    { width: 10 }, // 流量
    { width: 12 }, // 搜索量
    { width: 8 },  // CPC
    { width: 12 }  // 竞争程度
  ]
  
  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, '关键词数据')
  
  // 生成Excel文件
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  
  return new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  })
}
