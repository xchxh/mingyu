import { BAZI_AI_PROMPTS, buildBaziPrompt, PROMPT_BUILDER } from './aiPrompts'
import { formatBaziForPrompt, type PromptChartScene } from '@/utils/bazi/baziAnalysisFormatter'
import type { AIPromptOption } from './aiTypes'
import type { BaziChartResult } from '@/utils/bazi/baziTypes'
import type { FortuneSelectionContext } from '@/utils/bazi/fortuneSelection'

type SinglePromptConfig = typeof BAZI_AI_PROMPTS.single[number]

function resolvePromptScene(
  promptId: string,
  isSimple: boolean
): PromptChartScene {
  if (promptId === 'ai-fortune-detail' || promptId === 'ai-fortune-overview' || promptId === 'ai-current-luck' || promptId === 'ai-this-year') {
    return 'fortune'
  }

  if (isSimple) {
    return 'concise'
  }

  return 'general'
}

function formatFortuneSelectionSection(fortuneSelectionContext: FortuneSelectionContext | null | undefined): string {
  if (!fortuneSelectionContext) {
    return ''
  }

  const { promptPayload } = fortuneSelectionContext
  const lines = [
    promptPayload.scopeLabel,
    ...promptPayload.summaryLines
  ]

  if (promptPayload.breakdownTitle && promptPayload.breakdownLines?.length) {
    lines.push(promptPayload.breakdownTitle)
    lines.push(...promptPayload.breakdownLines.map((line, index) => `${index + 1}. ${line}`))
  }

  return `分析对象：\n${lines.join('\n')}`
}

function buildFortunePromptAddon(
  promptId: string,
  fortuneSelectionContext: FortuneSelectionContext | null
): string {
  if (!fortuneSelectionContext) {
    return ''
  }

  if (promptId === 'ai-fortune-detail') {
    if (fortuneSelectionContext.scope === 'dayun') {
      return '按逐年列表依次分析这一步大运，先总后分。'
    }

    if (fortuneSelectionContext.scope === 'year') {
      return '按流月列表依次分析这一年，先总后分。'
    }

    if (fortuneSelectionContext.scope === 'month') {
      return '按流日列表依次分析这个流月，先总后分。'
    }

    return '聚焦这个流日的主题、机会风险和建议。'
  }

  if (promptId === 'ai-fortune-overview') {
    return '聚焦整体节奏、机会、风险和应对。'
  }

  return ''
}

export function isSimpleQuestion(questionText: string, historyLength: number): boolean {
  if (historyLength > 0) {
    const simpleKeywords = ['怎么样', '如何', '好不好', '能不能', '要不要', '会不会', '是不是', '有没有', '对吗', '呢', '吗']
    const shortQuestions = questionText.length < 20
    const hasSimpleKeyword = simpleKeywords.some(keyword => questionText.includes(keyword))
    return shortQuestions || hasSimpleKeyword
  }

  return false
}

export function buildPromptFromConfig(
  questionText: string,
  selectedOption: AIPromptOption,
  chartResult: BaziChartResult | null,
  historyLength: number = 0,
  useConciseMode: boolean = false,
  fortuneSelectionContext: FortuneSelectionContext | null = null
): { system: string; user: string } {
  let promptConfig: SinglePromptConfig | null = null

  if (chartResult && chartResult.pillars) {
    promptConfig = BAZI_AI_PROMPTS.single.find(config => config.id === selectedOption.id) || null
  }

  if (promptConfig) {
    let chartData = '无法获取命盘数据。'
    if (chartResult) {
      const isSimple = useConciseMode || isSimpleQuestion(questionText, historyLength)
      chartData = formatBaziForPrompt(chartResult, selectedOption, resolvePromptScene(promptConfig.id, isSimple))
    }
    const fortuneSelectionSection = formatFortuneSelectionSection(fortuneSelectionContext)
    const fortunePromptAddon = buildFortunePromptAddon(promptConfig.id, fortuneSelectionContext)
    const finalPromptRequirement = [promptConfig.prompt, fortunePromptAddon].filter(Boolean).join(' ')

    const isSimple = useConciseMode || isSimpleQuestion(questionText, historyLength)
    const systemPrompt = isSimple ? PROMPT_BUILDER.conciseSystem : PROMPT_BUILDER.detailedSystem

    if (isSimple) {
      const userPrompt = [
        `当前时间：${new Date().toLocaleString('zh-CN')}`,
        `命盘信息：\n${chartData}`,
        `问题：${questionText}`,
        fortuneSelectionSection,
        `任务：${finalPromptRequirement || '直接回答当前问题。'}`,
        '输出：直接给出判断和建议。'
      ].filter(Boolean).join('\n\n')
      return {
        system: systemPrompt,
        user: userPrompt
      }
    }

    const userPrompt = [
      `当前时间：${new Date().toLocaleString('zh-CN')}`,
      `命盘信息：\n${chartData}`,
      fortuneSelectionSection,
      `问题：${questionText}`,
      `任务：${finalPromptRequirement}`,
      '输出：先给核心判断，再展开最关键的2到4个重点。'
    ].filter(Boolean).join('\n\n')
    return {
      system: systemPrompt,
      user: userPrompt
    }
  }

  let chartData = '无法获取命盘数据。'
  if (chartResult && chartResult.pillars) {
    chartData = formatBaziForPrompt(chartResult, selectedOption, 'general')
  } else {
    chartData = '命盘数据格式不支持。'
  }
  return buildBaziPrompt(chartData, questionText)
}
