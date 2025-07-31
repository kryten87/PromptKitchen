import { render, screen } from '@testing-library/react';
import { HomePage } from './HomePage';

// Add this import for custom matchers
import '@testing-library/jest-dom';

describe('HomePage', () => {
  it('renders without crashing', () => {
    render(<HomePage />);
    // Check for a recognizable element or text
    // Adjust this selector if HomePage has a specific heading or text
    // Use a less strict selector to avoid multiple matches
    expect(screen.getByText(/home/i)).toBeInTheDocument();
  });
});
