import React, { useState, useEffect } from 'react';
import { ScheduleItem, DayOfWeek, DAYS_OF_WEEK, KoreanDays } from '../types';
import { X, Check } from 'lucide-react';
import { checkOverlap } from '../utils';

interface ScheduleFormProps {
  categories: Array<{ id: string; name: string; style: string }>;
  onSubmit: (item: Omit<ScheduleItem, 'id'> & { id?: string }) => void;
  editingItem: ScheduleItem | null;
  onCancel: () => void;
  allSchedules: ScheduleItem[];
}

export default function ScheduleForm({
  categories,
  onSubmit,
  editingItem,
  onCancel,
  allSchedules,
}: ScheduleFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [day, setDay] = useState<DayOfWeek>('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [errorMessage, setErrorMessage] = useState('');

  // Sync state if we are editing an item
  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title);
      setDescription(editingItem.description || '');
      setDay(editingItem.day);
      setStartTime(editingItem.startTime);
      setEndTime(editingItem.endTime);
      setCategory(editingItem.category);
      setPriority(editingItem.priority);
    } else {
      resetForm();
    }
    setErrorMessage('');
  }, [editingItem, categories]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDay('Monday');
    setStartTime('09:00');
    setEndTime('10:00');
    if (categories.length > 0) {
      setCategory(categories[0].name);
    }
    setPriority('medium');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('일정 핵심 제목을 입력해 주세요.');
      return;
    }

    // Validate that end time is strictly greater than start time
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    if (endMins <= startMins) {
      setErrorMessage('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }

    // Create item payload format to check overlaps
    const payload: ScheduleItem = {
      id: editingItem?.id || 'temp-id',
      title: title.trim(),
      description: description.trim() || undefined,
      day,
      startTime,
      endTime,
      category,
      isCompleted: editingItem?.isCompleted || false,
      priority,
    };

    // Check overlaps
    const duplicate = checkOverlap(payload, allSchedules);
    if (duplicate) {
      setErrorMessage(
        `🚨 해당 시간에 이미 일정이 있습니다: '${duplicate.title}' (${duplicate.startTime} ~ ${duplicate.endTime})`
      );
      return;
    }

    onSubmit({
      id: editingItem?.id,
      title: title.trim(),
      description: description.trim() || undefined,
      day,
      startTime,
      endTime,
      category,
      isCompleted: editingItem?.isCompleted ?? false,
      priority,
    });

    if (!editingItem) {
      resetForm();
    }
  };

  return (
    <div className="border border-neutral-900 bg-white p-5 square flex flex-col h-full high-density-shadow">
      <div className="flex items-center justify-between border-b-2 pb-3 mb-4 border-black">
        <h3 className="font-heading font-black text-sm md:text-base tracking-tight text-black flex items-center gap-2 uppercase">
          <span className="w-2.5 h-2.5 bg-black inline-block square"></span>
          {editingItem ? 'EDIT SCHEDULE' : 'ADD SCHEDULE DETAILS'}
        </h3>
        <button
          onClick={onCancel}
          className="text-neutral-500 hover:text-black p-1 cursor-pointer transition-colors"
          title="닫기"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-1">
        {errorMessage && (
          <div className="p-3 bg-black text-white border-l-4 border-red-500 text-xs font-mono square leading-relaxed">
            {errorMessage}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-black text-black uppercase tracking-wider mb-1">
            일정 제목 *
          </label>
          <input
            type="text"
            placeholder="상세 일정 핵심 타이틀"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-2 border-black bg-white p-2 text-sm text-black font-semibold square"
            maxLength={60}
            required
          />
        </div>

        {/* Day selection */}
        <div>
          <label className="block text-xs font-black text-black uppercase tracking-wider mb-1">
            수행 요일 *
          </label>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value as DayOfWeek)}
            className="w-full border-2 border-black bg-white p-2 text-sm text-black font-bold square cursor-pointer"
          >
            {DAYS_OF_WEEK.map((d) => (
              <option key={d} value={d}>
                {KoreanDays[d]}요일 ({d})
              </option>
            ))}
          </select>
        </div>

        {/* Time inputs side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-black text-black uppercase tracking-wider mb-1">
              시작 시간 *
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border-2 border-black bg-white p-2 text-sm text-black font-mono font-bold square cursor-pointer"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black text-black uppercase tracking-wider mb-1">
              종료 시간 *
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border-2 border-black bg-white p-2 text-sm text-black font-mono font-bold square cursor-pointer"
              required
            />
          </div>
        </div>

        {/* Category & Priority in one line */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-black text-black uppercase tracking-wider mb-1">
              카테고리 분류
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border-2 border-black bg-white p-2 text-sm text-black font-bold square cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-black uppercase tracking-wider mb-1">
              우선 순위
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full border-2 border-black bg-white p-2 text-sm text-black font-bold square cursor-pointer"
            >
              <option value="low">낮음</option>
              <option value="medium">보통</option>
              <option value="high">높음</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-black text-black uppercase tracking-wider mb-1">
            상세 내용 (메모)
          </label>
          <textarea
            placeholder="상세한 메모나 세부 목적 목록을 남겨주세요."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border-2 border-black bg-white p-2 text-sm text-black font-semibold square resize-none"
          />
        </div>

        {/* CTAs */}
        <div className="pt-4 flex gap-2 border-t-2 border-black">
          <button
            type="submit"
            id="submit-schedule-btn"
            className="flex-1 border-2 border-black bg-black text-white font-heading font-black text-xs uppercase py-3 px-4 cursor-pointer hover:bg-neutral-800 flex items-center justify-center gap-1.5 square transition-all"
          >
            <Check className="w-4 h-4" />
            SAVE SCHEDULE
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="border-2 border-black bg-white text-black font-heading font-bold text-xs uppercase py-3 px-4 cursor-pointer square transition-all hover:bg-neutral-100"
          >
            CANCEL
          </button>
        </div>
      </form>
    </div>
  );
}
