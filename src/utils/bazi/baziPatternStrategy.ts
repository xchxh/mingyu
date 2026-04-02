import { HIDDEN_STEMS } from './baziDefinitions'
import type { PatternAnalysis, Pillars } from './baziTypes'

type GetTenGodFn = (gan: string, dayMaster: string) => string

export function determinePattern(pillars: Pillars, strengthStatus: string, getTenGod: GetTenGodFn): PatternAnalysis {
  const monthBranch = pillars.month.zhi
  const dayMaster = pillars.day.gan
  const monthStems = HIDDEN_STEMS[monthBranch] || []
  const exposedStems = [pillars.year.gan, pillars.month.gan, pillars.hour.gan]

  let patternName = ''
  const patternType = '普通格局'
  let description = ''
  let successReason = ''

  const samePartyGods = new Set(['比肩', '劫财', '正印', '偏印'])
  const observedGods = [
    pillars.year.gan,
    pillars.month.gan,
    pillars.hour.gan,
    ...Object.values(pillars).map(pillar => (HIDDEN_STEMS[pillar.zhi] || [])[0]).filter(Boolean)
  ].map((stem) => getTenGod(stem, dayMaster))

  const isPureSameParty = observedGods.length > 0 && observedGods.every(god => samePartyGods.has(god))
  const isPureOppositeParty = observedGods.length > 0 && observedGods.every(god => !samePartyGods.has(god))

  if (strengthStatus === '极强' && isPureSameParty) {
    return { pattern: '专旺格', type: '特殊格局', description: '日主极强，局中印比势盛，顺其气势为佳。', success: true, successReason: '一气专旺', isSpecial: true }
  }
  if (strengthStatus === '极弱' && isPureOppositeParty) {
    return { pattern: '从格', type: '特殊格局', description: '日主极弱，局中克泄耗势盛，弃命从势。', success: true, successReason: '弃命从势', isSpecial: true }
  }

  const monthMainQi = monthStems[0]
  const monthMainGod = getTenGod(monthMainQi, dayMaster)

  if (monthMainGod === '比肩') {
    patternName = '建禄格'
    description = '月令建禄，身旺财官有气为贵。'
  } else if (monthMainGod === '劫财') {
    patternName = '月刃格'
    description = '月令羊刃，喜七杀制伏。'
  } else {
    let foundPattern = false

    for (const stem of monthStems) {
      if (exposedStems.includes(stem)) {
        const tenGod = getTenGod(stem, dayMaster)
        if (tenGod !== '比肩' && tenGod !== '劫财') {
          patternName = `${tenGod}格`
          if (tenGod === '正官') patternName = '正官格'
          if (tenGod === '七杀') patternName = '七杀格'
          if (tenGod === '正财') patternName = '正财格'
          if (tenGod === '偏财') patternName = '偏财格'
          if (tenGod === '正印') patternName = '正印格'
          if (tenGod === '偏印') patternName = '偏印格'
          if (tenGod === '食神') patternName = '食神格'
          if (tenGod === '伤官') patternName = '伤官格'

          description = `月令透出${tenGod}，取为${patternName}。`
          successReason = `月令${monthBranch}藏${stem}透干`
          foundPattern = true
          break
        }
      }
    }

    if (!foundPattern) {
      if (monthMainGod !== '比肩' && monthMainGod !== '劫财') {
        patternName = `${monthMainGod}格`
        description = `月令本气${monthMainGod}虽未透干，但气势最强，取为${patternName}。`
        successReason = `月令本气${monthMainQi}主事`
      } else {
        patternName = monthMainGod === '比肩' ? '建禄格' : '月刃格'
        description = '月令本气为比劫，取为禄刃格。'
      }
    }
  }

  return {
    pattern: patternName || '杂气格',
    type: patternType,
    description: description || '格局气象复杂，需综合推断。',
    success: true,
    successReason,
    isSpecial: false
  }
}
