import { render, screen } from '@testing-library/react';
import LoginForm from './components/auth/loginForm';
import { useUser } from './context/AuthContext';

jest.mock('./context/AuthContext', () => ({
  useUser: jest.fn()
}));

beforeEach(() => {
  useUser.mockReturnValue({ login: jest.fn() });
});

test('renderiza el botón Iniciar sesión', () => {
  render(<LoginForm />);
  const buttonElement = screen.getByText(/Iniciar sesión/i);
  expect(buttonElement).toBeInTheDocument();
});
