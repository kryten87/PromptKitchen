import { render, screen, fireEvent } from '@testing-library/react';
import { AssertionsSection } from './AssertionsSection';
import type { Assertion } from '@prompt-kitchen/shared/src/types';

interface TestAssertion extends Assertion {
  id: string;
}

describe('AssertionsSection Component', () => {
  it('renders no assertions message when empty', () => {
    render(<AssertionsSection assertions={[]} onChange={jest.fn()} />);

    expect(screen.getByText('No assertions defined')).toBeInTheDocument();
  });

  it('adds a new assertion', () => {
    const handleChange = jest.fn();
    render(<AssertionsSection assertions={[]} onChange={handleChange} />);

    const addButton = screen.getByText('+ Add assertion');
    fireEvent.click(addButton);

    expect(handleChange).toHaveBeenCalled();
  });

  it('renders preview results', () => {
    const sampleAssertions: TestAssertion[] = [
      { assertionId: '1', id: '1', path: '$.user.name', matcher: 'toEqual', expected: 'John' },
    ];
    render(<AssertionsSection assertions={sampleAssertions} onChange={jest.fn()} />);

    // Simulate clicking the Preview button to populate previewResults
    const previewButton = screen.getByText('Preview');
    fireEvent.click(previewButton);

    expect(screen.getByText('Preview Results')).toBeInTheDocument();
  });
});
