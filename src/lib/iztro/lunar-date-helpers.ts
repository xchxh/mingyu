import { Lunar, LunarYear, Solar } from 'lunar-typescript';

export type LunarDateInfo = {
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLeapMonth: boolean;
  yearLabel: string;
  monthLabel: string;
  dayLabel: string;
  fullLabel: string;
  solarDate: string;
  solarYear: number;
  solarMonth: number;
  solarDay: number;
  solarMonthDayLabel: string;
};

export type LunarMonthOption = {
  lunarYear: number;
  lunarMonth: number;
  isLeapMonth: boolean;
  label: string;
  dayCount: number;
};

const chineseDigitMap: Record<string, string> = {
  〇: '0',
  零: '0',
  一: '1',
  二: '2',
  三: '3',
  四: '4',
  五: '5',
  六: '6',
  七: '7',
  八: '8',
  九: '9',
};

const lunarDayLabels = Array.from({ length: 30 }, (_, index) =>
  Lunar.fromYmd(2026, 1, index + 1).getDayInChinese(),
);

const lunarDayLabelToNumber = new Map(
  lunarDayLabels.map((label, index) => [label, index + 1]),
);

function toSolarDateString(solar: Solar) {
  return [
    String(solar.getYear()).padStart(4, '0'),
    String(solar.getMonth()).padStart(2, '0'),
    String(solar.getDay()).padStart(2, '0'),
  ].join('-');
}

function buildLunarDateInfo(lunar: Lunar): LunarDateInfo {
  const solar = lunar.getSolar();
  const isLeapMonth = lunar.getMonth() < 0;

  return {
    lunarYear: lunar.getYear(),
    lunarMonth: lunar.getMonth(),
    lunarDay: lunar.getDay(),
    isLeapMonth,
    yearLabel: `${lunar.getYearInChinese()}年`,
    monthLabel: `${isLeapMonth ? '闰' : ''}${lunar.getMonthInChinese()}月`,
    dayLabel: lunar.getDayInChinese(),
    fullLabel: lunar.toString(),
    solarDate: toSolarDateString(solar),
    solarYear: solar.getYear(),
    solarMonth: solar.getMonth(),
    solarDay: solar.getDay(),
    solarMonthDayLabel: `${String(solar.getMonth()).padStart(2, '0')}/${String(
      solar.getDay(),
    ).padStart(2, '0')}`,
  };
}

export function getLunarDateInfoFromSolar(dateStr: string): LunarDateInfo {
  const [year, month, day] = dateStr.split('-').map(Number);
  return buildLunarDateInfo(Solar.fromYmd(year, month, day).getLunar());
}

export function getLunarDateInfoFromLunar(
  lunarYear: number,
  lunarMonth: number,
  lunarDay: number,
): LunarDateInfo {
  return buildLunarDateInfo(Lunar.fromYmd(lunarYear, lunarMonth, lunarDay));
}

export function parseLunarDateLabel(lunarDateLabel: string): LunarDateInfo {
  const matched = /^(?<year>[〇零一二三四五六七八九]{4})年(?<month>闰?[正一二三四五六七八九十冬腊]+)月(?<day>[初十廿卅一二三四五六七八九]+)$/.exec(
    lunarDateLabel.trim(),
  );

  if (!matched?.groups) {
    throw new Error(`无法解析农历日期：${lunarDateLabel}`);
  }

  const year = Number(
    matched.groups.year
      .split('')
      .map((char) => chineseDigitMap[char] ?? '')
      .join(''),
  );

  const rawMonth = matched.groups.month;
  const isLeapMonth = rawMonth.startsWith('闰');
  const monthText = isLeapMonth ? rawMonth.slice(1) : rawMonth;
  const monthMap: Record<string, number> = {
    正: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10,
    十一: 11,
    十二: 12,
    冬: 11,
    腊: 12,
  };
  const parsedMonth = monthMap[monthText];
  const parsedDay = lunarDayLabelToNumber.get(matched.groups.day);

  if (!parsedMonth || !parsedDay) {
    throw new Error(`无法解析农历日期：${lunarDateLabel}`);
  }

  return getLunarDateInfoFromLunar(
    year,
    isLeapMonth ? -parsedMonth : parsedMonth,
    parsedDay,
  );
}

export function getLunarMonthsInYear(lunarYear: number): LunarMonthOption[] {
  return LunarYear.fromYear(lunarYear)
    .getMonthsInYear()
    .map((month) => {
      const monthValue = month.getMonth();
      const label = buildLunarDateInfo(Lunar.fromYmd(lunarYear, monthValue, 1)).monthLabel;
      return {
        lunarYear,
        lunarMonth: monthValue,
        isLeapMonth: month.isLeap(),
        label,
        dayCount: month.getDayCount(),
      };
    });
}

export function resolveLunarMonthInYear(
  lunarYear: number,
  preferredMonth: number,
): number {
  const months = getLunarMonthsInYear(lunarYear);
  const exactMatch = months.find((month) => month.lunarMonth === preferredMonth);
  if (exactMatch) return exactMatch.lunarMonth;

  const fallbackMonth = months.find(
    (month) => month.lunarMonth === Math.abs(preferredMonth),
  );

  return fallbackMonth?.lunarMonth ?? months[0]?.lunarMonth ?? preferredMonth;
}

export function getLunarMonthDayCount(
  lunarYear: number,
  lunarMonth: number,
): number {
  return LunarYear.fromYear(lunarYear).getMonth(lunarMonth)?.getDayCount() ?? 29;
}
