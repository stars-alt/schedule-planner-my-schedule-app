import React, { useState } from 'react';
import { ScheduleItem, DayOfWeek, DAYS_OF_WEEK, KoreanDays, FullKoreanDays } from '../types';
import { Trash2, Edit3, CheckSquare, Square, Clock, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { calculateDuration } from '../utils';

interface WeeklySchedulerProps {
  schedules: ScheduleItem[];
  categories: Array<{ id: string; name: string; style: string }>;
  selectedCategory: string | null;
  onEditItem: (item: ScheduleItem) => void;
  onDeleteItem: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onAddAtSlot?: (day: DayOfWeek, startTime: string) => void;
}

export default function WeeklyScheduler({
  schedules,
  categories,
  selectedCategory,
  onEditItem,
  onDeleteItem,
  onToggleComplete,
  onAddAtSlot
}: WeeklySchedulerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [schedulerSubView, setSchedulerSubView] = useState<'cards' | 'timegrid'>('cards');

  // Time slots for the Hourly Time-Grid view (from 07:00 to 22:00)
  const HOURS = Array.from({ length: 16 }, (_, i) => {
    const h = i + 7;
    return `${h.toString().padStart(2, '0')}:00`;
  });

  // Filtered schedules based on search and category filters
  const filteredSchedules = schedules.filter((s) => {
    const matchesCategory = selectedCategory ? s.category === selectedCategory : true;
    const matchesSearch = searchTerm.trim()
      ? s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
    return matchesCategory && matchesSearch;
  });

  // Helper to retrieve style classes matching a category name
  const getCategoryStyle = (categoryName: string) => {
    const cat = categories.find((c) => c.name === categoryName);
    return cat ? cat.style : 'bg-white border-neutral-900 text-neutral-900';
  };

  // Render priority characters
  const renderPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    if (priority === 'high') return <span className="text-[10px] bg-red-100 text-red-800 border border-red-800 px-1 font-mono square font-bold">HIGH</span>;
    if (priority === 'medium') return <span className="text-[10px] bg-zinc-100 text-zinc-800 border border-zinc-400 px-1 font-mono square font-medium">MID</span>;
    return <span className="text-[10px] bg-white text-zinc-500 border border-zinc-200 px-1 font-mono square">LOW</span>;
  };

  // Find if a schedule falls exactly on this hour slot for this day (used in Hourly Time-Grid helper)
  const getSchedulesForSlot = (day: DayOfWeek, hourStr: string) => {
    const [h] = hourStr.split(':').map(Number);
    return filteredSchedules.filter((s) => {
      if (s.day !== day) return false;
      const [startH] = s.startTime.split(':').map(Number);
      return startH === h;
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Sub-View Control Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between border-b-4 pb-4 border-black">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search Weekly Schedule (일정 검색)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-2 border-black bg-white px-3 py-2 text-sm text-black font-semibold font-sans square h-11"
          />
        </div>

        {/* View Toggle */}
        <div className="flex border-2 border-black bg-white p-1 square self-start md:self-auto">
          <button
            onClick={() => setSchedulerSubView('cards')}
            className={`px-4 py-2 text-xs font-heading font-black cursor-pointer transition-colors ${
              schedulerSubView === 'cards'
                ? 'bg-black text-white'
                : 'bg-white text-neutral-600 hover:text-black'
            }`}
          >
            요일별 단순 목록 (7열)
          </button>
          <button
            onClick={() => setSchedulerSubView('timegrid')}
            className={`px-4 py-2 text-xs font-heading font-black cursor-pointer transition-colors ${
              schedulerSubView === 'timegrid'
                ? 'bg-black text-white'
                : 'bg-white text-neutral-600 hover:text-black'
            }`}
          >
            시간대별 타임블록 (7열)
          </button>
        </div>
      </div>

      {schedulerSubView === 'cards' ? (
        /* ==================== 1. SIMPLE RECTANGULAR CARD LIST (7 COLUMNS) ==================== */
        <div>
          {/* Swipe indicator for smaller displays */}
          <div className="block md:hidden text-center text-[10px] text-neutral-500 font-bold mb-2 uppercase animate-pulse tracking-wide">
            ← 스와이프하여 일주일 일정을 모두 확인하세요 (7개 열 전체 배치됨) →
          </div>

          <div className="overflow-x-auto border-4 border-black bg-black">
            {/* Rigid 7 column grid with min-width on mobile to preserve layout integrity */}
            <div className="grid grid-cols-7 divide-x divide-black min-w-[1050px] md:min-w-0">
              {DAYS_OF_WEEK.map((day) => {
                const dayItems = filteredSchedules.filter((s) => s.day === day).sort((a,b) => a.startTime.localeCompare(b.startTime));
                
                return (
                  <div key={day} className="bg-white flex flex-col min-h-[520px]">
                    {/* Column Header */}
                    <div className="p-3 bg-neutral-100 border-b-2 border-black text-center flex flex-col items-center justify-center py-4 sticky top-0 z-10">
                      <span className="text-xs font-mono text-neutral-500 font-black tracking-wider">{day.substring(0,3).toUpperCase()}</span>
                      <h4 className="font-heading font-black text-sm text-black mt-0.5">{FullKoreanDays[day]}</h4>
                      <span className="text-[10px] px-2 py-0.5 bg-black text-white font-mono mt-1 font-bold square">
                        COUNT: {dayItems.length}
                      </span>
                    </div>

                    {/* Column Body: Slot Cards */}
                    <div className="p-2.5 space-y-3.5 flex-1 flex flex-col bg-neutral-50/70">
                      {dayItems.map((item) => (
                        <div
                          key={item.id}
                          className={`border-2 border-black bg-white p-3 square transition-all flex flex-col justify-between group hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] ${
                            item.isCompleted ? 'bg-zinc-100/70 border-neutral-400' : ''
                          }`}
                        >
                          <div>
                            {/* Complete State and Badges */}
                            <div className="flex items-start justify-between gap-1 mb-2">
                              <button
                                onClick={() => onToggleComplete(item.id)}
                                className="text-black hover:opacity-80 cursor-pointer transition-colors"
                                title={item.isCompleted ? '진행 중으로 변경' : '완료로 표시'}
                              >
                                {item.isCompleted ? (
                                  <CheckSquare className="w-4 h-4 text-black fill-neutral-200" />
                                ) : (
                                  <Square className="w-4 h-4 text-neutral-400 group-hover:text-black" />
                                )}
                              </button>
                              
                              <div className="flex items-center gap-1.5">
                                {renderPriorityBadge(item.priority)}
                              </div>
                            </div>

                            {/* Title */}
                            <h5
                              className={`text-xs font-bold text-black leading-snug break-all ${
                                item.isCompleted ? 'line-through text-neutral-400 font-normal' : ''
                              }`}
                            >
                              {item.title}
                            </h5>

                            {/* Description (If any) */}
                            {item.description && (
                              <p className="text-[10px] text-neutral-600 mt-1 line-clamp-3 leading-tight break-all font-sans font-semibold">
                                {item.description}
                              </p>
                            )}
                          </div>

                          {/* Card Footer: Category badge + Times + Actions */}
                          <div className="mt-3 pt-2 border-t-2 border-black flex flex-col gap-2">
                            {/* Times */}
                            <div className="flex items-center gap-1 text-[10px] text-black font-mono font-bold">
                              <Clock className="w-3.5 h-3.5 text-black" />
                              <span>{item.startTime} - {item.endTime}</span>
                            </div>

                            {/* Category Tag Badge */}
                            <div className={`text-[10px] px-1.5 py-0.5 border-2 border-black inline-block font-bold truncate text-center uppercase square ${getCategoryStyle(item.category)}`}>
                              {item.category}
                            </div>

                            {/* Action Row */}
                            <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity pt-1.5 border-t border-dashed border-neutral-300">
                              <button
                                onClick={() => onEditItem(item)}
                                className="p-1 border border-black text-black bg-white hover:bg-black hover:text-white square cursor-pointer"
                                title="수정"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => onDeleteItem(item.id)}
                                className="p-1 border border-black text-black bg-white hover:bg-red-650 hover:text-white square cursor-pointer"
                                title="삭제"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {dayItems.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center p-2 text-center text-[11px] text-neutral-400 border-2 border-dashed border-neutral-350 bg-white">
                          일정 없음
                          {onAddAtSlot && (
                            <button
                              onClick={() => onAddAtSlot(day, '09:00')}
                              className="mt-2.5 text-[10px] text-white border-2 border-black bg-black px-3 py-1 hover:bg-neutral-800 cursor-pointer font-black uppercase tracking-wider"
                            >
                              + ADD
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ==================== 2. HOURLY TIME-GRID SCHEDULER (7 COLUMNS) ==================== */
        <div>
          {/* Help notice */}
          <div className="bg-neutral-50 border-2 border-black p-3.5 mb-4 text-xs flex items-center justify-between">
            <span className="font-heading font-bold text-black flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-black" />
              빈 시간 칸을 클릭하시면 해당 요일과 시간대로 즉시 일정을 채워 넣을 수 있습니다.
            </span>
            <span className="block md:hidden text-[10px] font-mono text-neutral-500 uppercase font-bold">
              ← 스와이프 전용 그리드 →
            </span>
          </div>

          <div className="overflow-x-auto border-4 border-black bg-black">
            {/* Rigid grid wrapping time + 7 columns */}
            <div className="grid grid-cols-[80px_repeat(7,1fr)] divide-x divide-black bg-white min-w-[1100px] md:min-w-0">
              {/* Header block corner cell */}
              <div className="p-3 bg-neutral-100 border-b-2 border-black text-center flex flex-col items-center justify-center font-heading font-black text-xs sticky left-0 z-20 shadow-sm">
                TIME
              </div>

              {/* Day title headers */}
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="p-3 bg-neutral-100 border-b-2 border-black text-center flex flex-col items-center justify-center py-4">
                  <span className="text-[10px] font-mono text-neutral-500 font-bold">{day.substring(0,3).toUpperCase()}</span>
                  <h4 className="font-heading font-black text-xs text-black mt-0.5">{FullKoreanDays[day]}</h4>
                </div>
              ))}

              {/* Time slots rendering row-wise */}
              {HOURS.map((hourStr) => (
                <React.Fragment key={hourStr}>
                  {/* Left Column: Time scale */}
                  <div className="p-2 border-b-2 border-black bg-neutral-100 font-mono font-black text-xs text-black flex items-center justify-center sticky left-0 z-20 shadow-sm">
                    {hourStr}
                  </div>

                  {/* Day cells for that specific hour */}
                  {DAYS_OF_WEEK.map((day) => {
                    const slotItems = getSchedulesForSlot(day, hourStr);

                    return (
                      <div
                        key={`${day}-${hourStr}`}
                        className="border-b-2 border-black p-1.5 min-h-[64px] relative group bg-white hover:bg-neutral-50 transition-colors"
                      >
                        {slotItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditItem(item);
                            }}
                            className={`border-2 border-black p-1.5 square text-[10px] cursor-pointer transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] select-none overflow-hidden h-full flex flex-col justify-between ${getCategoryStyle(item.category)} ${
                              item.isCompleted ? 'opacity-50 line-through' : ''
                            }`}
                            title={`클릭하여 자세히 보기: ${item.title} (${item.startTime} ~ ${item.endTime})`}
                          >
                            <div>
                              <div className="font-mono text-[9px] text-neutral-500 flex items-center justify-between font-bold">
                                <span>{item.startTime}</span>
                                {item.priority === 'high' && <span className="text-red-650">●</span>}
                              </div>
                              <div className="font-bold text-black truncate leading-tight mt-0.5">
                                {item.title}
                              </div>
                            </div>
                          </div>
                        ))}

                        {slotItems.length === 0 && onAddAtSlot && (
                          <div
                            onClick={() => onAddAtSlot(day, hourStr)}
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/10 flex items-center justify-center cursor-pointer transition-opacity text-[10px] font-heading font-black text-black uppercase"
                            title={`${KoreanDays[day]}요일 ${hourStr} 일정 추가`}
                          >
                            + ADD
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
