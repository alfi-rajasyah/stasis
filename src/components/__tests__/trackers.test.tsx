import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import TrackersPage from '@/app/trackers/page';
import { renderWithProviders } from '@/lib/test-utils';

// --- tRPC mock ---
// vi.hoisted runs before vi.mock, so the object references are shared.
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
      pay: { useMutation: vi.fn(createMutation) },
      cancel: { useMutation: vi.fn(createMutation) },
      add: { useMutation: vi.fn(createMutation) },
      delete: { useMutation: vi.fn(createMutation) },
    },
    recurringBills: {
      list: { useQuery: vi.fn() },
      togglePaid: { useMutation: vi.fn(createMutation) },
      add: { useMutation: vi.fn(createMutation) },
      delete: { useMutation: vi.fn(createMutation) },
    },
    debts: {
      list: { useQuery: vi.fn() },
      pay: { useMutation: vi.fn(createMutation) },
      add: { useMutation: vi.fn(createMutation) },
      delete: { useMutation: vi.fn(createMutation) },
    },
    categories: {
      list: { useQuery: vi.fn() },
    },
  };
});

vi.mock('@/trpc/client', () => ({ trpc: trpcMock }));

// --- Tests ---

describe('TrackersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: empty data, not loading
    trpcMock.subscriptions.list.useQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });
    trpcMock.recurringBills.list.useQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });
    trpcMock.debts.list.useQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });
    trpcMock.categories.list.useQuery.mockReturnValue({
      data: [],
    });
  });

  it('renders loading skeleton when queries are loading', () => {
    // All queries in loading state
    trpcMock.subscriptions.list.useQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    trpcMock.recurringBills.list.useQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    trpcMock.debts.list.useQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    renderWithProviders(<TrackersPage />);

    // Loading skeleton should be shown — the skeleton renders 3 card placeholders
    // with animate-pulse, but NO text (sub-tab buttons should NOT render)
    expect(screen.queryByText('Subscriptions')).not.toBeInTheDocument();
    expect(screen.queryByText('Bills')).not.toBeInTheDocument();
    expect(screen.queryByText('Debts')).not.toBeInTheDocument();

    // Verify skeleton structure: at least one animate-pulse element exists
    const skeletonEls = document.querySelectorAll('.animate-pulse');
    expect(skeletonEls.length).toBeGreaterThan(0);
  });

  it('renders 3 sub-tab navigation buttons (Subscriptions, Bills, Debts)', () => {
    renderWithProviders(<TrackersPage />);

    expect(screen.getByText('Subscriptions')).toBeInTheDocument();
    expect(screen.getByText('Bills')).toBeInTheDocument();
    expect(screen.getByText('Debts')).toBeInTheDocument();
  });

  it('renders empty state message for the default Subscriptions tab when data is empty', () => {
    renderWithProviders(<TrackersPage />);

    // Default active tab is 'subscriptions'
    expect(
      screen.getByText('No subscriptions yet. Add your first one.')
    ).toBeInTheDocument();

    // Monthly Burn should show Rp 0
    expect(screen.getByText('Rp 0')).toBeInTheDocument();
  });
});
