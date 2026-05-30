export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export const KoreanDays: Record<DayOfWeek, string> = {
  Monday: '월',
  Tuesday: '화',
  Wednesday: '수',
  Thursday: '목',
  Friday: '금',
  Saturday: '토',
  Sunday: '일'
};

export const FullKoreanDays: Record<DayOfWeek, string> = {
  Monday: '월요일',
  Tuesday: '화요일',
  Wednesday: '수요일',
  Thursday: '목요일',
  Friday: '금요일',
  Saturday: '토요일',
  Sunday: '일요일'
};

export interface ScheduleItem {
  id: string;
  title: string;
  description?: string;
  day: DayOfWeek;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:30"
  category: string;  // e.g. "Work", "Personal", "Study", "Exercise"
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface Category {
  id: string;
  name: string;
  color: string;     // Tailwind classes (high contrast borders, simple patterns)
}

export type ViewMode = 'grid' | 'lists' | 'stats';
