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
    expect(screen.getByText('output1')).toBeInTheDocument();
    expect(screen.getByText('output2')).toBeInTheDocument();
    // Expected outputs should now appear in the Assertions column for simple tests
    expect(screen.getByText('expected1')).toBeInTheDocument();
    expect(screen.getByText('expected2')).toBeInTheDocument();
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

  it('displays column headers correctly', () => {
    const results: TestResult[] = [
      { id: '1', testCaseName: 'Test 1', status: 'pass', expectedOutput: 'expected1', actualOutput: 'output1' },
    ];
    render(<TestResultsView results={results} />);
    expect(screen.getByText('Actual Output')).toBeInTheDocument();
    expect(screen.getByText('Assertions')).toBeInTheDocument();
    expect(screen.queryByText('Expected Output')).not.toBeInTheDocument();
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

  it('displays test case assertions when testCaseAssertions are provided', () => {
    const results: TestResult[] = [
      {
        id: '1',
        testCaseName: 'Test 1',
        status: 'pass',
        expectedOutput: 'expected1',
        actualOutput: 'output1',
        testCaseAssertions: [
          {
            assertionId: 'assertion-1',
            path: '$.value',
            matcher: 'toEqual',
            expected: 'hello, world',
            pathMatch: 'ANY',
          },
          {
            assertionId: 'assertion-2',
            path: '$.status',
            matcher: 'toContain',
            expected: 'success',
            pathMatch: 'ALL',
          },
        ],
      },
    ];
    render(<TestResultsView results={results} />);
    
    expect(screen.getByText('Test Case Assertions:')).toBeInTheDocument();
    expect(screen.getByText('$.value toEqual "hello, world"')).toBeInTheDocument();
    expect(screen.getByText('$.status toContain "success" (ALL match)')).toBeInTheDocument();
  });

  it('displays test case assertions with negation properly', () => {
    const results: TestResult[] = [
      {
        id: '1',
        testCaseName: 'Test 1',
        status: 'pass',
        expectedOutput: 'expected1',
        actualOutput: 'output1',
        testCaseAssertions: [
          {
            assertionId: 'assertion-1',
            path: '$.status',
            matcher: 'toEqual',
            expected: 'inactive',
            not: true,
            pathMatch: 'ANY',
          },
        ],
      },
    ];
    render(<TestResultsView results={results} />);
    
    expect(screen.getByText('$.status not toEqual "inactive"')).toBeInTheDocument();
  });

  it('displays test case assertions without expected value for matchers like toBeNull', () => {
    const results: TestResult[] = [
      {
        id: '1',
        testCaseName: 'Test 1',
        status: 'pass',
        expectedOutput: 'expected1',
        actualOutput: 'output1',
        testCaseAssertions: [
          {
            assertionId: 'assertion-1',
            path: '$.data',
            matcher: 'toBeNull',
            pathMatch: 'ANY',
          },
        ],
      },
    ];
    render(<TestResultsView results={results} />);
    
    expect(screen.getByText('$.data toBeNull')).toBeInTheDocument();
  });

  it('prefers test case assertions over assertion results when both are present', () => {
    const results: TestResult[] = [
      {
        id: '1',
        testCaseName: 'Test 1',
        status: 'pass',
        expectedOutput: 'expected1',
        actualOutput: 'output1',
        testCaseAssertions: [
          {
            assertionId: 'assertion-1',
            path: '$.value',
            matcher: 'toEqual',
            expected: 'hello',
            pathMatch: 'ANY',
          },
        ],
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
        ],
      },
    ];
    render(<TestResultsView results={results} />);
    
    // Should show test case assertions, not assertion results
    expect(screen.getByText('Test Case Assertions:')).toBeInTheDocument();
    expect(screen.getByText('$.value toEqual "hello"')).toBeInTheDocument();
    expect(screen.queryByTestId('test-results-assertion-chip-a1')).not.toBeInTheDocument();
  });

  it('falls back to assertion results when no test case assertions are provided', () => {
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
        ],
      },
    ];
    render(<TestResultsView results={results} />);
    
    // Should show assertion results
    expect(screen.queryByText('Test Case Assertions:')).not.toBeInTheDocument();
    expect(screen.getByTestId('test-results-assertion-chip-a1')).toBeInTheDocument();
  });

  it('displays expected output in assertions column for simple tests (no custom assertions)', () => {
    const results: TestResult[] = [
      {
        id: '1',
        testCaseName: 'Simple Test',
        status: 'pass',
        expectedOutput: 'Simple expected output',
        actualOutput: 'Simple actual output',
      },
    ];
    render(<TestResultsView results={results} />);
    
    // Should show expected output in the assertions column
    expect(screen.getByText('Expected Output:')).toBeInTheDocument();
    expect(screen.getByText('Simple expected output')).toBeInTheDocument();
    expect(screen.queryByTestId(/test-results-assertion-chip/)).not.toBeInTheDocument();
  });
});
