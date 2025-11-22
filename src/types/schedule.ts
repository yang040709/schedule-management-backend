// 例如，优先级如果只有固定的几个级别
export type PriorityLevel = 'high' | 'medium' | 'low'

export type ScheduleStatus = 'done' | 'pending' | 'expired' | 'canceled' | 'locked'

export type ScheduleNoDependent = Omit<Schedule, 'dependentSchedule'>

export type Schedule = {
  id: string
  title: string
  description: string
  AIsuggestion?: string
  status: ScheduleStatus
  priority: PriorityLevel
  category?: string[]
  // dependentId?: string // 依赖的任务ID
  dependentSchedule?: ScheduleNoDependent
  createdAt: string
  updatedAt: string
  date: string
  timeOfDay?: {
    startTime: string // "08:00" 或 "08:00:00"
    endTime: string // "09:00"
  }
}

export type ScheduleItem = {}

export interface ScheduleListQuery {
  status?: ScheduleStatus
  priority?: string
  date?: string
  dateRange?: {
    startDate: string // "2025-11-01"
    endDate: string // "2025-11-10"
  }
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
  // 所有任务共用的时间段（可选）
  timeOfDay?: {
    startTime: string // "08:00" 或 "08:00:00"
    endTime: string // "09:00"
  }
  date: string
}

export interface FlowScheduleForm {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category?: string[]
  dependentId?: string // 依赖的任务ID
  // 所有任务共用的时间段（可选）
  timeOfDay: {
    startTime?: string // "08:00" 或 "08:00:00"
    endTime?: string // "09:00"
  }
  date: string
}

/* 
  除了id、createdAt、updatedAt字段，其他字段都可以修改
*/
type _ModifyScheduleForm = Omit<
  Schedule,
  'id' | 'createdAt' | 'updatedAt' | 'dependentSchedule'
> & {
  dependentId?: string // 依赖的任务ID
}
export type ModifyScheduleForm = Partial<_ModifyScheduleForm>

export type ModifyScheduleFormWithId = Partial<_ModifyScheduleForm> & {
  id: string
}

export interface GenerateSchedule {
  content: string
}

export interface AISuggest {
  suggestion: string
}
