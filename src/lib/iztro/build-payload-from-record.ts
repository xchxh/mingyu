import type FunctionalAstrolabe from 'iztro/lib/astro/FunctionalAstrolabe';
import type FunctionalHoroscope from 'iztro/lib/astro/FunctionalHoroscope';
import type { AnalysisPayloadV1, ScopeType } from '../../types/analysis';
import type { ChartPersistRecord } from '../../types/chart';
import { buildAnalysisPayloadV1 } from './build-analysis-payload';
import { buildAstrolabeFromInput, buildHoroscope } from './runtime-helpers';

export async function buildAnalysisPayloadFromRecord(
  record: ChartPersistRecord,
  scopeOverride?: ScopeType,
): Promise<{
  astrolabe: FunctionalAstrolabe;
  horoscope: FunctionalHoroscope;
  payload: AnalysisPayloadV1;
  currentScope: ScopeType;
}> {
  const astrolabe = await buildAstrolabeFromInput(record.input);
  const horoscope = buildHoroscope(
    astrolabe,
    record.currentHoroscopeDate,
    record.currentHoroscopeHour,
  );
  const currentScope = scopeOverride ?? record.currentScope;
  const payload = buildAnalysisPayloadV1({
    astrolabe,
    horoscope,
    currentScope,
  });

  return {
    astrolabe,
    horoscope,
    payload,
    currentScope,
  };
}
