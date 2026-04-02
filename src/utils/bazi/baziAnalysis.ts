import {
  Wuxing,
  BaziAnalysisResult
} from './baziTypes'
import type { HiddenStems, Pillars } from './baziTypes'
import {
  analyzeRoot,
  analyzeSupport,
  analyzeSeasonalStatus,
  analyzeDayMasterStrength,
  determinePattern,
  determineUsefulGod
} from './baziAnalyzerHelpers'
import { createBaziAnalysisPipeline } from './baziAnalysisPipeline'

// Re-implement BaziAnalyzer based on usage in baziCalculator.ts
export class BaziAnalyzer {
  private getWuxing: (ganOrZhi: string) => Wuxing
  private getTenGod: (gan: string, dayMaster: string) => string
  private getSeasonStatus: (zhi: string) => Record<string, string>
  private pipeline: ReturnType<typeof createBaziAnalysisPipeline>

  constructor(
    getWuxing: (ganOrZhi: string) => Wuxing,
    getTenGod: (gan: string, dayMaster: string) => string,
    getSeasonStatus: (zhi: string) => Record<string, string>
  ) {
    this.getWuxing = getWuxing
    this.getTenGod = getTenGod
    this.getSeasonStatus = getSeasonStatus
    this.pipeline = createBaziAnalysisPipeline({
      getWuxing: this.getWuxing,
      getTenGod: this.getTenGod,
      getSeasonStatus: this.getSeasonStatus,
      analyzeRoot,
      analyzeSupport,
      analyzeSeasonalStatus,
      analyzeDayMasterStrength,
      determinePattern,
      determineUsefulGod
    })
  }

  // Main analysis function
  public analyzeBaziChart(pillars: Pillars, hiddenStems: HiddenStems, monthCommander?: string): BaziAnalysisResult {
    return this.pipeline.run({
      pillars,
      hiddenStems,
      monthCommander
    })
  }
}

