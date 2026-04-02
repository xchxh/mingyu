import { SolarTime } from 'tyme4ts';
import { getMonthDaysInfo, getYearInfo } from './calendarTool';
import type { BaziChartResult, LiunianInfo, LuckCycle } from './baziTypes';

export interface FortunePromptPayload {
  scopeLabel: string;
  summaryLines: string[];
  breakdownTitle?: string;
  breakdownLines?: string[];
}

export interface FortuneSelectionContext {
  scope: 'dayun' | 'year' | 'month' | 'day';
  cycleIndex: number;
  cycleLabel: string;
  cycleGanZhi: string;
  cycleStartYear: number;
  cycleAge: number;
  cycleType: string;
  isXiaoyun: boolean;
  year?: number;
  yearGanZhi?: string;
  yearAge?: number;
  month?: number;
  monthGanZhi?: string;
  monthLabel?: string;
  monthStartDate?: string;
  monthEndDate?: string;
  monthJieqiName?: string;
  monthJieqiDate?: string;
  yearBreakdown?: Array<{
    year: number;
    ganZhi: string;
    age: number;
  }>;
  monthBreakdown?: Array<{
    month: number;
    label: string;
    ganZhi: string;
    startDate: string;
    endDate: string;
  }>;
  dayBreakdown?: Array<{
    date: string;
    label: string;
    ganZhi: string;
  }>;
  hourBreakdown?: Array<{
    label: string;
    ganZhi: string;
  }>;
  displayLabel: string;
  displayText: string;
  promptPayload: FortunePromptPayload;
}

export interface BaziFortuneSelectionValue {
  scope: 'natal' | 'dayun' | 'year' | 'month' | 'day';
  cycleIndex?: number;
  year?: number;
  month?: number;
  day?: number;
}

function formatDate(value: number) {
  return String(value).padStart(2, '0');
}

function formatSolarDate(year: number, month: number, day: number) {
  return `${year}-${formatDate(month)}-${formatDate(day)}`;
}

function getDayHourBreakdown(year: number, month: number, day: number) {
  const hourMarks = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

  return hourMarks.map((hour) => {
    const solarTime = SolarTime.fromYmdHms(year, month, day, hour, 0, 0);
    const hourPillar = solarTime.getLunarHour().getEightChar().getHour();
    const hourBranch = hourPillar.getEarthBranch().getName();

    return {
      label: `${hourBranch}时`,
      ganZhi: hourPillar.getName(),
    };
  });
}

function formatCycleLabel(cycle: LuckCycle) {
  if (cycle.isXiaoyun || cycle.ganZhi === '小运') {
    return '童运';
  }

  return `${cycle.ganZhi}运`;
}

function formatYearLabel(yearInfo: LiunianInfo) {
  return `${yearInfo.year}年 ${yearInfo.ganZhi}`;
}

function resolveCycleIndex(result: BaziChartResult, selection: BaziFortuneSelectionValue) {
  if (!result.luckInfo.cycles.length) return -1;

  if (
    typeof selection.cycleIndex === 'number' &&
    selection.cycleIndex >= 0 &&
    selection.cycleIndex < result.luckInfo.cycles.length
  ) {
    return selection.cycleIndex;
  }

  if (typeof selection.year === 'number') {
    const matchedIndex = result.luckInfo.cycles.findIndex((cycle) =>
      cycle.years.some((item) => item.year === selection.year),
    );
    if (matchedIndex >= 0) {
      return matchedIndex;
    }
  }

  const currentYear = new Date().getFullYear();
  const currentCycleIndex = result.luckInfo.cycles.findIndex((cycle) =>
    cycle.years.some((item) => item.year === currentYear),
  );
  return currentCycleIndex >= 0 ? currentCycleIndex : 0;
}

function resolveSelectedYear(cycle: LuckCycle | undefined, selection: BaziFortuneSelectionValue) {
  if (!cycle?.years.length) return undefined;

  if (
    typeof selection.year === 'number' &&
    cycle.years.some((item) => item.year === selection.year)
  ) {
    return selection.year;
  }

  const currentYear = new Date().getFullYear();
  const currentItem = cycle.years.find((item) => item.year === currentYear);
  return currentItem?.year ?? cycle.years[0]?.year;
}

function resolveSelectedMonth(selection: BaziFortuneSelectionValue) {
  if (typeof selection.month === 'number' && selection.month >= 1 && selection.month <= 12) {
    return selection.month;
  }

  return new Date().getMonth() + 1;
}

function resolveSelectedDay(
  year: number | undefined,
  month: number | undefined,
  selection: BaziFortuneSelectionValue,
) {
  if (!year || !month) return undefined;
  const maxDay = new Date(year, month, 0).getDate();

  if (typeof selection.day === 'number' && selection.day >= 1 && selection.day <= maxDay) {
    return selection.day;
  }

  return Math.min(new Date().getDate(), maxDay);
}

export function normalizeFortuneSelection(
  result: BaziChartResult,
  selection: BaziFortuneSelectionValue,
): BaziFortuneSelectionValue {
  if (selection.scope === 'natal' || !result.luckInfo.cycles.length) {
    return { scope: 'natal' };
  }

  const cycleIndex = resolveCycleIndex(result, selection);
  const cycle = result.luckInfo.cycles[cycleIndex];

  if (!cycle) {
    return { scope: 'natal' };
  }

  const year = resolveSelectedYear(cycle, selection);

  if (selection.scope === 'dayun') {
    return {
      scope: 'dayun',
      cycleIndex,
      year,
    };
  }

  if (!year) {
    return {
      scope: 'dayun',
      cycleIndex,
    };
  }

  const month = resolveSelectedMonth(selection);

  if (selection.scope === 'year') {
    return {
      scope: 'year',
      cycleIndex,
      year,
      month,
    };
  }

  const day = resolveSelectedDay(year, month, selection);

  if (selection.scope === 'month') {
    return {
      scope: 'month',
      cycleIndex,
      year,
      month,
      day,
    };
  }

  return {
    scope: 'day',
    cycleIndex,
    year,
    month,
    day,
  };
}

export function buildFortuneSelectionContext(
  result: BaziChartResult,
  selection: BaziFortuneSelectionValue,
): FortuneSelectionContext | null {
  const normalized = normalizeFortuneSelection(result, selection);
  if (normalized.scope === 'natal') {
    return null;
  }

  const cycle = result.luckInfo.cycles[normalized.cycleIndex ?? -1];
  if (!cycle) {
    return null;
  }

  const cycleLabel = formatCycleLabel(cycle);
  const yearItem = cycle.years.find((item) => item.year === normalized.year);
  const monthInfoList = normalized.year ? getYearInfo(normalized.year).months : [];
  const monthInfo = normalized.month ? monthInfoList[normalized.month - 1] : undefined;
  const dayInfoList =
    normalized.year && normalized.month
      ? getMonthDaysInfo(normalized.year, normalized.month)
      : [];
  const dayInfo = dayInfoList.find((item) => item.day === normalized.day);

  const baseContext = {
    cycleIndex: normalized.cycleIndex ?? 0,
    cycleLabel,
    cycleGanZhi: cycle.ganZhi,
    cycleStartYear: cycle.year,
    cycleAge: cycle.age,
    cycleType: cycle.type,
    isXiaoyun: cycle.isXiaoyun,
    year: yearItem?.year,
    yearGanZhi: yearItem?.ganZhi,
    yearAge: yearItem?.age,
  };

  if (normalized.scope === 'dayun') {
    const breakdown = cycle.years.map((item) => ({
      year: item.year,
      ganZhi: item.ganZhi,
      age: item.age,
    }));

    return {
      ...baseContext,
      scope: 'dayun',
      yearBreakdown: breakdown,
      displayLabel: cycleLabel,
      displayText: `${cycleLabel}（${cycle.year}年起，${cycle.age}岁交运）`,
      promptPayload: {
        scopeLabel: `当前选择：${cycleLabel}`,
        summaryLines: [
          `大运干支：${cycle.ganZhi}`,
          `起运年份：${cycle.year}年`,
          `起运年龄：${cycle.age}岁`,
          cycle.isXiaoyun ? '类型：未起运，行童运' : `类型：${cycle.type === '小运' ? '童运' : cycle.type}`,
        ],
        breakdownTitle: '该大运包含的流年',
        breakdownLines: breakdown.map((item) => `${item.year}年（${item.age}岁） ${item.ganZhi}`),
      },
    };
  }

  if (!yearItem) {
    return null;
  }

  if (normalized.scope === 'year') {
    const breakdown = monthInfoList.map((item, index) => ({
      month: index + 1,
      label: item.month,
      ganZhi: item.ganZhi,
      startDate: '',
      endDate: '',
    }));

    return {
      ...baseContext,
      scope: 'year',
      monthBreakdown: breakdown,
      displayLabel: formatYearLabel(yearItem),
      displayText: `${yearItem.year}年 ${yearItem.ganZhi}（${yearItem.age}岁）`,
      promptPayload: {
        scopeLabel: `当前选择：${yearItem.year}年流年`,
        summaryLines: [
          `所属大运：${cycleLabel}`,
          `流年干支：${yearItem.ganZhi}`,
          `对应年龄：${yearItem.age}岁`,
        ].filter(Boolean) as string[],
        breakdownTitle: '该流年包含的流月',
        breakdownLines: breakdown.map((item) => `${item.month}月（${item.label}） ${item.ganZhi}`),
      },
    };
  }

  if (!monthInfo || !normalized.month) {
    return null;
  }

  if (normalized.scope === 'month') {
    const breakdown = dayInfoList.map((item) => ({
      date: formatSolarDate(yearItem.year, normalized.month!, item.day),
      label: `${item.day}日`,
      ganZhi: item.ganZhi,
    }));

    return {
      ...baseContext,
      scope: 'month',
      month: normalized.month,
      monthGanZhi: monthInfo.ganZhi,
      monthLabel: monthInfo.month,
      monthBreakdown: [
        {
          month: normalized.month,
          label: monthInfo.month,
          ganZhi: monthInfo.ganZhi,
          startDate: '',
          endDate: '',
        },
      ],
      dayBreakdown: breakdown,
      displayLabel: `${yearItem.year}年${normalized.month}月`,
      displayText: `${yearItem.year}年 ${normalized.month}月（${monthInfo.month} ${monthInfo.ganZhi}）`,
      promptPayload: {
        scopeLabel: `当前选择：${yearItem.year}年${normalized.month}月流月`,
        summaryLines: [
          `所属大运：${cycleLabel}`,
          `所属流年：${yearItem.year}年 ${yearItem.ganZhi}`,
          `流月：${monthInfo.month} ${monthInfo.ganZhi}`,
        ],
        breakdownTitle: '该流月包含的流日',
        breakdownLines: breakdown.map((item) => `${item.date} ${item.ganZhi}`),
      },
    };
  }

  if (!dayInfo || !normalized.day) {
    return null;
  }

  const selectedMonth = normalized.month!;
  const selectedDay = normalized.day;
  const hourBreakdown = getDayHourBreakdown(yearItem.year, selectedMonth, selectedDay);

  return {
    ...baseContext,
    scope: 'day',
    month: normalized.month,
    monthGanZhi: monthInfo.ganZhi,
    monthLabel: monthInfo.month,
    hourBreakdown,
    dayBreakdown: [
      {
        date: formatSolarDate(yearItem.year, selectedMonth, selectedDay),
        label: `${selectedDay}日`,
        ganZhi: dayInfo.ganZhi,
      },
    ],
    displayLabel: `${yearItem.year}-${formatDate(selectedMonth)}-${formatDate(selectedDay)}`,
    displayText: `${yearItem.year}-${formatDate(selectedMonth)}-${formatDate(selectedDay)}（${dayInfo.ganZhi}）`,
    promptPayload: {
      scopeLabel: `当前选择：${yearItem.year}-${formatDate(selectedMonth)}-${formatDate(selectedDay)}流日`,
      summaryLines: [
        `所属大运：${cycleLabel}`,
        `所属流年：${yearItem.year}年 ${yearItem.ganZhi}`,
        `所属流月：${monthInfo.month} ${monthInfo.ganZhi}`,
        `流日：${formatSolarDate(yearItem.year, selectedMonth, selectedDay)} ${dayInfo.ganZhi}`,
      ],
      breakdownTitle: '该流日包含的流时',
      breakdownLines: hourBreakdown.map((item) => `${item.label} ${item.ganZhi}`),
    },
  };
}
