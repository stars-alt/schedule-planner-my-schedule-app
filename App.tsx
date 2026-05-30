import { useState, useEffect } from 'react';
import { ScheduleItem, ViewMode, DayOfWeek, DAYS_OF_WEEK, FullKoreanDays } from './types';
import { INITIAL_SCHEDULES, DEFAULT_CATEGORIES } from './utils';
import WeeklyScheduler from './components/WeeklyScheduler';
import ScheduleForm from './components/ScheduleForm';
import CategoryLegend from './components/CategoryLegend';
import StatsView from './components/StatsView';
import QuickAddPanel from './components/QuickAddPanel';
import {
  Calendar,
  Layers,
  BarChart3,
  Plus,
  RefreshCw,
  Trash2,
  Download,
  AlertTriangle,
  Clock,
  User,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function App() {
  // 1. Initialize states with localStorage support to ensure local resilience
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('schedule_planner_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved schedules', e);
      }
    }
    return INITIAL_SCHEDULES;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('schedule_planner_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved categories', e);
      }
    }
    return DEFAULT_CATEGORIES;
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [currentUtcTime, setCurrentUtcTime] = useState('2026-05-30 09:15:43');

  // Sync to localStorage when state modifies
  useEffect(() => {
    localStorage.setItem('schedule_planner_list', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem('schedule_planner_categories', JSON.stringify(categories));
  }, [categories]);

  // Live dynamic clock updating every second in UTC mode for precise, beautiful scheduling
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const utcString = now.toISOString().replace('T', ' ').substring(0, 19);
      setCurrentUtcTime(utcString);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Action Handlers
  const handleAddOrEditSubmit = (payload: Omit<ScheduleItem, 'id'> & { id?: string }) => {
    if (payload.id) {
      // Editing Mode
      setSchedules((prev) =>
        prev.map((item) =>
          item.id === payload.id ? { ...item, ...payload as ScheduleItem } : item
        )
      );
      setEditingItem(null);
    } else {
      // Adding Mode
      const newItem: ScheduleItem = {
        ...payload,
        id: `schedule-${Date.now()}`,
      };
      setSchedules((prev) => [...prev, newItem]);
    }
    setShowForm(false);
    setGlobalError(null);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('선택하신 일정을 일정 차트에서 삭제하시겠습니까?')) {
      setSchedules((prev) => prev.filter((item) => item.id !== id));
      if (editingItem?.id === id) {
        setEditingItem(null);
        setShowForm(false);
      }
    }
  };

  const handleToggleComplete = (id: string) => {
    setSchedules((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      )
    );
  };

  // Add Item with slot preset from clicking cells
  const handleAddAtSlot = (day: DayOfWeek, startTime: string) => {
    const [h, m] = startTime.split(':').map(Number);
    const endH = (h + 1).toString().padStart(2, '0');
    const endTime = `${endH}:${m.toString().padStart(2, '0')}`;

    setEditingItem(null);
    setShowForm(true);
    
    // Use an immediate timeout or state trigger to modify component default fields
    setEditingItem({
      id: '',
      title: '',
      description: '',
      day,
      startTime,
      endTime,
      category: categories[0]?.name || '개인 일상',
      isCompleted: false,
      priority: 'medium',
    });
  };

  // Reset to default sample routines
  const handleResetToDefault = () => {
    if (window.confirm('기존 데이터가 모두 지워지고 유용한 권장 계획표 예시 샘플로 완전히 되돌아갑니다. 진행하시겠습니까?')) {
      setSchedules(INITIAL_SCHEDULES);
      setCategories(DEFAULT_CATEGORIES);
      setSelectedCategory(null);
      setEditingItem(null);
      setShowForm(false);
      setGlobalError(null);
    }
  };

  // Clear entire schedules board
  const handleClearAll = () => {
    if (window.confirm('정말 보드의 모든 시간표 일정을 빈 상태로 지우시겠습니까? 삭제된 데이터는 복구할 수 없습니다.')) {
      setSchedules([]);
      setEditingItem(null);
      setShowForm(false);
      setGlobalError(null);
    }
  };

  // Custom category addition
  const handleAddCategory = (name: string) => {
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setGlobalError('이미 존재하는 카테고리 이름입니다.');
      return;
    }
    const slug = `cat-${Date.now()}`;
    const newCat = {
      id: slug,
      name,
      style: 'bg-white border-zinc-900 text-zinc-900 border-2'
    };
    setCategories((prev) => [...prev, newCat]);
    setGlobalError(null);
  };

  // Delete category tags
  const handleDeleteCategory = (id: string) => {
    const target = categories.find((c) => c.id === id);
    if (!target) return;
    
    if (window.confirm(`'${target.name}' 카테고리를 삭제하실 건가요? 해당 분류로 지정되었던 일정들은 기본 일상 분류로 변경됩니다.`)) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setSchedules((prev) =>
        prev.map((s) => (s.category === target.name ? { ...s, category: '개인 일상' } : s))
      );
      if (selectedCategory === target.name) {
        setSelectedCategory(null);
      }
    }
  };

  // Export schedules as markdown text
  const handleExportText = () => {
    let output = `# 이번 주 주간 일정 상세 보고서\n`;
    output += `* 생성기준 시각 (UTC): ${currentUtcTime}\n\n`;

    DAYS_OF_WEEK.forEach((day) => {
      const dayItems = schedules.filter((s) => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
      output += `## ${day} (${dayItems.length}개 일정)\n`;
      if (dayItems.length === 0) {
        output += `- 계획된 일정이 없습니다.\n`;
      } else {
        dayItems.forEach((item) => {
          const status = item.isCompleted ? '[완료]' : '[진행중]';
          output += `- **${item.startTime} ~ ${item.endTime}** ${status} ${item.title}`;
          if (item.description) output += ` (${item.description})`;
          output += ` | 분류: ${item.category} | 우선순위: ${item.priority}\n`;
        });
      }
      output += `\n`;
    });

    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Weekly_Schedules_${new Date().toISOString().substring(0,10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white pb-16 border-4 md:border-8 border-black">
      {/* 1. Header Banner & Identity */}
      <header className="border-b-4 border-black sticky top-0 bg-white z-50">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="border-2 border-black p-2.5 bg-black text-white square flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-heading font-black text-2xl md:text-3xl tracking-tighter text-black leading-none uppercase">
                MASTER SCHEDULE
              </h1>
              <p className="text-[10px] text-neutral-500 font-mono tracking-widest mt-1 uppercase">
                SYSTEM VERSION 4.0.2 / WEEKLY VIEW
              </p>
            </div>
          </div>

          {/* Quick Stats Summary Right Hand */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            {/* Live Clock */}
            <div className="bg-neutral-50 border-2 border-black px-3 py-1.5 square flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-black" />
              <span className="font-bold">{currentUtcTime} (UTC)</span>
            </div>

            {/* Email Account details */}
            <div className="bg-neutral-50 border-2 border-black px-3 py-1.5 square flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-black" />
              <span className="font-bold">good3brother@gmail.com</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Content Frame */}
      <main className="max-w-7xl mx-auto px-4 mt-6">
        
        {/* Helper Top notice & Tab Toggles */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`border-2 border-black px-4 py-2.5 text-xs font-heading font-black cursor-pointer transition-all flex items-center gap-1.5 square ${
                viewMode === 'grid'
                  ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white text-zinc-800 hover:bg-neutral-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              7열 주간 시간표 보드
            </button>
            
            <button
              onClick={() => setViewMode('lists')}
              className={`border-2 border-black px-4 py-2.5 text-xs font-heading font-black cursor-pointer transition-all flex items-center gap-1.5 square ${
                viewMode === 'lists'
                  ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white text-zinc-800 hover:bg-neutral-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              요일별 일정 아카이브
            </button>

            <button
              onClick={() => setViewMode('stats')}
              className={`border-2 border-black px-4 py-2.5 text-xs font-heading font-black cursor-pointer transition-all flex items-center gap-1.5 square ${
                viewMode === 'stats'
                  ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white text-zinc-800 hover:bg-neutral-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              달성률 및 데이터 통계 (표)
            </button>
          </div>

          {/* Action Row Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setEditingItem(null);
                setShowForm(!showForm);
              }}
              id="main-call-to-action"
              className="border-2 border-black bg-black text-white px-5 py-2.5 text-xs tracking-widest font-heading font-black cursor-pointer hover:bg-neutral-800 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-1.5 square uppercase"
            >
              <Plus className="w-4 h-4" />
              Add New Schedule +
            </button>

            <button
              onClick={handleExportText}
              className="border-2 border-black bg-white text-black px-4 py-2.5 text-xs font-heading font-bold hover:bg-neutral-50 cursor-pointer flex items-center justify-center gap-1 square"
              title="Markdown 파일로 주간 일정을 저장합니다."
            >
              <Download className="w-3.5 h-3.5" />
              파일 내보내기
            </button>

            <button
              onClick={handleResetToDefault}
              className="border-2 border-neutral-300 bg-white text-neutral-500 hover:border-black hover:text-black px-3 py-2.5 text-xs font-mono font-medium cursor-pointer flex items-center justify-center gap-1"
              title="샘플 차트로 채우기"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              예시 리셋
            </button>

            <button
              onClick={handleClearAll}
              className="border-2 border-neutral-300 bg-white text-neutral-400 hover:border-red-650 hover:text-red-650 px-3 py-2.5 text-xs font-mono font-medium cursor-pointer flex items-center justify-center gap-1"
              title="내용 비우기"
            >
              <Trash2 className="w-3.5 h-3.5" />
              비우기
            </button>
          </div>
        </div>

        {/* Global interactive error log */}
        {globalError && (
          <div className="p-4 border-2 border-black bg-black text-white text-xs font-mono square flex items-center justify-between mb-4 animate-fadeIn">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-white" />
              {globalError}
            </span>
            <button
              className="text-white underline font-bold cursor-pointer hover:opacity-80"
              onClick={() => setGlobalError(null)}
            >
              [확인]
            </button>
          </div>
        )}

        {/* Total Overall Progress Bar */}
        <div className="border-2 border-black p-4 bg-neutral-50 square mb-6 high-density-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-black font-heading">이번 주 일정 완수율 진척도</span>
              <span className="text-xs text-neutral-500 font-mono ml-2">
                (완료 {schedules.filter(s => s.isCompleted).length}개 / 총 {schedules.length}개)
              </span>
            </div>
            <span className="text-sm font-mono font-bold text-black">
              {schedules.length > 0 ? Math.round((schedules.filter(s => s.isCompleted).length / schedules.length) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-white h-3.5 border-2 border-black square overflow-hidden">
            <div
              className="bg-black h-full transition-all duration-500"
              style={{
                width: `${schedules.length > 0 ? (schedules.filter(s => s.isCompleted).length / schedules.length) * 100 : 0}%`
              }}
            />
          </div>
        </div>

        {/* 3. Scheduler Content Layout Grid (Columns configuration) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Left Section: Displays chosen Planner Mode component */}
          <div className={`${showForm ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all`}>
            
            {/* View Mode Router */}
            {viewMode === 'grid' && (
              <div className="space-y-4">
                <CategoryLegend
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  onAddCategory={handleAddCategory}
                  onDeleteCategory={handleDeleteCategory}
                />
                <WeeklyScheduler
                  schedules={schedules}
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onEditItem={(item) => {
                    setEditingItem(item);
                    setShowForm(true);
                  }}
                  onDeleteItem={handleDeleteItem}
                  onToggleComplete={handleToggleComplete}
                  onAddAtSlot={handleAddAtSlot}
                />
              </div>
            )}

            {viewMode === 'lists' && (
              <div className="space-y-6">
                <CategoryLegend
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  onAddCategory={handleAddCategory}
                  onDeleteCategory={handleDeleteCategory}
                />

                <div className="block md:hidden text-center text-[10px] text-neutral-500 font-medium mb-2 uppercase">
                  ← 스와이프하여 일주일 일정을 7열 표 형태로 모두 확인하세요 →
                </div>

                {/* Main 7 columns displayed list table */}
                <div className="overflow-x-auto border-4 border-black bg-black">
                  <div className="grid grid-cols-7 divide-x divide-black min-w-[1050px] md:min-w-0">
                    {DAYS_OF_WEEK.map((day) => {
                      const dayItems = schedules
                        .filter((s) => s.day === day && (selectedCategory ? s.category === selectedCategory : true))
                        .sort((a, b) => a.startTime.localeCompare(b.startTime));

                      return (
                        <div key={day} className="bg-white p-3 min-h-[480px] flex flex-col">
                          <div className="border-b-2 border-black pb-2 mb-3 text-center bg-neutral-100 py-2">
                            <span className="text-[10px] font-mono font-bold text-neutral-500">{day.substring(0,3).toUpperCase()}</span>
                            <h4 className="font-heading font-black text-sm text-black">{FullKoreanDays[day]}</h4>
                            <span className="text-[10px] font-mono font-bold text-black">({dayItems.length} PLAN)</span>
                          </div>

                          <div className="space-y-3.5 flex-1 overflow-y-auto">
                            {dayItems.map((item) => (
                              <div
                                key={item.id}
                                className={`p-3 border-2 border-black square transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                                  item.isCompleted ? 'bg-neutral-50 scale-98' : 'bg-white'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <input
                                    type="checkbox"
                                    checked={item.isCompleted}
                                    onChange={() => handleToggleComplete(item.id)}
                                    className="w-4 h-4 border-2 border-black accent-black cursor-pointer square"
                                  />
                                  <span className="text-[10px] font-mono font-black text-black bg-neutral-105 border border-black px-1.5 py-0.5">
                                    {item.startTime}
                                  </span>
                                </div>
                                <p className={`text-xs font-bold leading-tight text-black ${item.isCompleted ? 'line-through text-neutral-400 font-normal' : ''}`}>
                                  {item.title}
                                </p>
                                
                                <div className="flex items-center justify-between gap-1.5 mt-2.5 pt-1.5 border-t border-dashed border-neutral-300">
                                  <span className="text-[9px] font-mono font-black uppercase text-neutral-500">{item.priority}</span>
                                  <div className="flex gap-1.5">
                                    <button
                                      onClick={() => {
                                        setEditingItem(item);
                                        setShowForm(true);
                                      }}
                                      className="text-[10px] border border-black bg-white px-1.5 py-0.5 font-bold hover:bg-black hover:text-white cursor-pointer"
                                    >
                                      수정
                                    </button>
                                    <button
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="text-[10px] border border-black bg-white px-1.5 py-0.5 font-bold hover:bg-red-650 hover:text-white cursor-pointer"
                                    >
                                      삭제
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {dayItems.length === 0 && (
                              <div className="text-center py-8 text-[11px] font-bold text-neutral-400">
                                관리할 일정 없음
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'stats' && (
              <StatsView schedules={schedules} categories={categories} />
            )}

          </div>

          {/* Right Action Widgets Section (shown dynamically alongside the grid) */}
          {showForm && (
            <div className="lg:col-span-4 space-y-6">
              
              {/* Quick Parser section, if empty */}
              {!editingItem && (
                <QuickAddPanel
                  onAddParsedItem={(parsedItem) => {
                    setSchedules((prev) => [...prev, { ...parsedItem, id: `schedule-${Date.now()}` }]);
                    setGlobalError(null);
                  }}
                  onError={(msg) => setGlobalError(msg)}
                />
              )}

              {/* Form card section */}
              <ScheduleForm
                categories={categories}
                onSubmit={handleAddOrEditSubmit}
                editingItem={editingItem}
                onCancel={() => {
                  setEditingItem(null);
                  setShowForm(false);
                }}
                allSchedules={schedules}
              />
            </div>
          )}

        </div>
      </main>

      {/* Modern architectural Footer block */}
      <footer className="mt-20 border-t border-neutral-200 pt-8 text-center text-xs text-neutral-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p>© 2026 Schedule Planner. Built for optimized, high-contrast planning.</p>
          <div className="flex items-center gap-3">
            <span>PLATFORM: REACT WEB SPA</span>
            <span>•</span>
            <span>DESIGN: THE STARK GRID</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
