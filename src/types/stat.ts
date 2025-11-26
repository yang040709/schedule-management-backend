// 概览卡片数据
interface OverviewItem {
  title: string
  count: number | string // 注意：'完成率' 是字符串如 '50%'
}

// 状态分布项（用于饼图/列表）
interface StatusItem {
  name: string
  value: number
}

// 优先级项
interface PriorityItem {
  title: string
  value: number
}

// 分类项（用于类别占比）
interface CategoryItem {
  name: string
  value: number
}

// 状态趋势数据（折线图）
interface StatusTrendData {
  all: number[]
  uncompleted: number[]
  completed: number[]
  xAxis: string[] // 日期字符串数组，格式如 'YYYY-MM-DD'
}

// 完整的统计数据类型
export interface DashboardStats {
  overview: OverviewItem[]
  status: StatusItem[]
  statusTrend: StatusTrendData
  priority: PriorityItem[]
  category: CategoryItem[]
}
