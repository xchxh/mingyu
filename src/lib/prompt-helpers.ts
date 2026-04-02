export function stringifyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function safeParseJson(raw: string) {
  if (!raw.trim()) {
    return { ok: true as const, value: null };
  }

  try {
    return { ok: true as const, value: JSON.parse(raw) };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'JSON 解析失败',
    };
  }
}

export function joinSections(sections: Array<string | null | undefined>) {
  return sections.filter(Boolean).join('\n\n');
}
