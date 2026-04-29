import type { QueryInputState } from '@/lib/query-state';
import type { DivinationDraft, DivinationSession } from '@/lib/divination/engine';

const PERSONAL_HISTORY_STORAGE_KEY = 'prompt_studio_personal_history_v1';
const COMPATIBILITY_HISTORY_STORAGE_KEY = 'prompt_studio_compatibility_history_v1';
const DIVINATION_HISTORY_STORAGE_KEY = 'prompt_studio_divination_history_v1';
const AI_REPORT_STORAGE_KEY = 'prompt_studio_ai_report_v1';
const MAX_HISTORY_RECORDS = 20;

type PersonalHistoryRecord = {
  id: string;
  type: 'single';
  name: string;
  gender: 'male' | 'female';
  birthText: string;
  input: QueryInputState;
  updatedAt: string;
  aiReport?: string;
};

type CompatibilityHistoryRecord = {
  id: string;
  type: 'compatibility';
  name: string;
  primaryName: string;
  partnerName: string;
  input: QueryInputState;
  updatedAt: string;
  aiReport?: string;
};

export type DivinationHistoryRecord = {
  id: string;
  type: 'divination';
  question: string;
  requestedMethod: DivinationSession['requestedMethod'];
  method: DivinationSession['method'];
  draft: DivinationDraft;
  session: DivinationSession;
  updatedAt: string;
  aiReport?: string;
};

type AIReportRecord = {
  recordId: string;
  report: string;
  updatedAt: string;
};

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

function readRecords<T>(key: string): T[] {
  const storage = getStorage();
  if (!storage) {
    return [];
  }

  try {
    const raw = storage.getItem(key);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeRecords<T>(key: string, records: T[]) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(key, JSON.stringify(records.slice(0, MAX_HISTORY_RECORDS)));
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function buildBirthText(input: QueryInputState, role: 'self' | 'partner' = 'self') {
  const prefix = role === 'self' ? '' : 'partner';
  const year = prefix ? input.partnerYear : input.year;
  const month = prefix ? input.partnerMonth : input.month;
  const day = prefix ? input.partnerDay : input.day;
  return `${year}-${month}-${day}`;
}

function cloneInput(input: QueryInputState): QueryInputState {
  return JSON.parse(JSON.stringify(input)) as QueryInputState;
}

function cloneDivinationDraft(draft: DivinationDraft): DivinationDraft {
  return JSON.parse(JSON.stringify(draft)) as DivinationDraft;
}

function cloneDivinationSession(session: DivinationSession): DivinationSession {
  return JSON.parse(JSON.stringify(session)) as DivinationSession;
}

export function loadPersonalHistory() {
  return readRecords<PersonalHistoryRecord>(PERSONAL_HISTORY_STORAGE_KEY);
}

export function loadCompatibilityHistory() {
  return readRecords<CompatibilityHistoryRecord>(COMPATIBILITY_HISTORY_STORAGE_KEY);
}

export function loadDivinationHistory() {
  return readRecords<DivinationHistoryRecord>(DIVINATION_HISTORY_STORAGE_KEY);
}

export function upsertPersonalHistory(input: QueryInputState) {
  const name = input.name.trim();
  if (!name || !input.year || !input.month || !input.day) {
    return loadPersonalHistory();
  }

  const id = [
    normalizeText(name),
    input.gender,
    input.dateType,
    input.year,
    input.month,
    input.day,
  ].join('|');

  const record: PersonalHistoryRecord = {
    id,
    type: 'single',
    name,
    gender: input.gender,
    birthText: buildBirthText(input),
    input: cloneInput({
      ...input,
      analysisMode: 'single',
    }),
    updatedAt: new Date().toISOString(),
  };

  const next = [record, ...loadPersonalHistory().filter((item) => item.id !== id)];
  writeRecords(PERSONAL_HISTORY_STORAGE_KEY, next);
  return next.slice(0, MAX_HISTORY_RECORDS);
}

export function upsertCompatibilityHistory(input: QueryInputState) {
  const primaryName = input.name.trim();
  const partnerName = input.partnerName.trim();
  if (
    input.analysisMode !== 'compatibility' ||
    !primaryName ||
    !partnerName ||
    !input.year ||
    !input.month ||
    !input.day ||
    !input.partnerYear ||
    !input.partnerMonth ||
    !input.partnerDay
  ) {
    return loadCompatibilityHistory();
  }

  const id = [
    normalizeText(primaryName),
    normalizeText(partnerName),
    input.gender,
    input.partnerGender,
    input.year,
    input.month,
    input.day,
    input.partnerYear,
    input.partnerMonth,
    input.partnerDay,
  ].join('|');

  const record: CompatibilityHistoryRecord = {
    id,
    type: 'compatibility',
    name: `${primaryName} 和 ${partnerName}`,
    primaryName,
    partnerName,
    input: cloneInput(input),
    updatedAt: new Date().toISOString(),
  };

  const next = [record, ...loadCompatibilityHistory().filter((item) => item.id !== id)];
  writeRecords(COMPATIBILITY_HISTORY_STORAGE_KEY, next);
  return next.slice(0, MAX_HISTORY_RECORDS);
}

export function removePersonalHistory(id: string) {
  const next = loadPersonalHistory().filter((item) => item.id !== id);
  writeRecords(PERSONAL_HISTORY_STORAGE_KEY, next);
  return next;
}

export function removeCompatibilityHistory(id: string) {
  const next = loadCompatibilityHistory().filter((item) => item.id !== id);
  writeRecords(COMPATIBILITY_HISTORY_STORAGE_KEY, next);
  return next;
}

export function addDivinationHistory(draft: DivinationDraft, session: DivinationSession) {
  const question = session.question.trim();
  if (!question) {
    return null;
  }

  const record: DivinationHistoryRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    type: 'divination',
    question,
    requestedMethod: session.requestedMethod,
    method: session.method,
    draft: cloneDivinationDraft(draft),
    session: cloneDivinationSession(session),
    updatedAt: new Date().toISOString(),
  };

  writeRecords(DIVINATION_HISTORY_STORAGE_KEY, [record, ...loadDivinationHistory()]);
  return record;
}

export function getDivinationHistoryById(id: string) {
  return loadDivinationHistory().find((item) => item.id === id) ?? null;
}

export function removeDivinationHistory(id: string) {
  const next = loadDivinationHistory().filter((item) => item.id !== id);
  writeRecords(DIVINATION_HISTORY_STORAGE_KEY, next);
  return next;
}

// AI 报告存储相关函数
export function loadAIReport(recordId: string): string | null {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const data = storage.getItem(AI_REPORT_STORAGE_KEY);
    if (!data) return null;

    const reports: AIReportRecord[] = JSON.parse(data);
    const report = reports.find(r => r.recordId === recordId);
    return report?.report || null;
  } catch {
    return null;
  }
}

export function saveAIReport(recordId: string, report: string): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    const data = storage.getItem(AI_REPORT_STORAGE_KEY);
    const reports: AIReportRecord[] = data ? JSON.parse(data) : [];

    // 更新或添加报告
    const existingIndex = reports.findIndex(r => r.recordId === recordId);
    const newReport: AIReportRecord = {
      recordId,
      report,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      reports[existingIndex] = newReport;
    } else {
      reports.unshift(newReport);
    }

    // 只保留最近50条报告
    storage.setItem(AI_REPORT_STORAGE_KEY, JSON.stringify(reports.slice(0, 50)));
  } catch (e) {
    console.error('保存AI报告失败:', e);
  }
}

export function removeAIReport(recordId: string): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    const data = storage.getItem(AI_REPORT_STORAGE_KEY);
    if (!data) return;

    const reports: AIReportRecord[] = JSON.parse(data);
    const next = reports.filter(r => r.recordId !== recordId);
    storage.setItem(AI_REPORT_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 忽略错误
  }
}
