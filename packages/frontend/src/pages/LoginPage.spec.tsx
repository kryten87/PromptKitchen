import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  it('renders the login heading and button', () => {
    render(<LoginPage />);
    // Use getByRole for heading to avoid multiple matches
    expect(screen.getByRole('heading', { name: /prompt kitchen/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login with google/i })).toBeInTheDocument();
  });
});
