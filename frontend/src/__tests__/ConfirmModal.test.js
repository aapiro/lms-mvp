import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmModal from '../components/ConfirmModal';

test('renders title and message', () => {
  render(
    <ConfirmModal
      title="Delete course"
      message="This cannot be undone"
      onConfirm={() => {}}
      onCancel={() => {}}
    />
  );
  expect(screen.getByRole('heading', { name: 'Delete course' })).toBeInTheDocument();
  expect(screen.getByText('This cannot be undone')).toBeInTheDocument();
});

test('invokes callbacks from action buttons', async () => {
  const user = userEvent.setup();
  const onConfirm = jest.fn();
  const onCancel = jest.fn();
  render(<ConfirmModal onConfirm={onConfirm} onCancel={onCancel} />);

  await user.click(screen.getByRole('button', { name: 'Confirm' }));
  expect(onConfirm).toHaveBeenCalledTimes(1);

  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(onCancel).toHaveBeenCalledTimes(1);
});
