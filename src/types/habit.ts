// 习惯频率类型
export type HabitFrequency = 'daily' | 'weekly' | 'monthly'

// 目标设置
export interface Goal {
  // 目标日数
  targetDays: number
  // 时长
  durationMinutes: number // 每次持续分钟数
}

// 习惯基础信息
export interface HabitBase {
  id: string
  title: string
  description: string
  goal: Goal
  // 频率
  frequency: HabitFrequency // 例如："daily"、"weekly"、"monthly"
  // 分类
  category: string[]
  createdAt: string
  updatedAt: string
}

// 习惯统计信息
export interface HabitStats {
  currentStreak: number // 当前连续打卡天数
  longestStreak: number // 最长连续打卡天数
  totalCompleted: number // 总完成次数
  totalMissed: number // 总错过次数
  successRate: number // 成功率 0-100
}

export interface AllStats {
  totalCheckedIn: number // 总打卡次数
  avgSuccessRate: number // 所有习惯的成功率平均值
}

// 完整习惯对象
export interface Habit extends HabitBase {
  stats: HabitStats
}

// 单次打卡记录
export interface CheckInRecord {
  id: string
  habitId: string
  date: string // YYYY-MM-DD 格式
  notes?: string // 打卡备注
  mood?: number // 心情评分 1-5
  duration?: number // 实际持续时间（分钟）
}

// 成就系统
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: string
  isUnlocked: boolean
}

// 习惯列表查询参数
export interface HabitListQuery {
  frequency?: HabitFrequency
  category?: string
  page?: number
  pageSize?: number
  search?: string
}

// 习惯列表响应
export interface HabitListResponse {
  total: number
  data: Habit[]
}

export interface TodayHabit extends Habit {
  completed: boolean //表示今日的任务是否
}

// 今日习惯响应
export interface TodayHabitsResponse {
  habits: TodayHabit[]
  date: string
}

// 习惯详情响应
export interface HabitResponse {
  habit: Habit
}

// 打卡记录列表响应
export interface CheckInRecordsResponse {
  total: number
  data: CheckInRecord[]
}

// 成就列表响应
export interface AchievementsResponse {
  achievements: Achievement[]
}

// 习惯表单
export interface HabitForm {
  title: string
  description: string
  goal: Goal
  frequency: HabitFrequency
  category: string[]
}

// 修改习惯表单
// export type ModifyHabitForm = Partial<Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'stats'>>
export type ModifyHabitForm = {
  goal: Partial<Goal>
} & Partial<Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'stats'>>
// 打卡表单
export interface CheckInForm {
  habitId: string
  duration: number
  notes?: string
  mood?: number
}
