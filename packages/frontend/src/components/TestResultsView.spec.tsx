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
      { id: '1', testCaseName: 'Test 1', status: 'pass', expectedOutput: 'expected1', actualOutput: 'output1' },
      { id: '2', testCaseName: 'Test 2', status: 'fail', expectedOutput: 'expected2', actualOutput: 'output2' },
    ];
    render(<TestResultsView results={results} />);
    expect(screen.getByText('Test 1')).toBeInTheDocument();
    expect(screen.getByText('Test 2')).toBeInTheDocument();
    expect(screen.getByText('Pass')).toBeInTheDocument();
    expect(screen.getByText('Fail')).toBeInTheDocument();
    expect(screen.getByText('expected1')).toBeInTheDocument();
    expect(screen.getByText('expected2')).toBeInTheDocument();
    expect(screen.getByText('output1')).toBeInTheDocument();
    expect(screen.getByText('output2')).toBeInTheDocument();
  });

  it('applies correct color for pass/fail', () => {
    const results: TestResult[] = [
      { id: '1', testCaseName: 'Test 1', status: 'pass', expectedOutput: 'expected1', actualOutput: 'output1' },
      { id: '2', testCaseName: 'Test 2', status: 'fail', expectedOutput: 'expected2', actualOutput: 'output2' },
    ];
    render(<TestResultsView results={results} />);
    const passCell = screen.getByTestId('status-1');
    const failCell = screen.getByTestId('status-2');
    expect(passCell).toHaveClass('text-green-600');
    expect(failCell).toHaveClass('text-red-600');
  });

  it('displays expected output column header', () => {
    const results: TestResult[] = [
      { id: '1', testCaseName: 'Test 1', status: 'pass', expectedOutput: 'expected1', actualOutput: 'output1' },
    ];
    render(<TestResultsView results={results} />);
    expect(screen.getByText('Expected Output')).toBeInTheDocument();
    expect(screen.getByText('Actual Output')).toBeInTheDocument();
  });
});
