import type { Schedule, ScheduleDocument } from "./schedule";

export interface ExportResponse {
  total: number;
  data: ScheduleDocument[];
}

export interface ImportBody {
  data: ScheduleDocument[];
}
