import { render, screen } from '@testing-library/react';
import { DiffDisplay } from './DiffDisplay';

describe('DiffDisplay', () => {
  it('should render "identical" message when expected and actual are the same', () => {
    const expectedText = 'Hello\nWorld';
    const actualText = 'Hello\nWorld';
    
    render(<DiffDisplay expectedText={expectedText} actualText={actualText} />);
    
    expect(screen.getByText('✓ Expected and actual outputs are identical')).toBeInTheDocument();
  });

  it('should render diff when expected and actual are different', () => {
    const expectedText = 'Hello\nWorld';
    const actualText = 'Hello\nUniverse';
    
    render(<DiffDisplay expectedText={expectedText} actualText={actualText} />);
    
    // Check that diff lines are present
    const diffLines = screen.getAllByTestId(/^diff-line-/);
    expect(diffLines.length).toBeGreaterThan(0);
  });

  it('should render with custom label', () => {
    const expectedText = 'Hello';
    const actualText = 'Hi';
    const label = 'Custom Label';
    
    render(<DiffDisplay expectedText={expectedText} actualText={actualText} label={label} />);
    
    expect(screen.getByText(`${label}:`)).toBeInTheDocument();
  });

  it('should handle empty strings', () => {
    const expectedText = '';
    const actualText = 'Something';
    
    render(<DiffDisplay expectedText={expectedText} actualText={actualText} />);
    
    const diffLines = screen.getAllByTestId(/^diff-line-/);
    expect(diffLines.length).toBeGreaterThan(0);
  });

  it('should handle multiline differences', () => {
    const expectedText = 'Line 1\nLine 2\nLine 3';
    const actualText = 'Line 1\nModified Line 2\nLine 3';
    
    render(<DiffDisplay expectedText={expectedText} actualText={actualText} />);
    
    const diffLines = screen.getAllByTestId(/^diff-line-/);
    expect(diffLines.length).toBeGreaterThan(0);
  });
});