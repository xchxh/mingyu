export const AI_QUESTION_TYPES = {
  mingge: 'mingge',
  currentLuck: 'current-luck',
  year: 'year',
  fortuneDetail: 'fortune-detail',
  fortuneOverview: 'fortune-overview',
  monthlyFortune: 'monthly-fortune',
  nextThreeYears: 'next-three-years',
  lifetimeFortune: 'lifetime-fortune',
  career: 'career',
  marriage: 'marriage',
  health: 'health',
  parentsHealth: 'parents-health',
  childrenFate: 'children-fate',
  wealthTiming: 'wealth-timing',
  noblePerson: 'noble-person',
  friendship: 'friendship',
  custom: 'custom'
} as const

export type AIQuestionType = typeof AI_QUESTION_TYPES[keyof typeof AI_QUESTION_TYPES]

export const AI_PROMPT_IDS = {
  mingge: 'ai-mingge-zonglun',
  currentLuck: 'ai-current-luck',
  year: 'ai-this-year',
  fortuneDetail: 'ai-fortune-detail',
  fortuneOverview: 'ai-fortune-overview',
  monthlyFortune: 'ai-monthly-fortune',
  nextThreeYears: 'ai-next-three-years',
  lifetimeFortune: 'ai-lifetime-fortune',
  career: 'ai-career',
  marriage: 'ai-marriage',
  health: 'ai-health',
  parentsHealth: 'ai-parents-health',
  childrenFate: 'ai-children-fate',
  wealthTiming: 'ai-wealth-timing',
  noblePerson: 'ai-noble-person',
  custom: 'custom'
} as const

export type AIPromptId = typeof AI_PROMPT_IDS[keyof typeof AI_PROMPT_IDS]

export const AI_QUESTION_TYPE_TO_PROMPT_ID: Record<AIQuestionType, AIPromptId> = {
  [AI_QUESTION_TYPES.mingge]: AI_PROMPT_IDS.mingge,
  [AI_QUESTION_TYPES.currentLuck]: AI_PROMPT_IDS.currentLuck,
  [AI_QUESTION_TYPES.year]: AI_PROMPT_IDS.year,
  [AI_QUESTION_TYPES.fortuneDetail]: AI_PROMPT_IDS.fortuneDetail,
  [AI_QUESTION_TYPES.fortuneOverview]: AI_PROMPT_IDS.fortuneOverview,
  [AI_QUESTION_TYPES.monthlyFortune]: AI_PROMPT_IDS.monthlyFortune,
  [AI_QUESTION_TYPES.nextThreeYears]: AI_PROMPT_IDS.nextThreeYears,
  [AI_QUESTION_TYPES.lifetimeFortune]: AI_PROMPT_IDS.lifetimeFortune,
  [AI_QUESTION_TYPES.career]: AI_PROMPT_IDS.career,
  [AI_QUESTION_TYPES.marriage]: AI_PROMPT_IDS.marriage,
  [AI_QUESTION_TYPES.health]: AI_PROMPT_IDS.health,
  [AI_QUESTION_TYPES.parentsHealth]: AI_PROMPT_IDS.parentsHealth,
  [AI_QUESTION_TYPES.childrenFate]: AI_PROMPT_IDS.childrenFate,
  [AI_QUESTION_TYPES.wealthTiming]: AI_PROMPT_IDS.wealthTiming,
  [AI_QUESTION_TYPES.noblePerson]: AI_PROMPT_IDS.noblePerson,
  [AI_QUESTION_TYPES.friendship]: AI_PROMPT_IDS.custom,
  [AI_QUESTION_TYPES.custom]: AI_PROMPT_IDS.custom
}
