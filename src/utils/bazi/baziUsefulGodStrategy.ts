import { BASIC_MAPPINGS } from './baziDefinitions'
import type { PatternAnalysis, UsefulGodAnalysis } from './baziTypes'
import {
  applyClimateAdjustment,
  applyTherapeuticPriority,
  resolveClimateUsefulWuxing,
  resolveTherapeuticHint,
  resolveTherapeuticHintRuleId,
  resolveTherapeuticPriorityWuxing
} from './baziTherapeuticStrategy'
import {
  BASE_USEFUL_GOD_RULES,
  USEFUL_GOD_SUMMARY_RULES,
  type UsefulGodWuxingBundle
} from './baziUsefulGodRules'
import { matchFirstRule } from './baziRuleMatcher'
import { CLIMATE_RULES, THERAPEUTIC_PRIORITY_RULES } from './baziTherapeuticRules'
import { resolveRuleMetadataList } from './baziRuleCatalog'

interface UsefulGodDecisionState {
  favorableWuxing: string[];
  unfavorableWuxing: string[];
  method: string;
  trace: string[];
  primaryReason: string;
  matchedRuleIds: string[];
}

function buildBaseDecisionState(
  strengthStatus: string,
  pattern: PatternAnalysis,
  dmWuxing: string
): UsefulGodDecisionState {
  const sheng = BASIC_MAPPINGS.WUXING_SHENG
  const ke = BASIC_MAPPINGS.WUXING_KE
  const getKeMe = (me: string) => Object.keys(ke).find(key => ke[key] === me) || ''
  const getShengMe = (me: string) => Object.keys(sheng).find(key => sheng[key] === me) || ''

  const companion = dmWuxing
  const output = sheng[dmWuxing]
  const wealth = ke[dmWuxing]
  const officer = getKeMe(dmWuxing)
  const resource = getShengMe(dmWuxing)
  const bundles: Record<UsefulGodWuxingBundle, string[]> = {
    resource_companion_output: [resource, companion, output].filter(Boolean),
    wealth_officer: [wealth, officer].filter(Boolean),
    output_wealth_officer: [output, wealth, officer].filter(Boolean),
    resource_companion: [resource, companion].filter(Boolean)
  }

  const matchedRule = matchFirstRule(BASE_USEFUL_GOD_RULES, {
    pattern: pattern.pattern,
    strengthStatus
  })

  if (!matchedRule) {
    return {
      favorableWuxing: bundles.output_wealth_officer,
      unfavorableWuxing: bundles.resource_companion,
      method: '扶抑法',
      trace: ['默认取泄耗克'],
      primaryReason: '扶抑',
      matchedRuleIds: []
    }
  }

  return {
    favorableWuxing: bundles[matchedRule.favorable],
    unfavorableWuxing: bundles[matchedRule.unfavorable],
    method: matchedRule.method,
    trace: [matchedRule.trace],
    primaryReason: matchedRule.primaryReason,
    matchedRuleIds: [matchedRule.id]
  }
}

function resolveCommanderWuxing(monthCommander?: string, isPatternSpecial?: boolean): string {
  if (!monthCommander || isPatternSpecial) {
    return ''
  }

  const stemIndex = BASIC_MAPPINGS.HEAVENLY_STEMS.indexOf(monthCommander as never)
  if (stemIndex === -1) {
    return ''
  }

  return BASIC_MAPPINGS.STEM_WUXING[stemIndex]
}

function applyCommanderAdjustment(
  state: UsefulGodDecisionState,
  commanderWuxing: string,
  climateUsefulWuxing: string,
  climateAdjusted: boolean
): { state: UsefulGodDecisionState; adjusted: boolean } {
  if (!commanderWuxing || !state.favorableWuxing.includes(commanderWuxing)) {
    return { state, adjusted: false }
  }

  const reordered = state.favorableWuxing.filter(wx => wx !== commanderWuxing)
  const favorableWuxing = climateAdjusted && climateUsefulWuxing && commanderWuxing !== climateUsefulWuxing
    ? [climateUsefulWuxing, commanderWuxing, ...reordered.filter(wx => wx !== climateUsefulWuxing)]
    : [commanderWuxing, ...reordered]

  return {
    state: {
      ...state,
      favorableWuxing,
      trace: [...state.trace, `司令排序:${commanderWuxing}`],
      primaryReason: state.primaryReason === '调候' ? state.primaryReason : '司令',
      matchedRuleIds: state.matchedRuleIds
    },
    adjusted: true
  }
}

function buildWuxingToTenGodMap(dmWuxing: string): Record<string, string[]> {
  const sheng = BASIC_MAPPINGS.WUXING_SHENG
  const ke = BASIC_MAPPINGS.WUXING_KE
  const getKeMe = (me: string) => Object.keys(ke).find(key => ke[key] === me) || ''
  const getShengMe = (me: string) => Object.keys(sheng).find(key => sheng[key] === me) || ''
  const output = sheng[dmWuxing]
  const wealth = ke[dmWuxing]
  const officer = getKeMe(dmWuxing)
  const resource = getShengMe(dmWuxing)

  return {
    [dmWuxing]: ['比肩', '劫财'],
    [output]: ['食神', '伤官'],
    [wealth]: ['正财', '偏财'],
    [officer]: ['正官', '七杀'],
    [resource]: ['正印', '偏印']
  }
}

function finalizeUsefulGodAnalysis(
  state: UsefulGodDecisionState,
  dmWuxing: string
): UsefulGodAnalysis & {
  favorableWuxing: string[];
  unfavorableWuxing: string[];
  strategyTrace: string[];
  primaryReason: string;
  matchedRuleIds: string[];
} {
  const wuxingToTenGodMap = buildWuxingToTenGodMap(dmWuxing)

  const favorableGods = state.favorableWuxing.flatMap(wx => wuxingToTenGodMap[wx] || [])
  const unfavorableGods = state.unfavorableWuxing.flatMap(wx => wuxingToTenGodMap[wx] || [])
  const usefulGod = favorableGods[0]
  const summaryNotes = USEFUL_GOD_SUMMARY_RULES
    .filter(rule => state.trace.some(step => step.startsWith(rule.prefix)))
    .map(rule => rule.summary)

  return {
    favorable: favorableGods,
    unfavorable: unfavorableGods,
    useful: usefulGod || '暂无',
    avoid: unfavorableGods[0] || '暂无',
    circulation: `${state.method}${summaryNotes.length ? `，${summaryNotes.join('，')}` : ''}。喜${state.favorableWuxing.join('')}`,
    favorableWuxing: state.favorableWuxing,
    unfavorableWuxing: state.unfavorableWuxing,
    strategyTrace: state.trace,
    primaryReason: state.primaryReason,
    matchedRuleIds: state.matchedRuleIds,
    matchedRules: resolveRuleMetadataList(state.matchedRuleIds)
  }
}

export function determineUsefulGod(
  strengthStatus: string,
  pattern: PatternAnalysis,
  dmWuxing: string,
  monthBranch?: string,
  monthCommander?: string
): UsefulGodAnalysis & {
  favorableWuxing: string[];
  unfavorableWuxing: string[];
  strategyTrace: string[];
  primaryReason: string;
  matchedRuleIds: string[];
} {
  const isPatternSpecial = pattern.isSpecial
  const baseState = buildBaseDecisionState(strengthStatus, pattern, dmWuxing)
  const climateRule = matchFirstRule(CLIMATE_RULES, {
    monthBranch,
    dayMaster: dmWuxing
  })
  const climateUsefulWuxing = resolveClimateUsefulWuxing(dmWuxing, monthBranch, isPatternSpecial)
  const climateDecision = applyClimateAdjustment(baseState, climateUsefulWuxing)
  if (climateDecision.adjusted && climateRule?.id && !climateDecision.state.matchedRuleIds.includes(climateRule.id)) {
    climateDecision.state.matchedRuleIds.push(climateRule.id)
  }

  const commanderWuxing = resolveCommanderWuxing(monthCommander, isPatternSpecial)
  const commanderDecision = applyCommanderAdjustment(
    climateDecision.state,
    commanderWuxing,
    climateUsefulWuxing,
    climateDecision.adjusted
  )

  const therapeuticRule = climateDecision.adjusted
    ? undefined
    : matchFirstRule(THERAPEUTIC_PRIORITY_RULES, {
      monthBranch,
      strengthStatus
    })
  const therapeuticPriorityWuxing = climateDecision.adjusted
    ? ''
    : resolveTherapeuticPriorityWuxing(strengthStatus, dmWuxing, monthBranch, isPatternSpecial, BASIC_MAPPINGS.WUXING_SHENG)
  const therapeuticDecision = applyTherapeuticPriority(
    commanderDecision.state,
    therapeuticPriorityWuxing
  )
  if (therapeuticDecision.adjusted && therapeuticRule?.id && !therapeuticDecision.state.matchedRuleIds.includes(therapeuticRule.id)) {
    therapeuticDecision.state.matchedRuleIds.push(therapeuticRule.id)
  }

  const therapeuticHint = resolveTherapeuticHint(strengthStatus, dmWuxing, monthBranch)
  const therapeuticHintRuleId = resolveTherapeuticHintRuleId(strengthStatus, dmWuxing, monthBranch)
  if (therapeuticHintRuleId && !therapeuticDecision.state.matchedRuleIds.includes(therapeuticHintRuleId)) {
    therapeuticDecision.state.matchedRuleIds.push(therapeuticHintRuleId)
  }

  return finalizeUsefulGodAnalysis({
    ...therapeuticDecision.state,
    trace: [
      ...therapeuticDecision.state.trace,
      ...(therapeuticHint ? [`病药提示:${therapeuticHint}`] : []),
      `最终取用:${therapeuticDecision.state.favorableWuxing.join(' -> ')}`
    ]
  }, dmWuxing)
}
