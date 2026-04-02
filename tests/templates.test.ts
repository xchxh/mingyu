import test from 'node:test';
import assert from 'node:assert/strict';
import { promptTemplates } from '../src/lib/templates';

test('所有模板在空对象输入时都不会抛错', () => {
  for (const template of promptTemplates) {
    assert.doesNotThrow(() => {
      const result = template.build({});
      assert.equal(typeof result.system, 'string');
      assert.equal(typeof result.user, 'string');
    }, `模板 ${template.id} 在空输入下不应崩溃`);
  }
});

test('紫微模板不再重复注入角色设定', () => {
  const reportTemplate = promptTemplates.find((template) => template.id === 'ziwei-analysis');
  const chatTemplate = promptTemplates.find((template) => template.id === 'ziwei-chat');

  assert.ok(reportTemplate);
  assert.ok(chatTemplate);

  const reportPrompt = reportTemplate.build({});
  const chatPrompt = chatTemplate.build({});

  const reportMatches = `${reportPrompt.system}\n${reportPrompt.user}`.match(/资深紫微斗数命盘分析师/g) ?? [];
  const chatMatches = `${chatPrompt.system}\n${chatPrompt.user}`.match(/资深紫微斗数命盘分析师/g) ?? [];

  assert.equal(reportMatches.length, 1);
  assert.equal(chatMatches.length, 1);
  assert.doesNotMatch(reportPrompt.user, /【任务信息】/);
  assert.doesNotMatch(chatPrompt.user, /【任务信息】/);
  assert.doesNotMatch(reportPrompt.user, /可直接给在线 AI 使用/);
});

test('紫微模板会把原始盘面 JSON 转成中文分节摘要', () => {
  const reportTemplate = promptTemplates.find((template) => template.id === 'ziwei-analysis');

  assert.ok(reportTemplate);

  const result = reportTemplate.build({
    reportTitle: '命局综述',
    reportContextJson: JSON.stringify({
      解读主题: '命局解读',
      报告类型: '命局综述',
      时限: '本命',
    }),
    payloadJson: JSON.stringify({
      basic_info: {
        gender: '女',
        solar_date: '1995-01-01',
        lunar_date: '腊月初一',
        birth_time_label: '子时',
        birth_time_range: '23:00-01:00',
        soul: '紫微',
        body: '天相',
        five_elements_class: '金四局',
      },
      active_scope: {
        label: '本命',
        solar_date: '2026-04-02',
        nominal_age: 32,
        mutagen_map: [{ star: '武曲', mutagen: '禄' }],
      },
      palaces: [
        {
          name: '命宫',
          major_stars: [{ name: '紫微' }],
          summary_tags: ['主见强'],
          scope_hits: ['命宫引动'],
        },
      ],
      evidence_pool: [
        {
          title: '命宫主星得势',
          palace_names: ['命宫'],
          star_names: ['紫微'],
          mutagens: ['禄'],
        },
      ],
    }),
  });

  assert.match(result.user, /【分析背景】/);
  assert.match(result.user, /【基础信息】/);
  assert.match(result.user, /【当前运限】/);
  assert.match(result.user, /【重点宫位摘要】/);
  assert.match(result.user, /【关键证据摘要】/);
  assert.doesNotMatch(result.user, /"basic_info"/);
  assert.doesNotMatch(result.user, /"active_scope"/);
});
