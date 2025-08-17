import { act, fireEvent, render, screen } from '@testing-library/react';
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
  it('renders assertion chips for results with assertionResults', () => {
    const results: TestResult[] = [
      {
        id: '1',
        testCaseName: 'Test 1',
        status: 'pass',
        expectedOutput: 'expected1',
        actualOutput: 'output1',
        assertionResults: [
          {
            assertionId: 'a1',
            path: '$.foo',
            matcher: 'toEqual',
            not: false,
            pathMatch: 'ANY',
            passed: true,
            actualSamples: ['bar'],
            message: 'Matched',
          },
          {
            assertionId: 'a2',
            path: '$.bar',
            matcher: 'toMatch',
            not: false,
            pathMatch: 'ALL',
            passed: false,
            actualSamples: ['baz'],
            message: 'Did not match',
          },
        ],
      },
    ];
    render(<TestResultsView results={results} />);
    const chip1 = screen.getByTestId('test-results-assertion-chip-a1');
    const chip2 = screen.getByTestId('test-results-assertion-chip-a2');
    expect(chip1).toHaveTextContent('Pass | $.foo | toEqual | ANY');
    expect(chip2).toHaveTextContent('Fail | $.bar | toMatch | ALL');
  });

  it('expands and collapses actualSamples for assertion chips', () => {
    const results: TestResult[] = [
      {
        id: '1',
        testCaseName: 'Test 1',
        status: 'pass',
        expectedOutput: 'expected1',
        actualOutput: 'output1',
        assertionResults: [
          {
            assertionId: 'a1',
            path: '$.foo',
            matcher: 'toEqual',
            not: false,
            pathMatch: 'ANY',
            passed: true,
            actualSamples: ['bar', 'baz'],
            message: 'Matched',
          },
        ],
      },
    ];
    render(<TestResultsView results={results} />);
    const expandBtn = screen.getByTestId('test-results-assertion-expand-button-a1');
    expect(screen.queryByTestId('test-results-assertion-samples-area-a1')).not.toBeInTheDocument();
    act(() => {
      fireEvent.click(expandBtn);
    });
    expect(screen.getByTestId('test-results-assertion-samples-area-a1')).toBeInTheDocument();
    expect(screen.getByTestId('test-results-assertion-sample-row-a1-0')).toHaveTextContent('bar');
    expect(screen.getByTestId('test-results-assertion-sample-row-a1-1')).toHaveTextContent('baz');
    act(() => {
      fireEvent.click(expandBtn);
    });
    expect(screen.queryByTestId('test-results-assertion-samples-area-a1')).not.toBeInTheDocument();
  });

  it('shows truncation marker and hash if samples are truncated', () => {
    const results: TestResult[] = [
      {
        id: '1',
        testCaseName: 'Test 1',
        status: 'pass',
        expectedOutput: 'expected1',
        actualOutput: 'output1',
        assertionResults: [
          {
            assertionId: 'a1',
            path: '$.foo',
            matcher: 'toEqual',
            not: false,
            pathMatch: 'ANY',
            passed: true,
            actualSamples: ['bar', { truncated: true, hash: 'abc123' }],
            message: 'Matched',
          },
        ],
      },
    ];
    render(<TestResultsView results={results} />);
    const expandBtn = screen.getByTestId('test-results-assertion-expand-button-a1');
    act(() => {
      fireEvent.click(expandBtn);
    });
    expect(screen.getByTestId('test-results-assertion-sample-truncated-a1')).toHaveTextContent('...truncated');
    expect(screen.getByTestId('test-results-assertion-sample-hash-a1')).toHaveTextContent('SHA-256: abc123');
  });

  it('shows empty state if no actualSamples', () => {
    const results: TestResult[] = [
      {
        id: '1',
        testCaseName: 'Test 1',
        status: 'pass',
        expectedOutput: 'expected1',
        actualOutput: 'output1',
        assertionResults: [
          {
            assertionId: 'a1',
            path: '$.foo',
            matcher: 'toEqual',
            not: false,
            pathMatch: 'ANY',
            passed: true,
            actualSamples: [],
            message: 'Matched',
          },
        ],
      },
    ];
    render(<TestResultsView results={results} />);
    const expandBtn = screen.getByTestId('test-results-assertion-expand-button-a1');
    act(() => {
      fireEvent.click(expandBtn);
    });
    expect(screen.getByTestId('test-results-assertion-sample-empty-a1')).toHaveTextContent('No samples');
  });
});
