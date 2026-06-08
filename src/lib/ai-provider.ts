import { createOpenAI } from '@ai-sdk/openai';

export type AIConfig = {
  baseURL: string;
  model: string;
  apiKey: string;
  fallbackModel: string;
};

/**
 * Creates an OpenAI-compatible model instance using the provided config.
 * Supports any OpenAI-compatible endpoint (DeepSeek, OpenAI, Anthropic, etc.)
 */
export function getModel({ baseURL, apiKey, model }: { baseURL: string; apiKey: string; model: string }) {
  const openai = createOpenAI({ baseURL, apiKey });
  return openai(model);
}

/**
 * Reads AI config from the Setting model (user overrides) with fallback to process.env.
 *
 * Priority: Setting model > process.env > ''
 */
export async function getAIConfig(
  prisma: { setting: { findUnique: (args: { where: { key: string } }) => Promise<{ value: string } | null> } },
): Promise<AIConfig> {
  const readSetting = async (key: string, envKey: string): Promise<string> => {
    const setting = await prisma.setting.findUnique({ where: { key } });
    return setting?.value ?? process.env[envKey] ?? '';
  };

  return {
    baseURL: await readSetting('ai_baseUrl', 'AI_BASE_URL'),
    model: await readSetting('ai_model', 'AI_MODEL'),
    apiKey: await readSetting('ai_apiKey', 'AI_API_KEY'),
    fallbackModel: await readSetting('ai_fallbackModel', 'AI_FALLBACK_MODEL'),
  };
}

/** Default env keys for reference */
export const AI_ENV_DEFAULTS: AIConfig = {
  baseURL: process.env.AI_BASE_URL ?? 'https://api.deepseek.com/v1',
  model: process.env.AI_MODEL ?? 'deepseek-chat',
  apiKey: process.env.AI_API_KEY ?? '',
  fallbackModel: process.env.AI_FALLBACK_MODEL ?? 'deepseek-chat',
};
