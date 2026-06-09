import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/lib/test-utils';
import { TabBar } from '@/components/tab-bar';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, className, ...props }: Record<string, unknown>) => (
    <a href={href as string} className={className as string} {...props}>
      {children as React.ReactNode}
    </a>
  ),
}));

import { usePathname } from 'next/navigation';

describe('TabBar', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockClear();
  });

  it('renders 4 navigation links with correct labels', () => {
    vi.mocked(usePathname).mockReturnValue('/');
    renderWithProviders(<TabBar />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4);
    expect(links[0]).toHaveTextContent('Home');
    expect(links[1]).toHaveTextContent('Budget');
    expect(links[2]).toHaveTextContent('Trackers');
    expect(links[3]).toHaveTextContent('Settings');
  });

  it('highlights the active route', () => {
    vi.mocked(usePathname).mockReturnValue('/budget');
    renderWithProviders(<TabBar />);

    const budgetLink = screen.getByRole('link', { name: /Budget/i });
    expect(budgetLink.innerHTML).toContain('text-emerald-400');
  });

  it('renders nothing on /login route', () => {
    vi.mocked(usePathname).mockReturnValue('/login');
    const { container } = renderWithProviders(<TabBar />);
    expect(container.innerHTML).toBe('');
  });
});
