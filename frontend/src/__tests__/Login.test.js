import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';

const mockLogin = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

function renderLogin() {
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

beforeEach(() => {
  mockLogin.mockReset();
  mockNavigate.mockReset();
});

test('successful login navigates home', async () => {
  const user = userEvent.setup();
  mockLogin.mockResolvedValueOnce();
  renderLogin();

  await user.type(screen.getByLabelText('Email'), 'admin@lms.com');
  await user.type(screen.getByLabelText('Password'), 'admin123');
  await user.click(screen.getByRole('button', { name: 'Login' }));

  expect(mockLogin).toHaveBeenCalledWith('admin@lms.com', 'admin123');
  expect(mockNavigate).toHaveBeenCalledWith('/');
});

test('failed login shows backend error and stays on page', async () => {
  const user = userEvent.setup();
  mockLogin.mockRejectedValueOnce({
    response: { status: 401, data: { error: 'Invalid credentials' } },
  });
  renderLogin();

  await user.type(screen.getByLabelText('Email'), 'admin@lms.com');
  await user.type(screen.getByLabelText('Password'), 'wrong');
  await user.click(screen.getByRole('button', { name: 'Login' }));

  expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  expect(mockNavigate).not.toHaveBeenCalled();
});
