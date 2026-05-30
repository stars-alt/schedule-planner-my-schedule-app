import { ScheduleItem, DAYS_OF_WEEK, KoreanDays } from '../types';
import { calculateDuration } from '../utils';

interface StatsViewProps {
  schedules: ScheduleItem[];
  categories: Array<{ id: string; name: string; style: string }>;
}

export default function StatsView({ schedules, categories }: StatsViewProps) {
  const totalSchedules = schedules.length;
  const completedSchedules = schedules.filter((s) => s.isCompleted).length;
  const completionRate = totalSchedules > 0 ? Math.round((completedSchedules / totalSchedules) * 100) : 0;

  // 1. Calculate time spent per category (only if scheduled)
  const categoryStats = categories.map((cat) => {
    const catSchedules = schedules.filter((s) => s.category === cat.name);
    const count = catSchedules.length;
    let totalMinutes = 0;
    catSchedules.forEach((s) => {
      totalMinutes += calculateDuration(s.startTime, s.endTime);
    });
    const hours = (totalMinutes / 60).toFixed(1);

    const completed = catSchedules.filter((s) => s.isCompleted).length;
    const catCompRate = count > 0 ? Math.round((completed / count) * 100) : 0;

    return {
      name: cat.name,
      count,
      hours,
      completed,
      catCompRate
    };
  });

  // 2. Calculate day-wise schedules
  const dayStats = DAYS_OF_WEEK.map((day) => {
    const daySchedules = schedules.filter((s) => s.day === day);
    const count = daySchedules.length;
    const completed = daySchedules.filter((s) => s.isCompleted).length;
    const rate = count > 0 ? Math.round((completed / count) * 100) : 0;

    let totalMinutes = 0;
    daySchedules.forEach((s) => {
      totalMinutes += calculateDuration(s.startTime, s.endTime);
    });
    const hours = (totalMinutes / 60).toFixed(1);

    return {
      day,
      krDay: KoreanDays[day],
      count,
      completed,
      rate,
      hours
    };
  });

  return (
    <div className="space-y-8">
      {/* 1. Quick Stats Blocks */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border-2 border-black p-4 bg-white square high-density-shadow">
          <p className="text-xs font-mono text-neutral-500 uppercase font-black">전체 등록 일정</p>
          <p className="text-2xl md:text-3xl font-heading font-black text-black mt-1">{totalSchedules}개</p>
        </div>
        <div className="border-2 border-black p-4 bg-white square high-density-shadow">
          <p className="text-xs font-mono text-neutral-500 uppercase font-black">완료된 일정</p>
          <p className="text-2xl md:text-3xl font-heading font-black text-black mt-1">{completedSchedules}개</p>
        </div>
        <div className="border-2 border-black p-4 bg-black text-white square high-density-shadow">
          <p className="text-xs font-mono text-zinc-450 uppercase font-black">전체 달성률</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl md:text-3xl font-heading font-black">{completionRate}%</span>
            <span className="text-xs font-mono text-zinc-300">({completedSchedules}/{totalSchedules})</span>
          </div>
        </div>
        <div className="border-2 border-black p-4 bg-white square high-density-shadow">
          <p className="text-xs font-mono text-neutral-500 uppercase font-black">총 계획 기한</p>
          <p className="text-2xl md:text-3xl font-heading font-black text-black mt-1">
            {schedules.reduce((acc, curr) => acc + (calculateDuration(curr.startTime, curr.endTime) / 60), 0).toFixed(1)}시간
          </p>
        </div>
      </div>

      {/* 2. Category Distribution Table */}
      <div className="border-2 border-black bg-white p-5 square high-density-shadow">
        <h3 className="font-heading font-black text-sm md:text-base text-black mb-4 flex items-center gap-2 uppercase">
          <span className="w-2.5 h-2.5 bg-black square"></span>
          CATEGORY DISTRIBUTION (카테고리별 일정 분석 통계)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse border-2 border-black">
            <thead>
              <tr className="bg-neutral-100 border-b-2 border-black font-heading font-black text-black">
                <th className="p-3 border-r-2 border-black">카테고리 분류</th>
                <th className="p-3 border-r-2 border-black text-center">등록 갯수</th>
                <th className="p-3 border-r-2 border-black text-center">총 계획 시간</th>
                <th className="p-3 border-r-2 border-black text-center">완료 갯수</th>
                <th className="p-3 text-center">달성률 (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black font-sans">
              {categoryStats.map((stat, idx) => (
                <tr key={idx} className="hover:bg-neutral-50 transition-colors font-bold border-b border-black">
                  <td className="p-3 border-r-2 border-black text-black">
                    {stat.name}
                  </td>
                  <td className="p-3 border-r-2 border-black text-center font-mono font-bold">
                    {stat.count}개
                  </td>
                  <td className="p-3 border-r-2 border-black text-center font-mono font-bold">
                    {stat.hours}hr
                  </td>
                  <td className="p-3 border-r-2 border-black text-center font-mono font-bold">
                    {stat.completed}개
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono font-black text-black">{stat.catCompRate}%</span>
                      <div className="w-16 bg-neutral-100 h-3 square overflow-hidden hidden sm:inline-block border-2 border-black">
                        <div
                          className="bg-black h-full"
                          style={{ width: `${stat.catCompRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {categoryStats.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-neutral-500 font-mono">
                    기록된 카테고리 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Day of Week Table */}
      <div className="border-2 border-black bg-white p-5 square high-density-shadow">
        <h3 className="font-heading font-black text-sm md:text-base text-black mb-4 flex items-center gap-2 uppercase">
          <span className="w-2.5 h-2.5 bg-black square"></span>
          WEEKLY PERFORMANCE (요일별 성취도 분석)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse border-2 border-black">
            <thead>
              <tr className="bg-neutral-100 border-b-2 border-black font-heading font-black text-black">
                <th className="p-3 border-r-2 border-black">요일</th>
                <th className="p-3 border-r-2 border-black text-center">등록된 일정 수</th>
                <th className="p-3 border-r-2 border-black text-center">배정된 시간총합</th>
                <th className="p-3 border-r-2 border-black text-center">완료됨</th>
                <th className="p-3 text-center">진척도</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black font-sans">
              {dayStats.map((stat, idx) => (
                <tr key={idx} className="hover:bg-neutral-50 transition-colors font-bold border-b border-black">
                  <td className="p-3 border-r-2 border-black text-black flex items-center justify-between">
                    <span>{stat.krDay}요일</span>
                    <span className="text-[10px] font-mono font-bold text-neutral-500">({stat.day.substring(0, 3).toUpperCase()})</span>
                  </td>
                  <td className="p-3 border-r-2 border-black text-center font-mono font-black text-black">
                    {stat.count}개
                  </td>
                  <td className="p-3 border-r-2 border-black text-center font-mono font-bold text-black font-mono">
                    {stat.hours}hr
                  </td>
                  <td className="p-3 border-r-2 border-black text-center font-mono font-bold text-black font-mono">
                    {stat.completed}개
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono font-black text-black">{stat.rate}%</span>
                      <div className="w-24 bg-neutral-100 h-3.5 square overflow-hidden border-2 border-black relative">
                        <div
                          className="bg-black h-full"
                          style={{ width: `${stat.rate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
