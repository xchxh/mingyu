import test from 'node:test';
import assert from 'node:assert/strict';

import { buildDivinationPrompt } from '../src/lib/divination/engine';
import type {
  DivinationData,
  DivinationType,
  SupplementaryInfo,
} from '../src/types';

function createSupplementaryInfo(): SupplementaryInfo {
  return {
    gender: '男',
    birthYear: 1995,
    meihuaSettings: {
      method: 'number',
      number: 123,
    },
  };
}

function assertStandardPromptStructure(prompt: string) {
  const expectedSections = ['【要求】', '【当前时间】', '【补充信息】', '【占卜信息】', '【问题】', '【任务】', '【输出要求】'];

  let lastIndex = -1;
  for (const section of expectedSections) {
    const index = prompt.indexOf(section);
    assert.notEqual(index, -1, `缺少 section：${section}`);
    assert.ok(index > lastIndex, `${section} 顺序不正确`);
    const headingMatches = prompt.match(new RegExp(`^${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'gm')) ?? [];
    assert.equal(headingMatches.length, 1, `${section} 不应重复出现`);
    assert.match(prompt, new RegExp(`${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n(?!\\n)`), `${section} 后应直接接正文`);
    lastIndex = index;
  }

  assert.match(prompt, /^你是资深.+/);
  assert.match(prompt, /占法：/);
  assert.match(prompt, /核心结构：/);
  assert.match(prompt, /关键提示：/);
  assert.doesNotMatch(prompt, /\*\*/);
}

function createData(method: Exclude<DivinationType, 'tarot_single'>): DivinationData {
  switch (method) {
    case 'liuyao':
      return {
        originalName: '乾为天',
        changedName: '坤为地',
        interName: '风山渐',
        ganzhi: { year: '甲子', month: '乙丑', day: '丙寅', hour: '丁卯' },
        timestamp: Date.now(),
        yaoArray: [9, 7, 8, 8, 7, 6],
        changingYaos: [{ position: 1, isChanging: true, type: '老阳' }, { position: 6, isChanging: true, type: '老阴' }],
        sixGods: ['青龙', '朱雀', '勾陈', '腾蛇', '白虎', '玄武'],
        sixRelatives: ['兄弟', '子孙', '妻财', '官鬼', '父母', '兄弟'],
        najiaDizhi: ['子', '寅', '辰', '午', '申', '戌'],
        wuxing: ['水', '木', '土', '火', '金', '土'],
        worldAndResponse: ['世', '', '', '', '', '应'],
        voidBranches: ['戌', '亥'],
        palace: { name: '乾', wuxing: '金' },
        yaosDetail: [
          { position: 1, yaoType: '阳', isChanging: true, rawValue: 9, changeType: '老阳', sixGod: '青龙', sixRelative: '兄弟', najiaDizhi: '子', wuxing: '水', isWorld: true, isResponse: false, isVoid: false, changedYao: null },
          { position: 2, yaoType: '阳', isChanging: false, rawValue: 7, changeType: '', sixGod: '朱雀', sixRelative: '子孙', najiaDizhi: '寅', wuxing: '木', isWorld: false, isResponse: false, isVoid: false, changedYao: null },
          { position: 3, yaoType: '阴', isChanging: false, rawValue: 8, changeType: '', sixGod: '勾陈', sixRelative: '妻财', najiaDizhi: '辰', wuxing: '土', isWorld: false, isResponse: false, isVoid: false, changedYao: null },
          { position: 4, yaoType: '阴', isChanging: false, rawValue: 8, changeType: '', sixGod: '腾蛇', sixRelative: '官鬼', najiaDizhi: '午', wuxing: '火', isWorld: false, isResponse: false, isVoid: false, changedYao: null },
          { position: 5, yaoType: '阳', isChanging: false, rawValue: 7, changeType: '', sixGod: '白虎', sixRelative: '父母', najiaDizhi: '申', wuxing: '金', isWorld: false, isResponse: false, isVoid: false, changedYao: null },
          { position: 6, yaoType: '阴', isChanging: true, rawValue: 6, changeType: '老阴', sixGod: '玄武', sixRelative: '兄弟', najiaDizhi: '戌', wuxing: '土', isWorld: false, isResponse: true, isVoid: true, changedYao: null },
        ],
        specialPattern: '全动卦',
        specialAdvice: '宜统观全局，不宜逐爻碎断。',
      };
    case 'meihua':
      return {
        originalName: '雷火丰',
        changedName: '地火明夷',
        interName: '泽风大过',
        ganzhi: { year: '甲子', month: '乙丑', day: '丙寅', hour: '丁卯' },
        timestamp: Date.now(),
        tiGua: { name: '离', element: '火', nature: '明' },
        yongGua: { name: '震', element: '木', nature: '动' },
        changedTiGua: { name: '坤', element: '土', nature: '顺' },
        changedYongGua: { name: '离', element: '火', nature: '明' },
        movingYao: { position: 3, description: '三爻发动', yaoName: '九三' },
        analysis: {
          season: '春',
          tiYongRelation: '用生体，主有助力',
          tiSeasonState: '相',
          yongSeasonState: '旺',
          inter1Relation: '比和',
          inter2Relation: '生',
          changedRelation: '体生变，后续需付出',
          changedTiYongRelation: '体克用',
        },
        mainHexagram: { name: '雷火丰', symbol: '䷶', upper: '震', lower: '离', description: '先盛后谨' },
        interHexagram: { name: '泽风大过', symbol: '䷛', upper: '兑', lower: '巽', description: '中间承压' },
        changedHexagram: { name: '地火明夷', symbol: '䷣', upper: '坤', lower: '离', description: '宜守光待时' },
        yaosDetail: [
          { position: 1, yaoType: '阳', isChanging: false, tiYong: '体' },
          { position: 2, yaoType: '阴', isChanging: false, tiYong: '体' },
          { position: 3, yaoType: '阳', isChanging: true, tiYong: '体' },
          { position: 4, yaoType: '阳', isChanging: false, tiYong: '用' },
          { position: 5, yaoType: '阴', isChanging: false, tiYong: '用' },
          { position: 6, yaoType: '阴', isChanging: false, tiYong: '用' },
        ],
        calculation: {
          method: 'number',
          methodKey: 'number',
          number: 123,
          externalSummary: '暂无外应，以数字起卦为主。',
        },
      };
    case 'qimen':
      return {
        jiuGongGe: [
          { gong: 1, name: '坎一宫', direction: '北', element: '水', tianPan: { star: '天蓬', stem: '壬' }, diPan: { stem: '癸' }, renPan: { door: '休门' }, shenPan: { god: '值符' } },
          { gong: 9, name: '离九宫', direction: '南', element: '火', tianPan: { star: '天英', stem: '丙' }, diPan: { stem: '丁' }, renPan: { door: '景门' }, shenPan: { god: '九天' } },
        ],
        ganzhi: { year: '甲子', month: '乙丑', day: '丙寅', hour: '丁卯' },
        isYangDun: true,
        juShu: 3,
        zhiFu: '天蓬',
        zhiShi: '休门',
        patternTags: ['门生宫', '星旺'],
        patternDetails: [{ tag: '门生宫', summary: '休门得地，利于稳步推进' }],
        palaceInsights: [{ gong: 1, name: '坎一宫', level: '有利', summary: '适合谋划与沟通' }],
        timeInfo: { solarTerm: '春分', epoch: '上元' },
        timestamp: Date.now(),
      };
    case 'tarot':
      return {
        spreadType: 'single',
        spreadName: '单牌指引',
        cards: [
          { id: 1, name: '恋人', position: '现状', reversed: false, keywords: ['选择', '连接'] },
          { id: 2, name: '战车', position: '建议', reversed: true, keywords: ['控制', '节奏'] },
        ],
        timestamp: Date.now(),
      };
    case 'ssgw':
      return {
        number: 18,
        title: '刘备借荆州',
        poem: '前路迢迢莫强求，且看云开月自明。',
        details: {
          典故: '刘备借荆州后多方周旋，需审时度势。',
          解签: '宜守正待时，不可躁进。',
        },
        timestamp: Date.now(),
        ganzhi: { year: '甲子', month: '乙丑', day: '丙寅', hour: '丁卯' },
      };
  }
}

test('各类占卜提示词都使用统一的角色加信息加问题结构', async () => {
  const methods: Exclude<DivinationType, 'tarot_single'>[] = ['liuyao', 'meihua', 'qimen', 'tarot', 'ssgw'];

  for (const method of methods) {
    const prompt = buildDivinationPrompt(
      method,
      '这件事接下来该怎么推进？',
      createData(method),
      createSupplementaryInfo()
    );
    assertStandardPromptStructure(prompt);
  }
});

test('占卜提示词的输出要求保持统一且精简', async () => {
  const session = buildDivinationPrompt(
    'qimen',
    '这件事接下来该怎么推进？',
    createData('qimen'),
    createSupplementaryInfo()
  );

  assert.match(session, /先给核心结论，再展开最关键的 2 到 4 个重点/);
  assert.match(session, /最后补一条最值得执行的提醒/);
  assert.doesNotMatch(session, /请直接回答：/);
  assert.doesNotMatch(session, /语气和表达要求/);
});
