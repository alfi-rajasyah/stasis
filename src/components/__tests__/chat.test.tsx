import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import ChatPage from '@/app/chat/page';
import { renderWithProviders } from '@/lib/test-utils';

// --- tRPC mock ---
const trpcMock = vi.hoisted(() => {
  const createMutation = () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    variables: undefined,
    error: null,
    isSuccess: false,
    isError: false,
    data: undefined,
    reset: vi.fn(),
    status: 'idle' as const,
  });

  const mockUtils = {
    subscriptions: { list: { invalidate: vi.fn() } },
    recurringBills: { list: { invalidate: vi.fn() } },
    debts: { list: { invalidate: vi.fn() } },
    dashboard: { getSummary: { invalidate: vi.fn() } },
    ai: { conversations: { invalidate: vi.fn() } },
  };

  return {
    useUtils: vi.fn(() => mockUtils),
    subscriptions: {
      list: { useQuery: vi.fn() },
    },
    recurringBills: {
      list: { useQuery: vi.fn() },
    },
    debts: {
      list: { useQuery: vi.fn() },
    },
    ai: {
      conversations: { useQuery: vi.fn() },
      createConversation: { useMutation: vi.fn(createMutation) },
      conversation: { useQuery: vi.fn() },
      addMessages: { useMutation: vi.fn(createMutation) },
      deleteConversation: { useMutation: vi.fn(createMutation) },
      getSetting: { useQuery: vi.fn() },
      setSetting: { useMutation: vi.fn(createMutation) },
      getConfig: { useQuery: vi.fn() },
    },
  };
});

vi.mock('@/trpc/client', () => ({ trpc: trpcMock }));

// --- AI provider mock (avoid importing AI SDK packages in jsdom) ---
vi.mock('@/lib/ai-provider', () => ({
  getModel: vi.fn(() => ({})),
  getAIConfig: vi.fn(() => Promise.resolve({
    baseURL: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    apiKey: '',
    fallbackModel: 'deepseek-chat',
  })),
  AI_ENV_DEFAULTS: {
    baseURL: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    apiKey: '',
    fallbackModel: 'deepseek-chat',
  },
}));

// --- Tests ---

describe('ChatPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: no conversations, no active conversation
    trpcMock.ai.conversations.useQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });
    trpcMock.ai.conversation.useQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    });
    trpcMock.ai.getSetting.useQuery.mockReturnValue({
      data: { value: 'deepseek-chat' },
      isLoading: false,
    });
  });

  it('renders empty state with Start Chat CTA when no conversation exists', () => {
    renderWithProviders(<ChatPage />);

    expect(screen.getByText('Ask Stasis anything')).toBeInTheDocument();
    expect(
      screen.getByText('Add data, get insights, or ask questions about your finances')
    ).toBeInTheDocument();
    expect(screen.getByText('Start Chat')).toBeInTheDocument();
  });

  it('renders conversation list when conversations exist', () => {
    trpcMock.ai.conversations.useQuery.mockReturnValue({
      data: [
        { id: 'conv-1', title: 'Budget planning', createdAt: new Date('2025-06-01').toISOString() },
        { id: 'conv-2', title: 'Investment questions', createdAt: new Date('2025-06-05').toISOString() },
      ],
      isLoading: false,
    });

    renderWithProviders(<ChatPage />);

    expect(screen.getByText('Recent')).toBeInTheDocument();
    expect(screen.getByText('Budget planning')).toBeInTheDocument();
    expect(screen.getByText('Investment questions')).toBeInTheDocument();
  });


});
