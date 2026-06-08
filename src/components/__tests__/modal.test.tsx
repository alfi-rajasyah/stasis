import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/lib/test-utils';
import { Modal } from '@/components/modal';

describe('Modal', () => {
  it('renders children and title when open', () => {
    renderWithProviders(
      <Modal open={true} onClose={() => {}} title="Test Title">
        <p>Modal Content</p>
      </Modal>
    );
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('returns nothing when closed', () => {
    const { container } = renderWithProviders(
      <Modal open={false} onClose={() => {}} title="Test Title">
        <p>Modal Content</p>
      </Modal>
    );
    expect(container.innerHTML).toBe('');
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    renderWithProviders(
      <Modal open={true} onClose={onClose} title="Test Title">
        <p>Modal Content</p>
      </Modal>
    );
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
