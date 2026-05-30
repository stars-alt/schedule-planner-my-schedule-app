import React, { useState } from 'react';
import { parseSmartQuickAdd } from '../utils';
import { Zap, Command, CornerDownLeft } from 'lucide-react';
import { ScheduleItem } from '../types';

interface QuickAddPanelProps {
  onAddParsedItem: (item: Omit<ScheduleItem, 'id'>) => void;
  onError: (msg: string) => void;
}

export default function QuickAddPanel({ onAddParsedItem, onError }: QuickAddPanelProps) {
  const [inputText, setInputText] = useState('');

  const EXAMPLE_PILLS = [
    '월요일 09:00 주간 기획 회의',
    '수요일 14:00 팀 미팅',
    '토 19:30 러닝 크루 조깅',
    '일요일 10:00-11:30 대청소 및 분리수거'
  ];

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const parsed = parseSmartQuickAdd(inputText);
    if (!parsed) {
      onError('해당 문장으로 일정을 파싱할 수 없습니다. "요일 시간 일정내용" 구조로 작성해 주세요. (예: 월요일 09:00 업무 회의)');
      return;
    }

    onAddParsedItem(parsed as Omit<ScheduleItem, 'id'>);
    setInputText('');
  };

  return (
    <div className="border-2 border-black bg-white p-4 square mb-6 high-density-shadow">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-5 h-5 text-black fill-black" />
        <h3 className="font-heading font-black text-xs md:text-sm tracking-tight text-black flex items-center gap-1.5 uppercase">
          한 줄 번개 등록 (Smart Syntax Parser)
        </h3>
        <span className="text-[10px] bg-black text-white font-mono px-1.5 py-0.5 font-bold">BETA</span>
      </div>

      <p className="text-[11px] text-neutral-600 mb-3 leading-relaxed font-semibold">
        요일과 시간, 해야 할 일을 한 줄로 편하게 입력해 보세요. 똑똑하게 분석하여 해당 시간표 보드 칸에 일정을 바로 꽂아 줍니다.
      </p>

      <form onSubmit={handleQuickAddSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="예시: 월요일 13:00 클라이언트 제안 업무 미팅"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full border-2 border-black bg-white pl-3 pr-12 py-2 text-xs font-sans text-black font-semibold square h-11"
          />
          <div className="absolute right-2.5 top-3 text-[9px] font-mono text-black bg-white px-1 border-2 border-black pointer-events-none hidden sm:flex items-center gap-0.5 font-bold">
            <Command className="w-2.5 h-2.5" />
            <span>Enter</span>
          </div>
        </div>
        <button
          type="submit"
          id="btn-quick-parse-submit"
          className="border-2 border-black bg-black text-white px-4 py-2 text-xs font-heading font-black hover:bg-neutral-800 transition-all flex items-center gap-1 cursor-pointer square h-11 uppercase"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
          빠른 추가
        </button>
      </form>

      {/* Preset click pills */}
      <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t-2 border-dashed border-black">
        <span className="text-[10px] text-black font-black uppercase">추천 예시 클릭:</span>
        {EXAMPLE_PILLS.map((pill, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setInputText(pill)}
            className="text-[10px] font-mono border-2 border-black bg-neutral-50 hover:bg-black hover:text-white text-black font-semibold px-2 py-1 square transition-all cursor-pointer"
          >
            {pill}
          </button>
        ))}
      </div>
    </div>
  );
}
