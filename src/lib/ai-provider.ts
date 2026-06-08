import { createDeepSeek } from '@ai-sdk/deepseek';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

export type SupportedModel =
  | 'deepseek-chat'
  | 'deepseek-reasoner'
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4-turbo'
  | 'o3-mini'
  | 'claude-3-5-sonnet-latest'
  | 'claude-3-haiku-latest';

export const AVAILABLE_MODELS: { value: SupportedModel; label: string; provider: string }[] = [
  { value: 'deepseek-chat', label: 'DeepSeek V3', provider: 'DeepSeek' },
  { value: 'deepseek-reasoner', label: 'DeepSeek R1', provider: 'DeepSeek' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'OpenAI' },
  { value: 'gpt-4o', label: 'GPT-4o', provider: 'OpenAI' },
  { value: 'o3-mini', label: 'o3 Mini', provider: 'OpenAI' },
  { value: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { value: 'claude-3-haiku-latest', label: 'Claude 3 Haiku', provider: 'Anthropic' },
];

export function getModel(modelId: SupportedModel) {
  if (modelId.startsWith('deepseek')) {
    const deepseek = createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY! });
    return deepseek(modelId as string);
  }
  if (modelId.startsWith('gpt') || modelId.startsWith('o1') || modelId.startsWith('o3')) {
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    return openai(modelId as string);
  }
  if (modelId.startsWith('claude')) {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    return anthropic(modelId as string);
  }
  throw new Error(`Unknown model: ${modelId}`);
}
