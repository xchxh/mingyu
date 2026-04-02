import { BASIC_MAPPINGS } from './baziDefinitions'

type BaziArray = [string, string][];

export interface Relationship {
  type: string;
  elements: string[];
  description: string;
}

export interface IntelligentAnalysisResult {
  tianGan: Relationship[];
  diZhi: Relationship[];
  ganZhi: Relationship[];
}

export class RelationshipCalculator {
  private ctg: readonly string[]
  private cdz: readonly string[]
  private wxtg: string[]
  private wxdz: string[]
  private wuxingKe: Record<string, string>
  private wuxingSheng: Record<string, string>
  private tianGanHe: Record<string, string>
  private tianGanChong: Record<string, string>
  private diZhiChong: Record<string, string>
  private diZhiHe: Record<string, string>
  private diZhiSanHe: Record<string, string[]>
  private diZhiSanHui: Record<string, string[]>
  private diZhiAnHe: Record<string, string>
  private diZhiHai: Record<string, string>
  private diZhiPo: Record<string, string>

  constructor() {
    this.ctg = BASIC_MAPPINGS.HEAVENLY_STEMS
    this.cdz = BASIC_MAPPINGS.EARTHLY_BRANCHES
    this.wxtg = BASIC_MAPPINGS.STEM_WUXING
    this.wxdz = BASIC_MAPPINGS.BRANCH_WUXING
    this.wuxingKe = BASIC_MAPPINGS.WUXING_KE
    this.wuxingSheng = BASIC_MAPPINGS.WUXING_SHENG
    this.tianGanHe = BASIC_MAPPINGS.TIAN_GAN_WU_HE
    this.tianGanChong = BASIC_MAPPINGS.TIAN_GAN_CHONG
    this.diZhiChong = BASIC_MAPPINGS.DI_ZHI_CHONG
    this.diZhiHe = BASIC_MAPPINGS.DI_ZHI_LIU_HE
    this.diZhiSanHe = BASIC_MAPPINGS.DI_ZHI_SAN_HE
    this.diZhiSanHui = BASIC_MAPPINGS.DI_ZHI_SAN_HUI
    this.diZhiAnHe = BASIC_MAPPINGS.DI_ZHI_AN_HE
    this.diZhiHai = BASIC_MAPPINGS.DI_ZHI_HAI
    this.diZhiPo = BASIC_MAPPINGS.DI_ZHI_PO
  }

  public getIntelligentAnalysis(baziArray: BaziArray): IntelligentAnalysisResult {
    const tianGanRels = this.analyzeTianGan(baziArray)
    const diZhiRels = this.analyzeDiZhi(baziArray)
    const ganZhiRels = this.analyzeGanZhi(baziArray)

    return {
      tianGan: tianGanRels,
      diZhi: diZhiRels,
      ganZhi: ganZhiRels
    }
  }

  private analyzeTianGan(baziArray: BaziArray): Relationship[] {
    const rels: Relationship[] = []
    const gans = baziArray.map(p => p[0])

    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        const gan1 = gans[i]
        const gan2 = gans[j]

        if (this.tianGanHe[gan1] === gan2 || this.tianGanHe[gan2] === gan1) {
          rels.push({ type: '合', elements: [gan1, gan2], description: `${gan1}${gan2}相合` })
        }
        if (this.tianGanChong[gan1] === gan2 || this.tianGanChong[gan2] === gan1) {
          rels.push({ type: '冲', elements: [gan1, gan2], description: `${gan1}${gan2}相冲` })
        }
        const wuxing1 = this.wxtg[this.ctg.indexOf(gan1)]
        const wuxing2 = this.wxtg[this.ctg.indexOf(gan2)]
        if (this.wuxingSheng[wuxing1] === wuxing2) {
          rels.push({ type: '生', elements: [gan1, gan2], description: `${gan1}生${gan2}` })
        } else if (this.wuxingSheng[wuxing2] === wuxing1) {
          rels.push({ type: '生', elements: [gan2, gan1], description: `${gan2}生${gan1}` })
        }
        if (this.wuxingKe[wuxing1] === wuxing2) {
          rels.push({ type: '克', elements: [gan1, gan2], description: `${gan1}克${gan2}` })
        } else if (this.wuxingKe[wuxing2] === wuxing1) {
          rels.push({ type: '克', elements: [gan2, gan1], description: `${gan2}克${gan1}` })
        }
      }
    }
    return rels
  }

  private analyzeDiZhi(baziArray: BaziArray): Relationship[] {
    const rels: Relationship[] = []
    const zhis = baziArray.map(p => p[1])
    const uniqueZhis = [...new Set(zhis)]

    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        const zhi1 = zhis[i]
        const zhi2 = zhis[j]
        if (this.diZhiChong[zhi1] === zhi2 || this.diZhiChong[zhi2] === zhi1) rels.push({ type: '冲', elements: [zhi1, zhi2], description: `${zhi1}${zhi2}相冲` })
        if (this.diZhiHe[zhi1] === zhi2 || this.diZhiHe[zhi2] === zhi1) rels.push({ type: '六合', elements: [zhi1, zhi2], description: `${zhi1}${zhi2}相合` })
        if (this.diZhiHai[zhi1] === zhi2 || this.diZhiHai[zhi2] === zhi1) rels.push({ type: '害', elements: [zhi1, zhi2], description: `${zhi1}${zhi2}相害` })
        if (this.diZhiPo[zhi1] === zhi2 || this.diZhiPo[zhi2] === zhi1) rels.push({ type: '破', elements: [zhi1, zhi2], description: `${zhi1}${zhi2}相破` })
        if (this.diZhiAnHe[zhi1] === zhi2 || this.diZhiAnHe[zhi2] === zhi1) rels.push({ type: '暗合', elements: [zhi1, zhi2], description: `${zhi1}${zhi2}暗合` })
      }
    }

    if (uniqueZhis.includes('子') && uniqueZhis.includes('卯')) rels.push({ type: '刑', elements: ['子', '卯'], description: '子卯无礼之刑' })
    if (uniqueZhis.filter(z => ['寅', '巳', '申'].includes(z)).length >= 2) rels.push({ type: '刑', elements: ['寅', '巳', '申'], description: '寅巳申无恩之刑' })
    if (uniqueZhis.filter(z => ['丑', '戌', '未'].includes(z)).length >= 2) rels.push({ type: '刑', elements: ['丑', '戌', '未'], description: '丑戌未恃势之刑' });
    ['辰', '午', '酉', '亥'].forEach(z => {
      if (zhis.filter(item => item === z).length > 1) rels.push({ type: '自刑', elements: [z, z], description: `${z}${z}自刑` })
    })

    Object.entries(this.diZhiSanHe).forEach(([, value]) => {
      if (value.every(z => uniqueZhis.includes(z))) {
        rels.push({ type: '三合', elements: value, description: `${value.join('')}三合` })
      }
    })
    Object.entries(this.diZhiSanHui).forEach(([, value]) => {
      if (value.every(z => uniqueZhis.includes(z))) {
        rels.push({ type: '三会', elements: value, description: `${value.join('')}三会` })
      }
    })

    return rels
  }

  private analyzeGanZhi(baziArray: BaziArray): Relationship[] {
    const rels: Relationship[] = []

    for (let i = 0; i < 4; i++) {
      const [gan, zhi] = baziArray[i]
      const ganWuxing = this.wxtg[this.ctg.indexOf(gan)]
      const zhiWuxing = this.wxdz[this.cdz.indexOf(zhi)] // 取本气
      if (this.wuxingKe[ganWuxing] === zhiWuxing) rels.push({ type: '盖头', elements: [`${gan}${zhi}`], description: `${gan}${zhi}盖头` })
      if (this.wuxingKe[zhiWuxing] === ganWuxing) rels.push({ type: '截脚', elements: [`${gan}${zhi}`], description: `${gan}${zhi}截脚` })
      if (this.wuxingSheng[ganWuxing] === zhiWuxing) rels.push({ type: '干生支', elements: [`${gan}${zhi}`], description: `${gan}生${zhi}` })
      if (this.wuxingSheng[zhiWuxing] === ganWuxing) rels.push({ type: '支生干', elements: [`${gan}${zhi}`], description: `${zhi}生${gan}` })
    }

    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        const p1 = baziArray[i]
        const p2 = baziArray[j]
        const [gan1, zhi1] = p1
        const [gan2, zhi2] = p2
        const isTianChong = (this.tianGanChong[gan1] === gan2 || this.tianGanChong[gan2] === gan1)
        const isDiChong = (this.diZhiChong[zhi1] === zhi2 || this.diZhiChong[zhi2] === zhi1)
        const isTianHe = (this.tianGanHe[gan1] === gan2 || this.tianGanHe[gan2] === gan1)
        const isDiHe = (this.diZhiHe[zhi1] === zhi2 || this.diZhiHe[zhi2] === zhi1)

        // 天克地冲 (天干相克或相冲，地支相冲)
        // 通常天克地冲指天干相克，但天干相冲更为严重
        const wuxing1 = this.wxtg[this.ctg.indexOf(gan1)]
        const wuxing2 = this.wxtg[this.ctg.indexOf(gan2)]
        const isTianKe = (this.wuxingKe[wuxing1] === wuxing2 || this.wuxingKe[wuxing2] === wuxing1)

        if (isDiChong) {
          if (isTianChong) {
            rels.push({ type: '反吟', elements: [p1.join(''), p2.join('')], description: `${p1.join('')}与${p2.join('')}反吟(天冲地冲)` })
          } else if (isTianKe) {
            rels.push({ type: '天克地冲', elements: [p1.join(''), p2.join('')], description: `${p1.join('')}与${p2.join('')}天克地冲` })
          }
        }

        // 天地鸳鸯合 (天干相合，地支相合)
        if (isTianHe && isDiHe) {
          rels.push({ type: '天地鸳鸯合', elements: [p1.join(''), p2.join('')], description: `${p1.join('')}与${p2.join('')}天地鸳鸯合` })
        } else if (isTianHe && !isDiHe) {
          // 仅天合
        } else if (!isTianHe && isDiHe) {
          // 仅地合
        }

        // 天地同气 (虽非伏吟，但气势相同，如甲寅见乙卯? 不，通常指伏吟)
      }
    }

    const pillarStrings = baziArray.map(p => p.join(''))
    const pillarCounts = pillarStrings.reduce((acc: Record<string, number>, val) => {
      acc[val] = (acc[val] || 0) + 1
      return acc
    }, {})
    for (const pillar in pillarCounts) {
      if (pillarCounts[pillar] > 1) {
        rels.push({ type: '伏吟', elements: [pillar], description: `${pillar}伏吟` })
      }
    }

    return rels
  }
}
