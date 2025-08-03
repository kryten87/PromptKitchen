import { render, screen } from '@testing-library/react';
import type { TestResult } from './TestResultsView';
import { TestResultsView } from './TestResultsView';

describe('TestResultsView', () => {
  it('renders no results message when results are empty', () => {
    render(<TestResultsView results={[]} />);
    expect(screen.getByText(/no test results to display/i)).toBeInTheDocument();
  });

  it('renders a table of results', () => {
    const results: TestResult[] = [
      { id: '1', testCaseName: 'Test 1', status: 'pass', actualOutput: 'output1' },
      { id: '2', testCaseName: 'Test 2', status: 'fail', actualOutput: 'output2' },
    ];
    render(<TestResultsView results={results} />);
    expect(screen.getByText('Test 1')).toBeInTheDocument();
    expect(screen.getByText('Test 2')).toBeInTheDocument();
    expect(screen.getByText('Pass')).toBeInTheDocument();
    expect(screen.getByText('Fail')).toBeInTheDocument();
    expect(screen.getByText('output1')).toBeInTheDocument();
    expect(screen.getByText('output2')).toBeInTheDocument();
  });

  it('applies correct color for pass/fail', () => {
    const results: TestResult[] = [
      { id: '1', testCaseName: 'Test 1', status: 'pass', actualOutput: 'output1' },
      { id: '2', testCaseName: 'Test 2', status: 'fail', actualOutput: 'output2' },
    ];
    render(<TestResultsView results={results} />);
    const passCell = screen.getByText('Pass');
    const failCell = screen.getByText('Fail');
    expect(passCell).toHaveClass('text-green-600');
    expect(failCell).toHaveClass('text-red-600');
  });
});
