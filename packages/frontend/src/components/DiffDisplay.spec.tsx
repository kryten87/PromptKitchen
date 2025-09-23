import { render, screen } from '@testing-library/react';
import { DiffDisplay } from './DiffDisplay';

describe('DiffDisplay', () => {
  it('should render "identical" message when expected and actual are the same', () => {
    const expectedText = 'Hello\nWorld';
    const actualText = 'Hello\nWorld';
    
    render(<DiffDisplay expectedText={expectedText} actualText={actualText} />);
    
    expect(screen.getByText('✓ Expected and actual outputs are identical')).toBeInTheDocument();
  });

  it('should not render legend when outputs are identical', () => {
    const expectedText = 'Hello\nWorld';
    const actualText = 'Hello\nWorld';
    
    render(<DiffDisplay expectedText={expectedText} actualText={actualText} />);
    
    expect(screen.getByText('✓ Expected and actual outputs are identical')).toBeInTheDocument();
    expect(screen.queryByTestId('diff-legend')).not.toBeInTheDocument();
  });

  it('should render diff when expected and actual are different', () => {
    const expectedText = 'Hello\nWorld';
    const actualText = 'Hello\nUniverse';
    
    render(<DiffDisplay expectedText={expectedText} actualText={actualText} />);
    
    // Check that diff characters are present
    const diffChars = screen.getAllByTestId(/^diff-char-/);
    expect(diffChars.length).toBeGreaterThan(0);
    
    // Check that legend is present
    expect(screen.getByTestId('diff-legend')).toBeInTheDocument();
    expect(screen.getByText('Removed text')).toBeInTheDocument();
    expect(screen.getByText('Added text')).toBeInTheDocument();
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
    
    const diffChars = screen.getAllByTestId(/^diff-char-/);
    expect(diffChars.length).toBeGreaterThan(0);
  });

  it('should handle multiline differences', () => {
    const expectedText = 'Line 1\nLine 2\nLine 3';
    const actualText = 'Line 1\nModified Line 2\nLine 3';
    
    render(<DiffDisplay expectedText={expectedText} actualText={actualText} />);
    
    const diffChars = screen.getAllByTestId(/^diff-char-/);
    expect(diffChars.length).toBeGreaterThan(0);
    
    // Legend should be present for multiline diffs too
    expect(screen.getByTestId('diff-legend')).toBeInTheDocument();
  });

  it('should show character-level changes with removed text struck through', () => {
    const expectedText = 'Hello World';
    const actualText = 'Hello Universe';
    
    render(<DiffDisplay expectedText={expectedText} actualText={actualText} />);
    
    // Should have both removed and added characters
    const diffChars = screen.getAllByTestId(/^diff-char-/);
    expect(diffChars.length).toBeGreaterThan(0);
    
    // Check for styling classes
    const removedChar = diffChars.find(char => char.className.includes('bg-red-100'));
    const addedChar = diffChars.find(char => char.className.includes('bg-green-100'));
    
    expect(removedChar).toBeDefined();
    expect(addedChar).toBeDefined();
  });

  it('should highlight single character changes', () => {
    const expectedText = 'cat';
    const actualText = 'bat';
    
    render(<DiffDisplay expectedText={expectedText} actualText={actualText} />);
    
    const diffChars = screen.getAllByTestId(/^diff-char-/);
    expect(diffChars.length).toBeGreaterThan(0);
    
    // Should show 'c' as removed and 'b' as added, with 'at' unchanged
    expect(screen.getByTestId('diff-legend')).toBeInTheDocument();
  });
});