import { fireEvent, render, screen } from '@testing-library/react';
import type { ConfirmModalProps } from './ConfirmModal';
import { ConfirmModal } from './ConfirmModal';

describe('ConfirmModal', () => {
  const baseProps: ConfirmModalProps = {
    open: true,
    message: 'Are you sure?',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  it('renders the message', () => {
    render(<ConfirmModal {...baseProps} />);
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('calls onConfirm when Yes is clicked', () => {
    render(<ConfirmModal {...baseProps} />);
    fireEvent.click(screen.getByTestId('confirm-yes'));
    expect(baseProps.onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when No is clicked', () => {
    render(<ConfirmModal {...baseProps} />);
    fireEvent.click(screen.getByTestId('confirm-no'));
    expect(baseProps.onCancel).toHaveBeenCalled();
  });

  it('does not render when open is false', () => {
    render(<ConfirmModal {...baseProps} open={false} />);
    expect(screen.queryByText('Are you sure?')).toBeNull();
  });

  it('disables buttons and shows loading text when loading', () => {
    render(<ConfirmModal {...baseProps} loading={true} />);
    expect(screen.getByTestId('confirm-yes')).toBeDisabled();
    expect(screen.getByTestId('confirm-no')).toBeDisabled();
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });
});
