import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/lib/test-utils';
import { Swipeable } from '@/components/swipeable';

describe('Swipeable', () => {
  it('renders children', () => {
    renderWithProviders(
      <Swipeable onDelete={() => {}}>
        <p>Swipeable Content</p>
      </Swipeable>
    );
    expect(screen.getByText('Swipeable Content')).toBeInTheDocument();
  });

  it('fires onDelete callback when delete button is clicked', () => {
    const onDelete = vi.fn();
    renderWithProviders(
      <Swipeable onDelete={onDelete}>
        <p>Swipeable Content</p>
      </Swipeable>
    );
    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
