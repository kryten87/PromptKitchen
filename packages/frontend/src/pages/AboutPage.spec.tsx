import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { AboutPage } from './AboutPage';

describe('AboutPage', () => {
  it('renders the about heading', () => {
    render(<AboutPage />);
    // Only check for the heading to avoid multiple matches
    expect(screen.getByRole('heading', { name: /about/i })).toBeInTheDocument();
  });
});
