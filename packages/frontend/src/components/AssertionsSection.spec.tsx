import { evaluateAssertions } from '@prompt-kitchen/shared/src/evaluation/evaluateAssertions';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { AssertionsSection, type Assertion } from './AssertionsSection';

// Mock the registry from the shared package
jest.mock('@prompt-kitchen/shared/src/evaluation/matcher', () => ({
  registry: {
    toEqual: { arity: 'one' },
    toBeNull: { arity: 'none' },
    toMatch: { arity: 'one' },
  },
  defaultMatcherContext: {},
}));

// Mock the evaluateAssertions function
jest.mock('@prompt-kitchen/shared/src/evaluation/evaluateAssertions', () => ({
  evaluateAssertions: jest.fn(() => ({
    results: [{ passed: true, message: 'Mocked pass' }],
    pass: true,
    passCount: 1,
    failCount: 0,
    count: 1,
  })),
}));

describe('AssertionsSection Component', () => {
  const initialAssertions: Assertion[] = [
    { id: '1', assertionId: 'a1', path: '$.name', matcher: 'toEqual', expected: 'test' },
    { id: '2', assertionId: 'a2', path: '$.age', matcher: 'toBeNull' },
  ];

  it('renders no assertions message when empty', () => {
    render(<AssertionsSection assertions={[]} onChange={jest.fn()} />);
    expect(screen.getByText('No assertions defined')).toBeInTheDocument();
  });

  it('renders the list of assertions', () => {
    render(<AssertionsSection assertions={initialAssertions} onChange={jest.fn()} />);
    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(2);
  });

  it('adds a new assertion when "Add assertion" is clicked', () => {
    const handleChange = jest.fn();
    render(<AssertionsSection assertions={[]} onChange={handleChange} />);

    const addButton = screen.getByText('+ Add assertion');
    fireEvent.click(addButton);

    expect(handleChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          path: '',
          matcher: 'toEqual',
        }),
      ])
    );
  });

  it('removes an assertion when its remove button is clicked', () => {
    const handleChange = jest.fn();
    render(<AssertionsSection assertions={initialAssertions} onChange={handleChange} />);

    const firstRow = screen.getAllByRole('listitem')[0];
    const removeButton = within(firstRow).getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    expect(handleChange).toHaveBeenCalledWith(
      expect.not.arrayContaining([
        expect.objectContaining({ id: '1' }),
      ])
    );
  });

  it('selects an assertion row on click', () => {
    render(<AssertionsSection assertions={initialAssertions} onChange={jest.fn()} />);
    const secondRow = screen.getAllByRole('listitem')[1];
    fireEvent.click(secondRow);
    expect(secondRow).toHaveClass('bg-blue-100');
  });

  it('shows the ExpectedPanel for the selected assertion', () => {
    render(<AssertionsSection assertions={initialAssertions} onChange={jest.fn()} />);
    const firstRow = screen.getAllByRole('listitem')[0];
    fireEvent.click(firstRow);

    const expectedPanel = screen.getByText('Expected Value for Selected Assertion');
    expect(expectedPanel).toBeInTheDocument();
    // Check that the textarea for the first assertion is visible
    expect(screen.getByDisplayValue('test')).toBeInTheDocument();
  });

  it('hides the ExpectedPanel for an assertion that does not need it', () => {
    render(<AssertionsSection assertions={initialAssertions} onChange={jest.fn()} />);
    const secondRow = screen.getAllByRole('listitem')[1];
    fireEvent.click(secondRow);

    const expectedPanel = screen.getByText('Expected Value for Selected Assertion');
    expect(expectedPanel).toBeInTheDocument();
    // Check that the "no expected value" message is shown
    expect(screen.getByText('This matcher does not require an expected value.')).toBeInTheDocument();
  });

  it('calls evaluateAssertions and shows preview results on "Preview" click', () => {
    render(<AssertionsSection assertions={initialAssertions} onChange={jest.fn()} />);

    const previewButton = screen.getByText('Preview');
    fireEvent.click(previewButton);

    expect(evaluateAssertions).toHaveBeenCalled();
    expect(screen.getByText('Preview Results')).toBeInTheDocument();
    expect(screen.getByText('Mocked pass')).toBeInTheDocument();
  });
});
