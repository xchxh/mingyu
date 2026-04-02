import {
  WUXING_STRENGTH_SCORES,
  HIDDEN_STEMS,
  WUXING_MONTH_WEIGHTS,
  WUXING_RELATIONSHIPS,
  WUXING_SUGGESTIONS
} from './baziDefinitions'
import { getWuxing as getWuxingUtil } from './baziUtils'
import type { Pillars, WuxingStrengthDetails, Wuxing } from './baziTypes'

/**
 * 专注于五行强度、旺衰、用神和忌神计算的工具类
 */
export class WuxingCalculator {
  /**
   * 计算五行强弱（高级版）
   * @param pillars - 四柱
   * @param hiddenStems - 藏干
   * @returns 包含分数、百分比和旺衰状态的详细对象
   */
  public calculateWuxingStrength(pillars: Pillars): WuxingStrengthDetails {
    const rawStrength = this._calculateRawStrength(pillars)
    const weightedStrength = this._applyMonthWeights(rawStrength, pillars.month.zhi)

    const totalStrength = Object.values(weightedStrength).reduce((sum, val) => sum + val, 0)
    const percentages = this._calculatePercentages(weightedStrength, totalStrength)

    const dayMasterWuxing = getWuxingUtil(pillars.day.gan)
    if (dayMasterWuxing === '未知') {
      return this._getUnknownStrengthResult(weightedStrength, percentages)
    }

    const { status, allies, enemies } = this._determineStrengthStatus(dayMasterWuxing, weightedStrength, totalStrength)
    const { yongShen, jiShen } = this._determineYongShen(status, allies, enemies, dayMasterWuxing)

    const missingElements = Object.entries(rawStrength)
      .filter(([, score]) => score === 0)
      .map(([wuxing]) => wuxing)

    return {
      scores: weightedStrength,
      percentages,
      status,
      yongShen,
      jiShen,
      missing: missingElements,
      suggestions: {
        favorable: yongShen.map(w => ({ wuxing: w, ...WUXING_SUGGESTIONS[w] })),
        unfavorable: jiShen.map(w => ({ wuxing: w, ...WUXING_SUGGESTIONS[w] }))
      }
    }
  }

  private _calculateRawStrength(pillars: Pillars): Record<string, number> {
    const rawStrength: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 }
    const scores = WUXING_STRENGTH_SCORES

    for (const pillar of Object.values(pillars)) {
      const ganWuxing = getWuxingUtil(pillar.gan)
      if (ganWuxing !== '未知') {
        rawStrength[ganWuxing] += scores.tianGan
      }

      const zhiStems = HIDDEN_STEMS[pillar.zhi] || []
      zhiStems.forEach((stem, index) => {
        const stemWuxing = getWuxingUtil(stem)
        if (stemWuxing !== '未知') {
          if (index === 0) rawStrength[stemWuxing] += scores.diZhiBenQi
          else if (index === 1) rawStrength[stemWuxing] += scores.diZhiZhongQi
          else rawStrength[stemWuxing] += scores.diZhiYuQi
        }
      })
    }
    return rawStrength
  }

  private _applyMonthWeights(rawStrength: Record<string, number>, monthBranch: string): Record<string, number> {
    const weightedStrength: Record<string, number> = { ...rawStrength }
    const currentMonthWeights = WUXING_MONTH_WEIGHTS[monthBranch]
    for (const wuxing in weightedStrength) {
      weightedStrength[wuxing] = Math.round(weightedStrength[wuxing] * (currentMonthWeights[wuxing] || 1))
    }
    return weightedStrength
  }

  private _calculatePercentages(weightedStrength: Record<string, number>, totalStrength: number): Record<string, number> {
    const percentages: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 }
    if (totalStrength === 0) {
      return percentages
    }

    const wuxingKeys = Object.keys(weightedStrength)
    let accumulatedPercentage = 0

    // Calculate and round for the first N-1 elements
    for (let i = 0; i < wuxingKeys.length - 1; i++) {
      const wuxing = wuxingKeys[i]
      const percentage = Math.round((weightedStrength[wuxing] / totalStrength) * 100)
      percentages[wuxing] = percentage
      accumulatedPercentage += percentage
    }

    // Assign the remainder to the last element to ensure the total is 100
    const lastWuxing = wuxingKeys[wuxingKeys.length - 1]
    percentages[lastWuxing] = 100 - accumulatedPercentage

    return percentages
  }

  private _getUnknownStrengthResult(scores: Record<string, number>, percentages: Record<string, number>): WuxingStrengthDetails {
    return {
      scores,
      percentages,
      status: '无法判断',
      yongShen: [],
      jiShen: [],
      missing: [],
      suggestions: { favorable: [], unfavorable: [] }
    }
  }

  private _determineStrengthStatus(dayMasterWuxing: Wuxing, weightedStrength: Record<string, number>, totalStrength: number) {
    const { allies, enemies } = WUXING_RELATIONSHIPS[dayMasterWuxing]
    const allyScore = allies.reduce((sum, type) => sum + (weightedStrength[type] || 0), 0)
    const allyPercentage = totalStrength > 0 ? (allyScore / totalStrength) * 100 : 0

    let status = '均衡'
    if (allyPercentage > 60) status = '身强'
    else if (allyPercentage < 20) status = '身弱'
    else if (allyPercentage >= 40 && allyPercentage <= 60) status = '中和'
    else if (allyPercentage > 50) status = '偏强'
    else if (allyPercentage < 30) status = '偏弱'

    return { status, allies, enemies }
  }

  private _determineYongShen(status: string, allies: string[], enemies: string[], dayMasterWuxing: Wuxing) {
    let yongShen: string[] = []
    let jiShen: string[] = []

    if (status === '身强' || status === '偏强') {
      yongShen = enemies
      jiShen = allies
    } else if (status === '身弱' || status === '偏弱') {
      yongShen = allies
      jiShen = enemies
    } else {
      // 中和状态，取克泄耗为用神
      yongShen = WUXING_RELATIONSHIPS[dayMasterWuxing].enemies.slice(0, 2)
    }
    return { yongShen, jiShen }
  }
}
