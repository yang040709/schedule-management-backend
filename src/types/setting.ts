import type { Schedule } from './schedule'

export interface ExportResponse {
  total: number
  data: Schedule[]
}

export interface ImportBody {
  data: Schedule[]
}
