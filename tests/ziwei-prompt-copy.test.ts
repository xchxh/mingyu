import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ZIWEI_ANALYSIS_REQUIREMENT,
  ZIWEI_ANALYST_ROLE,
  ZIWEI_COMPATIBILITY_ROLE,
} from '../src/lib/ziwei-prompt-copy';
import { promptTemplates } from '../src/lib/templates';

test('紫微角色文案具备明确角色设定', () => {
  assert.match(ZIWEI_ANALYST_ROLE, /资深紫微斗数命盘分析师/);
  assert.match(ZIWEI_ANALYST_ROLE, /命宫、身宫、十二宫/);
  assert.match(ZIWEI_COMPATIBILITY_ROLE, /资深紫微斗数合盘分析师/);
  assert.match(ZIWEI_ANALYSIS_REQUIREMENT, /结论需对应盘面依据/);
});

test('紫微模板输出里使用新角色且不重复注入', () => {
  const reportTemplate = promptTemplates.find((item) => item.id === 'ziwei-analysis');
  const chatTemplate = promptTemplates.find((item) => item.id === 'ziwei-chat');

  assert.ok(reportTemplate);
  assert.ok(chatTemplate);

  for (const template of [reportTemplate, chatTemplate]) {
    const result = template.build({});
    const combined = `${result.system}\n${result.user}`;
    const roleMatches = combined.match(/资深紫微斗数命盘分析师/g) ?? [];

    assert.equal(roleMatches.length, 1);
    assert.doesNotMatch(combined, /你是一位紫微斗数分析助手。/);
    assert.doesNotMatch(combined, /【任务信息】/);
  }
});
