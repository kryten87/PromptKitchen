import { act, fireEvent, render, screen } from '@testing-library/react';
import type { TestResult } from './TestResultsView';
import { TestResultsView } from './TestResultsView';

describe('TestResultsView', () => {
  it('renders no results message when results are empty', () => {
    render(<TestResultsView results={[]} />);
    expect(screen.getByText(/no test results to display/i)).toBeInTheDocument();
  });

  it('renders a collapsible list of test results', () => {
    const results: TestResult[] = [
      { id: '1', testCaseName: 'Test 1', status: 'pass', expectedOutput: 'expected1', actualOutput: 'output1' },
      { id: '2', testCaseName: 'Test 2', status: 'fail', expectedOutput: 'expected2', actualOutput: 'output2' },
    ];
    render(<TestResultsView results={results} />);
    
    // Should show test names and statuses in collapsed state
    expect(screen.getByText('Test 1')).toBeInTheDocument();
    expect(screen.getByText('Test 2')).toBeInTheDocument();
    expect(screen.getByText('Pass')).toBeInTheDocument();
    expect(screen.getByText('Fail')).toBeInTheDocument();
    
    // Details panels should not be visible initially
    expect(screen.queryByTestId('test-result-details-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('test-result-details-2')).not.toBeInTheDocument();
  });

  it('applies correct color for pass/fail status badges', () => {
    const results: TestResult[] = [
      { id: '1', testCaseName: 'Test 1', status: 'pass', expectedOutput: 'expected1', actualOutput: 'output1' },
      { id: '2', testCaseName: 'Test 2', status: 'fail', expectedOutput: 'expected2', actualOutput: 'output2' },
    ];
    render(<TestResultsView results={results} />);
    const passCell = screen.getByTestId('status-1');
    const failCell = screen.getByTestId('status-2');
    expect(passCell).toHaveClass('bg-green-100', 'text-green-800');
    expect(failCell).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('expands test result on click to show expected vs actual values', () => {
    const results: TestResult[] = [
      { id: '1', testCaseName: 'Test 1', status: 'pass', expectedOutput: 'expected1', actualOutput: 'output1' },
    ];
    render(<TestResultsView results={results} />);
    
    // Initially collapsed - details not visible
    expect(screen.queryByTestId('test-result-details-1')).not.toBeInTheDocument();
    
    // Click to expand
    const header = screen.getByTestId('test-result-header-1');
    act(() => {
      fireEvent.click(header);
    });
    
    // Now details should be visible - check for diff display
    expect(screen.getByTestId('test-result-details-1')).toBeInTheDocument();
    expect(screen.getByText('Output Comparison:')).toBeInTheDocument();
    
    // Check that the diff display is present with character spans
    const diffChars = screen.getAllByTestId(/^diff-char-/);
    expect(diffChars.length).toBeGreaterThan(0);
  });

  it('collapses test result on second click', () => {
    const results: TestResult[] = [
      { id: '1', testCaseName: 'Test 1', status: 'pass', expectedOutput: 'expected1', actualOutput: 'output1' },
    ];
    render(<TestResultsView results={results} />);
    
    const header = screen.getByTestId('test-result-header-1');
    
    // Expand first
    act(() => {
      fireEvent.click(header);
    });
    expect(screen.getByTestId('test-result-details-1')).toBeInTheDocument();
    
    // Click again to collapse
    act(() => {
      fireEvent.click(header);
    });
    expect(screen.queryByTestId('test-result-details-1')).not.toBeInTheDocument();
  });

  it('shows only one expanded test result at a time', () => {
    const results: TestResult[] = [
      { id: '1', testCaseName: 'Test 1', status: 'pass', expectedOutput: 'expected1', actualOutput: 'output1' },
      { id: '2', testCaseName: 'Test 2', status: 'fail', expectedOutput: 'expected2', actualOutput: 'output2' },
    ];
    render(<TestResultsView results={results} />);
    
    const header1 = screen.getByTestId('test-result-header-1');
    const header2 = screen.getByTestId('test-result-header-2');
    
    // Expand first test
    act(() => {
      fireEvent.click(header1);
    });
    expect(screen.getByTestId('test-result-details-1')).toBeInTheDocument();
    expect(screen.queryByTestId('test-result-details-2')).not.toBeInTheDocument();
    
    // Expand second test - first should collapse
    act(() => {
      fireEvent.click(header2);
    });
    expect(screen.queryByTestId('test-result-details-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('test-result-details-2')).toBeInTheDocument();
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
    
    // Expand the test result
    const header = screen.getByTestId('test-result-header-1');
    act(() => {
      fireEvent.click(header);
    });
    
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
    
    // Expand the test result
    const header = screen.getByTestId('test-result-header-1');
    act(() => {
      fireEvent.click(header);
    });
    
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
    
    // Expand the test result
    const header = screen.getByTestId('test-result-header-1');
    act(() => {
      fireEvent.click(header);
    });
    
    expect(screen.getByText('$.data toBeNull')).toBeInTheDocument();
  });

  it('renders assertion chips for results with assertionResults when expanded', () => {
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
    
    // Expand the test result
    const header = screen.getByTestId('test-result-header-1');
    act(() => {
      fireEvent.click(header);
    });
    
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
    
    // First expand the test result
    const header = screen.getByTestId('test-result-header-1');
    act(() => {
      fireEvent.click(header);
    });
    
    // Then test assertion sample expansion
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
    
    // First expand the test result
    const header = screen.getByTestId('test-result-header-1');
    act(() => {
      fireEvent.click(header);
    });
    
    // Then expand assertion samples
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
    
    // First expand the test result
    const header = screen.getByTestId('test-result-header-1');
    act(() => {
      fireEvent.click(header);
    });
    
    // Then expand assertion samples
    const expandBtn = screen.getByTestId('test-results-assertion-expand-button-a1');
    act(() => {
      fireEvent.click(expandBtn);
    });
    expect(screen.getByTestId('test-results-assertion-sample-empty-a1')).toHaveTextContent('No samples');
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
    
    // First expand the test result
    const header = screen.getByTestId('test-result-header-1');
    act(() => {
      fireEvent.click(header);
    });
    
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
    
    // First expand the test result
    const header = screen.getByTestId('test-result-header-1');
    act(() => {
      fireEvent.click(header);
    });
    
    // Should show assertion results
    expect(screen.queryByText('Test Case Assertions:')).not.toBeInTheDocument();
    expect(screen.getByTestId('test-results-assertion-chip-a1')).toBeInTheDocument();
  });

  it('shows expected vs actual outputs in grid layout when expanded', () => {
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
    
    // Initially collapsed
    expect(screen.queryByText('Output Comparison:')).not.toBeInTheDocument();
    
    // Expand the test result
    const header = screen.getByTestId('test-result-header-1');
    act(() => {
      fireEvent.click(header);
    });
    
    // Should show diff output sections
    expect(screen.getByText('Output Comparison:')).toBeInTheDocument();
    
    // Check that the character diff is present
    const diffChars = screen.getAllByTestId(/^diff-char-/);
    expect(diffChars.length).toBeGreaterThan(0);
    
    // The diff should contain parts of both expected and actual text
    const container = screen.getByTestId('test-result-details-1');
    expect(container).toHaveTextContent('Simple');
    expect(container).toHaveTextContent('output');
  });
});
