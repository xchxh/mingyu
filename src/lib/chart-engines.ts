import { LunarHour, SolarTime } from 'tyme4ts';
import { ZIWEI_ANALYST_ROLE } from '@/lib/ziwei-prompt-copy';

export const BIRTH_TIME_OPTIONS = [
  { label: '早子时', range: '0:00-1:00', hour: 0 },
  { label: '丑时', range: '1:00-3:00', hour: 1 },
  { label: '寅时', range: '3:00-5:00', hour: 3 },
  { label: '卯时', range: '5:00-7:00', hour: 5 },
  { label: '辰时', range: '7:00-9:00', hour: 7 },
  { label: '巳时', range: '9:00-11:00', hour: 9 },
  { label: '午时', range: '11:00-13:00', hour: 11 },
  { label: '未时', range: '13:00-15:00', hour: 13 },
  { label: '申时', range: '15:00-17:00', hour: 15 },
  { label: '酉时', range: '17:00-19:00', hour: 17 },
  { label: '戌时', range: '19:00-21:00', hour: 19 },
  { label: '亥时', range: '21:00-23:00', hour: 21 },
  { label: '晚子时', range: '23:00-24:00', hour: 23 },
] as const;

type BaziInput = {
  birthDate: string;
  dateType: 'solar' | 'lunar';
  birthTimeIndex: number;
  gender: 'male' | 'female';
  isLeapMonth?: boolean;
  question?: string;
  task?: string;
};

type ZiweiInput = {
  name?: string;
  birthDate: string;
  dateType: 'solar' | 'lunar';
  birthTimeIndex: number;
  gender: '男' | '女';
  isLeapMonth?: boolean;
  question?: string;
  task?: string;
};

export type PromptPack = {
  system: string;
  user: string;
};

export type BaziChartSummary = {
  kind: 'bazi';
  displayText: string;
  promptText: string;
  prompt: PromptPack;
  summaryCards: Array<{ label: string; value: string }>;
};

export type ZiweiPalaceCard = {
  name: string;
  heavenlyStem: string;
  earthlyBranch: string;
  majorStars: string[];
  minorStars: string[];
  otherStars: string[];
};

export type ZiweiChartSummary = {
  kind: 'ziwei';
  displayText: string;
  promptText: string;
  prompt: PromptPack;
  summaryCards: Array<{ label: string; value: string }>;
  palaces: ZiweiPalaceCard[];
};

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
const STEM_WUXING = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'] as const;
const BRANCH_WUXING = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'] as const;

function parseDateParts(dateStr: string) {
  const matched = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(dateStr.trim());
  if (!matched) {
    throw new Error('日期格式不正确，请使用 YYYY-MM-DD。');
  }

  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[3]);

  if (!year || month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error('日期范围不正确。');
  }

  return { year, month, day };
}

function getBirthHour(timeIndex: number) {
  const option = BIRTH_TIME_OPTIONS[timeIndex];
  if (!option) {
    throw new Error('时辰索引无效。');
  }

  return option;
}

function getWuxing(char: string) {
  const stemIndex = HEAVENLY_STEMS.indexOf(char as (typeof HEAVENLY_STEMS)[number]);
  if (stemIndex >= 0) return STEM_WUXING[stemIndex];

  const branchIndex = EARTHLY_BRANCHES.indexOf(char as (typeof EARTHLY_BRANCHES)[number]);
  if (branchIndex >= 0) return BRANCH_WUXING[branchIndex];

  return '未知';
}

function getTenGod(targetGan: string, dayMaster: string) {
  const ganIndex = HEAVENLY_STEMS.indexOf(targetGan as (typeof HEAVENLY_STEMS)[number]);
  const dayMasterIndex = HEAVENLY_STEMS.indexOf(dayMaster as (typeof HEAVENLY_STEMS)[number]);
  if (ganIndex === -1 || dayMasterIndex === -1) return '未知';

  const tenGodMatrix = [
    ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印'],
    ['劫财', '比肩', '伤官', '食神', '正财', '偏财', '正官', '七杀', '正印', '偏印'],
    ['偏印', '正印', '比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官'],
    ['正印', '偏印', '劫财', '比肩', '伤官', '食神', '正财', '偏财', '正官', '七杀'],
    ['七杀', '正官', '偏印', '正印', '比肩', '劫财', '食神', '伤官', '偏财', '正财'],
    ['正官', '七杀', '正印', '偏印', '劫财', '比肩', '伤官', '食神', '正财', '偏财'],
    ['偏财', '正财', '七杀', '正官', '偏印', '正印', '比肩', '劫财', '食神', '伤官'],
    ['正财', '偏财', '正官', '七杀', '正印', '偏印', '劫财', '比肩', '伤官', '食神'],
    ['食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印', '比肩', '劫财'],
    ['伤官', '食神', '正财', '偏财', '正官', '七杀', '正印', '偏印', '劫财', '比肩'],
  ];

  return tenGodMatrix[dayMasterIndex][ganIndex];
}

function buildBaziPrompt(promptText: string, question?: string, task?: string): PromptPack {
  return {
    system: [
      '你是资深八字命理师，熟悉四柱、十神、旺衰、格局和岁运分析。',
      '要求：',
      '- 只基于提供的排盘信息与问题作答。',
      '- 先给判断，再讲依据和建议。',
      '- 尽量把依据落到四柱、十神、五行和岁运关系。',
      '- 使用简体中文，不写空话。',
    ].join('\n'),
    user: [
      `当前时间：${new Date().toLocaleString('zh-CN')}`,
      `命盘信息：\n${promptText}`,
      `问题：${question?.trim() || '请先做整体解读。'}`,
      `任务：${task?.trim() || '结合命盘结构，给出核心判断、关键依据和行动建议。'}`,
      '输出：先给结论，再展开最关键的 2 到 4 个重点。',
    ].join('\n\n'),
  };
}

function buildZiweiPrompt(promptText: string, question?: string, task?: string): PromptPack {
  return {
    system: [
      ZIWEI_ANALYST_ROLE,
      '要求：',
      '- 只基于提供的盘面和运限信息作答。',
      '- 保持证据对应，结论尽量落到宫位、主星和运限触发。',
      '- 如果盘面没有直接证据，要明确说明。',
      '- 使用简体中文 Markdown。',
    ].join('\n'),
    user: [
      `当前时间：${new Date().toLocaleString('zh-CN')}`,
      `【盘面信息】\n${promptText}`,
      `【问题】\n${question?.trim() || '请先做整体解读。'}`,
      `【任务】\n${task?.trim() || '结合盘面结构与当前运限，给出核心判断、关键依据和建议。'}`,
      '【输出要求】\n先给结论，再展开最关键的 2 到 4 个重点；每个重点都要写明盘面依据与建议。',
    ].join('\n\n'),
  };
}

export function calculateBaziChart(input: BaziInput): BaziChartSummary {
  const { year, month, day } = parseDateParts(input.birthDate);
  const timeOption = getBirthHour(input.birthTimeIndex);

  let solarTime: any;
  let lunarHour: any;

  if (input.dateType === 'lunar') {
    const lunarMonth = input.isLeapMonth ? -Math.abs(month) : month;
    lunarHour = LunarHour.fromYmdHms(year, lunarMonth, day, timeOption.hour, 0, 0);
    solarTime = lunarHour.getSolarTime();
  } else {
    solarTime = SolarTime.fromYmdHms(year, month, day, timeOption.hour, 0, 0);
    lunarHour = solarTime.getLunarHour();
  }

  const eightChar = lunarHour.getEightChar();
  const yearPillar = eightChar.getYear();
  const monthPillar = eightChar.getMonth();
  const dayPillar = eightChar.getDay();
  const hourPillar = eightChar.getHour();
  const pillars = [
    { label: '年柱', gan: yearPillar.getHeavenStem().getName(), zhi: yearPillar.getEarthBranch().getName() },
    { label: '月柱', gan: monthPillar.getHeavenStem().getName(), zhi: monthPillar.getEarthBranch().getName() },
    { label: '日柱', gan: dayPillar.getHeavenStem().getName(), zhi: dayPillar.getEarthBranch().getName() },
    { label: '时柱', gan: hourPillar.getHeavenStem().getName(), zhi: hourPillar.getEarthBranch().getName() },
  ];
  const dayMaster = pillars[2].gan;
  const wuxingCount = new Map<string, number>([
    ['木', 0],
    ['火', 0],
    ['土', 0],
    ['金', 0],
    ['水', 0],
  ]);

  pillars.forEach((pillar) => {
    wuxingCount.set(getWuxing(pillar.gan), (wuxingCount.get(getWuxing(pillar.gan)) ?? 0) + 1);
    wuxingCount.set(getWuxing(pillar.zhi), (wuxingCount.get(getWuxing(pillar.zhi)) ?? 0) + 1);
  });

  const currentYear = new Date().getFullYear();
  const currentYearPillar = SolarTime.fromYmdHms(currentYear, 6, 1, 0, 0, 0).getLunarHour().getEightChar().getYear();
  const currentYearGan = currentYearPillar.getHeavenStem().getName();
  const currentYearZhi = currentYearPillar.getEarthBranch().getName();
  const promptText = [
    '【基础信息】',
    `性别：${input.gender === 'male' ? '男' : '女'}`,
    `公历：${solarTime.getYear()}-${String(solarTime.getMonth()).padStart(2, '0')}-${String(solarTime.getDay()).padStart(2, '0')}`,
    `农历：${lunarHour.getLunarDay().getLunarMonth().getLunarYear().getYear()}年${lunarHour.getLunarDay().getLunarMonth().getName()}${lunarHour.getLunarDay().getName()}`,
    `时辰：${timeOption.label}（${timeOption.range}）`,
    `生肖：${lunarHour.getLunarDay().getLunarMonth().getLunarYear().getSixtyCycle().getEarthBranch().getZodiac().getName()}`,
    `星座：${solarTime.getSolarDay().getConstellation().getName()}`,
    `日主：${dayMaster}`,
    '',
    '【四柱】',
    ...pillars.map((pillar) => {
      const ganZhi = `${pillar.gan}${pillar.zhi}`;
      const tenGod = pillar.label === '日柱' ? '日主' : getTenGod(pillar.gan, dayMaster);
      return `${pillar.label}：${ganZhi} | 天干十神：${tenGod} | 五行：${getWuxing(pillar.gan)}/${getWuxing(pillar.zhi)}`;
    }),
    '',
    '【五行统计】',
    Array.from(wuxingCount.entries()).map(([key, value]) => `${key}:${value}`).join('  '),
    '',
    '【当前流年】',
    `${currentYear}年：${currentYearGan}${currentYearZhi} | 对日主十神：${getTenGod(currentYearGan, dayMaster)}`,
  ].join('\n');

  return {
    kind: 'bazi',
    displayText: promptText,
    promptText,
    prompt: buildBaziPrompt(promptText, input.question, input.task),
    summaryCards: [
      { label: '日主', value: dayMaster },
      { label: '年柱', value: `${pillars[0].gan}${pillars[0].zhi}` },
      { label: '月柱', value: `${pillars[1].gan}${pillars[1].zhi}` },
      { label: '日柱', value: `${pillars[2].gan}${pillars[2].zhi}` },
      { label: '时柱', value: `${pillars[3].gan}${pillars[3].zhi}` },
      { label: '生肖', value: lunarHour.getLunarDay().getLunarMonth().getLunarYear().getSixtyCycle().getEarthBranch().getZodiac().getName() },
    ],
  };
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function hourToIndex(hour: number) {
  if (hour === 0) return 0;
  if (hour === 23) return 12;
  return Math.floor((hour + 1) / 2);
}

function joinStarNames(items: any[]) {
  return items.length > 0 ? items.map((item) => item.name).join('、') : '无';
}

export async function calculateZiweiChart(input: ZiweiInput): Promise<ZiweiChartSummary> {
  const { astro } = await import('iztro');
  const astrolabe = astro.withOptions({
    type: input.dateType,
    dateStr: input.birthDate.trim(),
    timeIndex: input.birthTimeIndex,
    gender: input.gender,
    isLeapMonth: input.isLeapMonth ?? false,
    fixLeap: true,
    astroType: 'earth',
    language: 'zh-CN',
    config: {
      algorithm: 'default',
      yearDivide: 'normal',
      horoscopeDivide: 'normal',
      ageDivide: 'normal',
      dayDivide: 'current',
    },
  }) as any;

  const now = new Date();
  const horoscope = astrolabe.horoscope(formatLocalDate(now), hourToIndex(now.getHours())) as any;
  const palaces: ZiweiPalaceCard[] = astrolabe.palaces.map((palace: any) => ({
    name: palace.name,
    heavenlyStem: palace.heavenlyStem,
    earthlyBranch: palace.earthlyBranch,
    majorStars: palace.majorStars.map((star: any) => star.name),
    minorStars: palace.minorStars.map((star: any) => star.name),
    otherStars: palace.adjectiveStars.map((star: any) => star.name),
  }));

  const promptText = [
    '【基础信息】',
    `姓名：${input.name?.trim() || '未填写'}`,
    `性别：${astrolabe.gender}`,
    `阳历生日：${astrolabe.solarDate}`,
    `农历生日：${astrolabe.lunarDate}`,
    `出生时辰：${astrolabe.time}（${astrolabe.timeRange}）`,
    `生肖：${astrolabe.zodiac}`,
    `星座：${astrolabe.sign}`,
    `五行局：${astrolabe.fiveElementsClass}`,
    `命主：${astrolabe.soul}`,
    `身主：${astrolabe.body}`,
    '',
    '【当前运限】',
    `参考日期：${horoscope.solarDate}`,
    `大限：${horoscope.decadal?.name || '未取到'}（${horoscope.decadal?.heavenlyStem || ''}${horoscope.decadal?.earthlyBranch || ''}）`,
    `流年：${horoscope.yearly?.name || '未取到'}（${horoscope.yearly?.heavenlyStem || ''}${horoscope.yearly?.earthlyBranch || ''}）`,
    `流月：${horoscope.monthly?.name || '未取到'}（${horoscope.monthly?.heavenlyStem || ''}${horoscope.monthly?.earthlyBranch || ''}）`,
    `流日：${horoscope.daily?.name || '未取到'}（${horoscope.daily?.heavenlyStem || ''}${horoscope.daily?.earthlyBranch || ''}）`,
    '',
    '【十二宫】',
    ...palaces.map((palace) =>
      `${palace.name}（${palace.heavenlyStem}${palace.earthlyBranch}）：主星 ${joinStarNames(
        palace.majorStars.map((name) => ({ name })),
      )}；辅星 ${joinStarNames(palace.minorStars.map((name) => ({ name })))}；杂曜 ${joinStarNames(
        palace.otherStars.map((name) => ({ name })),
      )}`,
    ),
  ].join('\n');

  return {
    kind: 'ziwei',
    displayText: promptText,
    promptText,
    prompt: buildZiweiPrompt(promptText, input.question, input.task),
    summaryCards: [
      { label: '命主', value: astrolabe.soul },
      { label: '身主', value: astrolabe.body },
      { label: '五行局', value: astrolabe.fiveElementsClass },
      { label: '命宫地支', value: astrolabe.earthlyBranchOfSoulPalace },
      { label: '身宫地支', value: astrolabe.earthlyBranchOfBodyPalace },
      { label: '当前大限', value: horoscope.decadal?.name || '未取到' },
    ],
    palaces,
  };
}
