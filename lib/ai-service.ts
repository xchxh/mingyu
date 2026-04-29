export interface AISettings {
  baseUrl: string;
  apiKey: string;
  modelId: string;
}

export const defaultAISettings: AISettings = {
  baseUrl: 'https://api.openai.com',
  apiKey: '',
  modelId: '',
};

export async function fetchAvailableModels(baseUrl: string, apiKey: string): Promise<string[]> {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const finalBaseUrl = normalizedBaseUrl.endsWith('/v1') ? normalizedBaseUrl : `${normalizedBaseUrl}/v1`;

  const response = await fetch(`${finalBaseUrl}/models`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch models: ' + response.statusText);
  }
  
  const data = await response.json();
  if (data.data && Array.isArray(data.data)) {
    return data.data.map((m: any) => m.id);
  }
  return [];
}

export async function* streamChatCompletion(
  settings: AISettings,
  prompt: string,
  systemPrompt?: string,
): AsyncGenerator<string, void, unknown> {
  const normalizedBaseUrl = settings.baseUrl.replace(/\/+$/, '');
  const finalBaseUrl = normalizedBaseUrl.endsWith('/v1') ? normalizedBaseUrl : `${normalizedBaseUrl}/v1`;
  
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch(`${finalBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.modelId,
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    let errText = response.statusText;
    try {
      const errJson = await response.json();
      if (errJson.error && errJson.error.message) {
        errText = errJson.error.message;
      }
    } catch {
      // Ignored
    }
    throw new Error('Failed to fetch chat completion: ' + errText);
  }

  if (!response.body) {
    throw new Error('No body returned');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            return;
          }
          if (data) {
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              // ignore JSON parse error in incomplete chunks
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
