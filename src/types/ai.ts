import type { AnalysisPayloadV1, ScopeType } from './analysis';
import type { SynastryAnalysisPayloadV1 } from './synastry';

export type AiSettings = {
  baseUrl: string;
  model: string;
  apiKey: string;
};

export const defaultAiSettings: AiSettings = {
  baseUrl: 'https://api.openai.com/v1',
  model: '',
  apiKey: '',
};

export function normalizeAiSettings(
  settings?: Partial<AiSettings> | null,
): AiSettings {
  return {
    ...defaultAiSettings,
    baseUrl:
      typeof settings?.baseUrl === 'string'
        ? settings.baseUrl
        : defaultAiSettings.baseUrl,
    model:
      typeof settings?.model === 'string'
        ? settings.model
        : defaultAiSettings.model,
    apiKey:
      typeof settings?.apiKey === 'string'
        ? settings.apiKey
        : defaultAiSettings.apiKey,
  };
}

export type AiConnectionTestResult = {
  ok: boolean;
  checkedAt: number;
  latencyMs: number;
  model: string;
  baseUrl: string;
  errorCode?:
    | 'NETWORK_ERROR'
    | 'TIMEOUT'
    | 'AUTH_ERROR'
    | 'MODEL_ERROR'
    | 'CORS_ERROR'
    | 'INVALID_RESPONSE'
    | 'UNKNOWN_ERROR';
  message: string;
};

export type AiRuntimeConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
};

export type ChatTurn = {
  role: 'user' | 'assistant';
  content: string;
};

export type AiReportContext = {
  report_key: string;
  report_title: string;
  report_type: string;
  selected_topic: string;
  scope_type: ScopeType;
  scope_label: string;
  palace_name?: string;
  focus_notes: string[];
  suggested_questions: string[];
};

export type AiMarkdownDocument = {
  markdown: string;
};

export type AiAnalysisPayload = AnalysisPayloadV1 | SynastryAnalysisPayloadV1;

export type GenerateAnalysisInput = {
  payload: AiAnalysisPayload;
  reportContext: AiReportContext;
  config: AiRuntimeConfig;
  requestId: string;
  anonUserId?: string;
};

export type ChatAboutChartInput = {
  payload: AnalysisPayloadV1;
  reportContext: AiReportContext;
  reportMarkdown: string;
  history: ChatTurn[];
  question: string;
  config: AiRuntimeConfig;
  requestId: string;
  anonUserId?: string;
};

export type GenerateAnalysisResult = {
  data: AiMarkdownDocument;
  rawText: string;
};

export type ChatAboutChartResult = {
  data: AiMarkdownDocument;
  rawText: string;
};

export type AiErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'INVALID_JSON'
  | 'SCHEMA_INVALID'
  | 'AUTH_ERROR'
  | 'MODEL_ERROR'
  | 'CORS_ERROR'
  | 'UNKNOWN_ERROR';
