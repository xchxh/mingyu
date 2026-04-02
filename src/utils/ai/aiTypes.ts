/**
 * AI 相关类型定义
 */
import type { AIPromptId, AIQuestionType } from '@/constants/ai'

export interface AIPromptOption {
  id: AIPromptId | string;
  text: string;
  prompt: string;
  dataset?: DOMStringMap; // For selectedOption.dataset.prompt
}

export interface AIQuestionDescriptor {
  text: string;
  type: AIQuestionType;
}

export interface HoroscopeState {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}
