// 例如，优先级如果只有固定的几个级别
export type PriorityLevel = 'high' | 'medium' | 'low'

export type ScheduleStatus = 'done' | 'pending' | 'expired' | 'canceled' | 'in-progress'

// // 或者分类名称预定义
// // type CategoryTag = 'work' | 'personal' | 'health' | 'shopping';

// // 日程项接口，定义单个日程的详细结构
// export interface ScheduleEvent {
//   id: string // 唯一标识符
//   title: string // 标题
//   description?: string // 可选字段，使用?
//   startTime?: string // 开始时间
//   endTime?: string // 结束时间
//   priority: PriorityLevel // 优先级
//   category?: string[] // 分类支持多个标签
//   completed: boolean // 完成状态
//   date: string
// }

// export interface ScheduleEventV1 extends Omit<ScheduleEvent, 'date'> {}

// // 主数据结构接口，以日期字符串为键，日程项数组为值
// export interface ScheduleDataV1 {
//   [date: string]: ScheduleEventV1[] // 索引签名，允许动态的日期键
// }

// export type ScheduleData = ScheduleEvent[]

/* 

| 当前状态     | 允许切换到的状态         | 触发条件示例 |
|--------------|--------------------------|-------------|
| `pending`    | `in-progress`, `canceled`, `expired` | 用户点击“开始”；用户主动取消；系统定时检查发现已过期 |
| `in-progress`| `done`, `canceled`, `expired`       | 用户标记完成；用户放弃；超时未完成 |
| `done`       | （通常不可变）           | — |
| `canceled`   | （通常不可变）           | — |
| `expired`    | （通常不可变）           | — |

*/

export interface Schedule {
  id: string
  title: string
  description: string
  AIsuggestion?: string
  status: ScheduleStatus
  priority: PriorityLevel
  category?: string[]
  dependentId?: string // 依赖的任务ID

  /* 
  下面是时间相关的规则
  */
  // === 时间与重复规则 ===
  scheduleType: 'single' | 'daily' // 单次 or 每日重复

  // 单次任务：一个具体的日期（必填）
  singleDate?: string // ISO 8601 日期，如 "2025-11-15"

  // 重复任务：起止日期（闭区间）
  recurrence?: {
    startDate: string // "2025-11-01"
    endDate: string // "2025-11-10"
  }

  // 所有任务共用的时间段（可选）
  timeOfDay?: {
    startTime: string // "08:00" 或 "08:00:00"
    endTime: string // "09:00"
  }
  createdAt: string
  updatedAt: string
}

export interface ScheduleListQuery {
  status?: ScheduleStatus
  priority?: string
  date?: string
  page?: number
  pageSize?: number
}

export interface ScheduleListResponse {
  total: number
  data: Schedule[]
}

export interface ScheduleResponse {
  schedule: Schedule
}

export interface ScheduleForm {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category?: string[]
  dependentId?: string // 依赖的任务ID
  date: {
    type: 'TimeRange' | 'exact'
    timeRange?: {
      startTime: string
      endTime: string
    }
    exactTime?: string //'2023-01-01 00:00:00或者2023-01-01'两种格式
  }
}

interface _ModifyScheduleForm {
  title: string
  description: string
  AIsuggestion?: string
  status: ScheduleStatus
  priority: PriorityLevel
  category?: string[]
  dependentId?: string // 依赖的任务ID
  date: {
    type: 'TimeRange' | 'exact'
    timeRange?: {
      startTime: string
      endTime: string
    }
    exactTime?: string
    //这三个必须为 ISO 8601 字符串。若仅指定日期（如 "2023-01-01"），视为全天任务。'2023-01-01 00:00:00或者2023-01-01'两种格式
  }
}

export type ModifyScheduleForm = Partial<_ModifyScheduleForm>

export interface GenerateSchedule {
  content: string
}

export interface AISuggest {
  suggestion: string
}
