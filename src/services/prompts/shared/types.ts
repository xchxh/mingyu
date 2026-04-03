/**
 * 提示词系统共享类型定义
 */

import type { SupplementaryInfo } from '../../../types';

// ============================================================================
// 问题分析相关类型
// ============================================================================

/**
 * 问题类型检测结果
 */
export interface QuestionType {
  /** 判断类问题 */
  isQuestion: boolean;
  /** 选择类问题 */
  isChoice: boolean;
  /** 时间类问题 */
  isTime: boolean;
  /** 行动类问题 */
  isAction: boolean;
  /** 可行性类问题 */
  isFeasibility: boolean;
  /** 感情类问题 */
  isRelationship: boolean;
  /** 事业类问题 */
  isCareer: boolean;
  /** 财运类问题 */
  isFinance: boolean;
  /** 健康类问题 */
  isHealth: boolean;
  /** 学业类问题 */
  isStudy: boolean;
  /** 原因类问题 */
  isReason: boolean;
  /** 预测类问题 */
  isPrediction: boolean;
  /** 建议类问题 */
  isAdvice: boolean;
  /** 比较类问题 */
  isComparison: boolean;
  /** 数量类问题 */
  isQuantity: boolean;
  /** 地点类问题 */
  isLocation: boolean;
  /** 人物类问题 */
  isPerson: boolean;
}

/**
 * 复杂度评估结果
 */
export interface ComplexityLevel {
  /** 复杂度级别 */
  complexity: 'simple' | 'medium' | 'complex';
  /** 影响因素 */
  factors: string[];
  /** 所需分析深度 */
  requiredDepth: number;
  /** 时间紧急度 */
  timeUrgency: 'low' | 'medium' | 'high';
  /** 重要程度 */
  importance: 'low' | 'medium' | 'high';
}

/**
 * 情感状态检测结果
 */
export interface EmotionState {
  /** 主要情感 */
  emotion: 'anxious' | 'hopeful' | 'confused' | 'determined' | 'neutral';
  /** 情感强度 */
  intensity: number;
  /** 支持需求 */
  supportNeeded: string;
}

/**
 * 用户经验水平
 */
export interface UserExperienceLevel {
  /** 经验级别 */
  level: 'beginner' | 'intermediate' | 'advanced';
  /** 熟悉度 */
  familiarity: number;
  /** 术语容忍度 */
  terminologyTolerance: number;
}

/**
 * 问题分析完整结果
 */
export interface QuestionAnalysis {
  /** 问题类型 */
  types: QuestionType;
  /** 复杂度评估 */
  complexity: ComplexityLevel;
  /** 情感状态 */
  emotion: EmotionState;
  /** 用户经验 */
  userExperience: UserExperienceLevel;
}

// ============================================================================
// 提示词构建相关类型
// ============================================================================

/**
 * 提示词构建配置
 */
export interface PromptBuildConfig {
  /** 占卜类型 */
  divinationType: string;
  /** 用户问题 */
  question: string;
  /** 格式化后的数据 */
  formattedData: string;
  /** 时间信息 */
  timeInfo: string;
  /** 问题分析结果 */
  analysis: QuestionAnalysis;
  /** 补充信息 */
  supplementaryInfo?: SupplementaryInfo;
}

/**
 * 提示词模板变量
 */
export interface PromptVariables {
  /** 时间信息 */
  timeInfo: string;
  /** 用户问题 */
  question: string;
  /** 数据信息 */
  dataInfo: string;
  /** 问题分析 */
  questionAnalysis: string;
  /** 问题回答 */
  questionAnswer: string;
  /** 详细分析 */
  analysis: string;
  /** 行动建议 */
  action: string;
  /** 总结 */
  summary: string;
  /** 补充信息 */
  supplementaryInfo?: string;
}

// ============================================================================
// 干支增强相关类型
// ============================================================================

/**
 * 干支增强配置
 */
export interface GanzhiEnhancerConfig {
  /** 基础提示词 */
  basePrompt: string;
  /** 时间信息 */
  timeInfo: string;
  /** 是否启用增强 */
  enabled?: boolean;
}

