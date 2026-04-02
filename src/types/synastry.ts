import type { AnalysisPayloadV1 } from './analysis';
import type { ChartInput } from './chart';

export type SynastryRelationType = 'marriage' | 'partnership' | 'custom';

export type SynastryPreset = {
  relationType: SynastryRelationType;
  customTopic?: string;
};

export type SynastryAnalysisSubjectV1 = {
  record_id: string;
  chart_hash: string;
  title: string;
  input: ChartInput;
  payload: AnalysisPayloadV1;
};

export type SynastryAnalysisPayloadV1 = {
  payload_version: 'synastry_analysis_payload_v1';
  language: 'zh-CN';
  relation_type: SynastryRelationType;
  relation_label: string;
  custom_topic?: string;
  people: [SynastryAnalysisSubjectV1, SynastryAnalysisSubjectV1];
};

export function isSynastryAnalysisPayload(
  payload: unknown,
): payload is SynastryAnalysisPayloadV1 {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'payload_version' in payload &&
    (payload as { payload_version?: unknown }).payload_version ===
      'synastry_analysis_payload_v1'
  );
}
