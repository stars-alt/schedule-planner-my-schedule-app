import { ScheduleItem, DayOfWeek } from './types';

export const DEFAULT_CATEGORIES = [
  { id: 'work', name: '업무', style: 'bg-zinc-100 border-zinc-900 text-zinc-900' },
  { id: 'study', name: '공부 / 학습', style: 'bg-white border-zinc-900 text-zinc-900 border-dashed' },
  { id: 'exercise', name: '운동 / 건강', style: 'bg-zinc-900 border-zinc-900 text-white' },
  { id: 'personal', name: '개인 일상', style: 'bg-zinc-50 border-zinc-300 text-zinc-800' },
  { id: 'important', name: '중요 약속', style: 'bg-black border-black text-white font-bold ring-2 ring-offset-1 ring-black' },
];

export const INITIAL_SCHEDULES: ScheduleItem[] = [
  {
    id: 's1',
    title: '주간 전략 기획 회의',
    description: '한 주간 핵심 마일스톤 점검 및 우선순위 정렬',
    day: 'Monday',
    startTime: '09:00',
    endTime: '11:00',
    category: '업무',
    isCompleted: true,
    priority: 'high',
  },
  {
    id: 's2',
    title: '영어 회화 아침 스터디',
    description: '데일리 비즈니스 영어 기사 낭독 및 의견 공유',
    day: 'Monday',
    startTime: '07:30',
    endTime: '08:30',
    category: '공부 / 학습',
    isCompleted: true,
    priority: 'medium',
  },
  {
    id: 's3',
    title: '피트니스 센터 웨이트 트레이닝',
    description: '하체 및 코어 주요 루틴 진행',
    day: 'Tuesday',
    startTime: '07:00',
    endTime: '08:30',
    category: '운동 / 건강',
    isCompleted: false,
    priority: 'medium',
  },
  {
    id: 's4',
    title: '클라이언트 제안서 리뷰',
    description: '신규 비즈니스 피치 덱 피드백 반영하기',
    day: 'Wednesday',
    startTime: '13:00',
    endTime: '15:00',
    category: '업무',
    isCompleted: false,
    priority: 'high',
  },
  {
    id: 's5',
    title: '개발자 팀 테크 세미나',
    description: 'React 최신 렌더링 패턴 및 상태 관리 조사 발표',
    day: 'Wednesday',
    startTime: '16:00',
    endTime: '17:30',
    category: '공부 / 학습',
    isCompleted: false,
    priority: 'low',
  },
  {
    id: 's6',
    title: '러닝 크루 야간 조깅',
    description: '한강 고수부지 코스 5km 페이스 조절 러닝',
    day: 'Thursday',
    startTime: '20:00',
    endTime: '21:30',
    category: '운동 / 건강',
    isCompleted: false,
    priority: 'medium',
  },
  {
    id: 's7',
    title: '스프린트 회고 및 주간 보고',
    description: '금주 완료 현황 정리 및 Jira 티켓 마감',
    day: 'Friday',
    startTime: '15:00',
    endTime: '17:00',
    category: '업무',
    isCompleted: false,
    priority: 'high',
  },
  {
    id: 's8',
    title: '주말 대청소 및 분리수거',
    description: '집안 공기 정화 및 미뤄둔 침구류 세탁',
    day: 'Saturday',
    startTime: '10:00',
    endTime: '11:30',
    category: '개인 일상',
    isCompleted: false,
    priority: 'low',
  },
  {
    id: 's9',
    title: '친구 저녁 식사 약속',
    description: '광화문 역 근처 한식 다이닝 바',
    day: 'Saturday',
    startTime: '18:00',
    endTime: '21:00',
    category: '중요 약속',
    isCompleted: false,
    priority: 'medium',
  },
  {
    id: 's10',
    title: '다음주 준비 및 독서 타임',
    description: '미래 핵심 트렌드 도서 마이그레이션 파트 독서',
    day: 'Sunday',
    startTime: '14:00',
    endTime: '16:00',
    category: '공부 / 학습',
    isCompleted: false,
    priority: 'low',
  }
];

// Calculate duration in minutes
export function calculateDuration(start: string, end: string): number {
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  const startTotal = startHour * 60 + startMin;
  const endTotal = endHour * 60 + endMin;
  return Math.max(0, endTotal - startTotal);
}

// Convert hours format (e.g. "09:00" to minutes from midnight)
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Check for schedule overlaps
export function checkOverlap(newItem: ScheduleItem, items: ScheduleItem[]): ScheduleItem | null {
  const newStart = timeToMinutes(newItem.startTime);
  const newEnd = timeToMinutes(newItem.endTime);
  
  for (const item of items) {
    if (item.id === newItem.id || item.day !== newItem.day) continue;
    
    const start = timeToMinutes(item.startTime);
    const end = timeToMinutes(item.endTime);
    
    // Check overlapping condition
    const isOverlapping = (newStart < end && newEnd > start);
    if (isOverlapping) {
      return item;
    }
  }
  return null;
}

// Parse smart fast command input
// Text format examples:
// "월요일 09:00-11:00 프로젝트 회의" => Day: Monday, Time: 09:00 - 11:00, Title: 프로젝트 회의
// "화 19:30 웨이트 트레이닝" => Day: Tuesday, Time: 19:30 - 20:30 (default 1h), Title: 웨이트 트레이닝
export function parseSmartQuickAdd(text: string): Partial<ScheduleItem> | null {
  const input = text.trim();
  if (!input) return null;

  // Day mappings
  const dayMap: Record<string, DayOfWeek> = {
    '월': 'Monday', '화': 'Tuesday', '수': 'Wednesday', '목': 'Thursday',
    '금': 'Friday', '토': 'Saturday', '일': 'Sunday',
    '월요일': 'Monday', '화요일': 'Tuesday', '수요일': 'Wednesday', '목요일': 'Thursday',
    '금요일': 'Friday', '토요일': 'Saturday', '일요일': 'Sunday',
    'mon': 'Monday', 'tue': 'Tuesday', 'wed': 'Wednesday', 'thu': 'Thursday',
    'fri': 'Friday', 'sat': 'Saturday', 'sun': 'Sunday'
  };

  // 1. Extract day
  let foundDay: DayOfWeek | undefined;
  let remainingText = input;

  for (const [key, val] of Object.entries(dayMap)) {
    // Match word at boundaries or at the start
    const regex = new RegExp(`(^|\\s)${key}(\\s|일|요일|\\d|:|$)`);
    if (regex.test(remainingText)) {
      foundDay = val;
      // Clean up the day from text
      remainingText = remainingText.replace(new RegExp(`(^|\\s)${key}(요일|일|\\s)?`), ' ');
      break;
    }
  }

  // 2. Extract times (e.g., 09:00-11:00 or 09:00)
  let foundStartTime = '09:00';
  let foundEndTime = '10:00';

  const timeRangeRegex = /(\d{1,2})[:：](\d{2})\s*[-~]\s*(\d{1,2})[:：](\d{2})/;
  const singleTimeRegex = /(\d{1,2})[:：](\d{2})/;

  const rangeMatch = remainingText.match(timeRangeRegex);
  if (rangeMatch) {
    const sh = rangeMatch[1].padStart(2, '0');
    const sm = rangeMatch[2];
    const eh = rangeMatch[3].padStart(2, '0');
    const em = rangeMatch[4];
    foundStartTime = `${sh}:${sm}`;
    foundEndTime = `${eh}:${em}`;
    remainingText = remainingText.replace(timeRangeRegex, '');
  } else {
    const singleMatch = remainingText.match(singleTimeRegex);
    if (singleMatch) {
      const sh = singleMatch[1].padStart(2, '0');
      const sm = singleMatch[2];
      foundStartTime = `${sh}:${sm}`;
      // set duration 1 hour by default
      const endHour = (parseInt(sh, 10) + 1).toString().padStart(2, '0');
      foundEndTime = `${endHour}:${sm}`;
      remainingText = remainingText.replace(singleTimeRegex, '');
    }
  }

  // 3. Title is whatever remains
  const cleanTitle = remainingText.replace(/\s+/g, ' ').trim();
  
  if (!cleanTitle) return null;

  return {
    title: cleanTitle,
    day: foundDay || 'Monday',
    startTime: foundStartTime,
    endTime: foundEndTime,
    category: '개인 일상',
    priority: 'medium',
    isCompleted: false
  };
}
