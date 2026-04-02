import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFortuneSelectionContext,
  normalizeFortuneSelection,
} from '../src/utils/bazi/fortuneSelection';
import type { BaziChartResult } from '../src/utils/bazi/baziTypes';

function createMockResult(): BaziChartResult {
  return {
    luckInfo: {
      startInfo: '',
      handoverInfo: '',
      cycles: [
        {
          age: 8,
          year: 2008,
          ganZhi: '甲子',
          isXiaoyun: false,
          type: '大运',
          years: [
            {
              year: 2008,
              age: 8,
              ganZhi: '戊子',
              tenGod: '',
              tenGodZhi: '',
              xiaoyun: {
                ganZhi: '丙寅',
                tenGod: '',
                tenGodZhi: '',
              },
            },
            {
              year: 2009,
              age: 9,
              ganZhi: '己丑',
              tenGod: '',
              tenGodZhi: '',
            },
          ],
        },
      ],
    },
  } as BaziChartResult;
}

test('选择大运时会附带该大运下的全部流年', () => {
  const result = createMockResult();
  const context = buildFortuneSelectionContext(result, {
    scope: 'dayun',
    cycleIndex: 0,
  });

  assert.ok(context);
  assert.equal(context.scope, 'dayun');
  assert.equal(context.displayLabel, '甲子运');
  assert.equal(context.yearBreakdown?.length, 2);
  assert.match(context.promptPayload.breakdownTitle ?? '', /流年/);
  assert.match(context.promptPayload.breakdownLines?.[0] ?? '', /2008年/);
  assert.doesNotMatch(context.promptPayload.breakdownLines?.[0] ?? '', /童运/);
});

test('选择流年时会附带该流年下的全部流月', () => {
  const result = createMockResult();
  const context = buildFortuneSelectionContext(result, {
    scope: 'year',
    cycleIndex: 0,
    year: 2008,
  });

  assert.ok(context);
  assert.equal(context.scope, 'year');
  assert.equal(context.year, 2008);
  assert.equal(context.monthBreakdown?.length, 12);
  assert.match(context.promptPayload.breakdownTitle ?? '', /流月/);
  assert.match(context.promptPayload.breakdownLines?.[0] ?? '', /1月/);
  assert.doesNotMatch(context.promptPayload.summaryLines.join('\n'), /童运/);
});

test('选择流月时会附带该流月下的全部流日', () => {
  const result = createMockResult();
  const context = buildFortuneSelectionContext(result, {
    scope: 'month',
    cycleIndex: 0,
    year: 2008,
    month: 2,
  });

  assert.ok(context);
  assert.equal(context.scope, 'month');
  assert.equal(context.month, 2);
  assert.equal(context.dayBreakdown?.length, 29);
  assert.match(context.promptPayload.breakdownTitle ?? '', /流日/);
  assert.match(context.promptPayload.breakdownLines?.[0] ?? '', /2008-02-01/);
});

test('选择流日时只保留该流日本身', () => {
  const result = createMockResult();
  const normalized = normalizeFortuneSelection(result, {
    scope: 'day',
    cycleIndex: 0,
    year: 2008,
    month: 2,
    day: 8,
  });
  const context = buildFortuneSelectionContext(result, normalized);

  assert.ok(context);
  assert.equal(context.scope, 'day');
  assert.equal(context.promptPayload.breakdownTitle, '该流日包含的流时');
  assert.equal(context.dayBreakdown?.length, 1);
  assert.equal(context.hourBreakdown?.length, 12);
  assert.match(context.promptPayload.summaryLines.join('\n'), /流日：2008-02-08/);
  assert.match(context.promptPayload.breakdownLines?.[0] ?? '', /子时|丑时|寅时|卯时|辰时|巳时|午时|未时|申时|酉时|戌时|亥时/);
});
