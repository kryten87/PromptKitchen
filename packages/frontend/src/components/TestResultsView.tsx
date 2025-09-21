import type { AssertionResult, Assertion } from '@prompt-kitchen/shared/src/types';
import React from 'react';

export interface TestResult {
  id: string;
  testCaseName: string;
  status: 'pass' | 'fail';
  actualOutput: string;
  expectedOutput: string;
  assertionResults?: AssertionResult[];
  testCaseAssertions?: Assertion[];
}

export interface TestResultsViewProps {
  results: TestResult[];
}

export const TestResultsView: React.FC<TestResultsViewProps> = ({ results }) => {
  // State to track which single test result is expanded (null means none expanded)
  const [expandedResultId, setExpandedResultId] = React.useState<string | null>(null);
  
  // State for assertion chip expansions (maintains existing behavior for assertion details)
  const [expandedAssertions, setExpandedAssertions] = React.useState<Record<string, boolean>>({});

  const handleResultClick = (resultId: string) => {
    // If clicking on already expanded result, collapse it
    if (expandedResultId === resultId) {
      setExpandedResultId(null);
    } else {
      // Expand this result and collapse any other
      setExpandedResultId(resultId);
    }
  };

  const handleAssertionToggle = (assertionId: string) => {
    setExpandedAssertions((prev) => ({ ...prev, [assertionId]: !prev[assertionId] }));
  };

  const formatAssertion = (assertion: Assertion) => {
    const pathStr = assertion.path;
    const matcherStr = assertion.not ? `not ${assertion.matcher}` : assertion.matcher;
    const expectedStr = assertion.expected !== undefined ? 
      (typeof assertion.expected === 'string' ? `"${assertion.expected}"` : JSON.stringify(assertion.expected)) : '';
    const pathMatchStr = assertion.pathMatch && assertion.pathMatch !== 'ANY' ? ` (${assertion.pathMatch} match)` : '';
    
    return `${pathStr} ${matcherStr}${expectedStr ? ` ${expectedStr}` : ''}${pathMatchStr}`;
  };

  if (!results || results.length === 0) {
    return <div className="p-4 text-gray-500">No test results to display.</div>;
  }

  return (
    <div className="space-y-2">
      {results.map((result) => (
        <div key={result.id} className="border border-gray-200 rounded-lg">
          {/* Clickable header row showing test name and status */}
          <button
            type="button"
            onClick={() => handleResultClick(result.id)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg"
            data-testid={`test-result-header-${result.id}`}
          >
            <div className="flex items-center space-x-3">
              <span className="font-medium text-left">{result.testCaseName}</span>
              <span
                className={
                  `px-2 py-1 rounded text-xs font-semibold ` +
                  (result.status === 'pass' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800')
                }
                data-testid={`status-${result.id}`}
              >
                {result.status === 'pass' ? 'Pass' : 'Fail'}
              </span>
            </div>
            <div className="text-gray-500">
              {expandedResultId === result.id ? '−' : '+'}
            </div>
          </button>

          {/* Expanded content showing expected vs actual values */}
          {expandedResultId === result.id && (
            <div className="border-t border-gray-200 p-4 bg-gray-50" data-testid={`test-result-details-${result.id}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Expected Output */}
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Expected Output:</div>
                  <div className="bg-white border border-gray-200 rounded p-3 font-mono text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {result.expectedOutput}
                  </div>
                </div>

                {/* Actual Output */}
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Actual Output:</div>
                  <div className="bg-white border border-gray-200 rounded p-3 font-mono text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {result.actualOutput}
                  </div>
                </div>
              </div>

              {/* Additional details for complex assertions */}
              {Array.isArray(result.testCaseAssertions) && result.testCaseAssertions.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Test Case Assertions:</div>
                  <div className="space-y-1">
                    {result.testCaseAssertions.map((assertion, index) => (
                      <div key={assertion.assertionId || index} className="font-mono text-xs text-gray-600 bg-white px-2 py-1 rounded border">
                        {formatAssertion(assertion)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legacy assertion results support */}
              {Array.isArray(result.assertionResults) && result.assertionResults.length > 0 && !result.testCaseAssertions && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Assertion Details:</div>
                  <div className="space-y-2">
                    {result.assertionResults.map((ar) => {
                      const isExpanded = expandedAssertions[ar.assertionId] || false;
                      let samples = ar.actualSamples || [];
                      let truncated = false;
                      let hash = '';
                      if (
                        samples.length > 0 &&
                        typeof samples[samples.length - 1] === 'object' &&
                        samples[samples.length - 1] !== null &&
                        'truncated' in (samples[samples.length - 1] as Record<string, unknown>)
                      ) {
                        truncated = true;
                        const lastSample = samples[samples.length - 1] as { truncated?: boolean; hash?: string };
                        hash = lastSample.hash || '';
                        samples = samples.slice(0, -1);
                      }
                      return (
                        <div key={ar.assertionId} className="bg-white border border-gray-200 rounded p-2">
                          <div className="flex items-center justify-between">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${ar.passed ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}
                              data-testid={`test-results-assertion-chip-${ar.assertionId}`}
                            >
                              {ar.passed ? 'Pass' : 'Fail'}
                              {` | ${ar.path}`}
                              {` | ${ar.matcher}`}
                              {` | ${ar.pathMatch}`}
                            </span>
                            <button
                              type="button"
                              className="ml-2 text-xs underline text-blue-600 focus:outline-none"
                              onClick={() => handleAssertionToggle(ar.assertionId)}
                              data-testid={`test-results-assertion-expand-button-${ar.assertionId}`}
                            >
                              {isExpanded ? 'Hide Samples' : 'Show Samples'}
                            </button>
                          </div>
                          {isExpanded && (
                            <div className="mt-2 border-l-2 border-gray-200 pl-2" data-testid={`test-results-assertion-samples-area-${ar.assertionId}`}>
                              {samples.length > 0 && (
                                <ul className="list-disc ml-4">
                                  {samples.map((sample, idx) => (
                                    <li
                                      key={idx}
                                      className="font-mono text-xs text-gray-700"
                                      data-testid={`test-results-assertion-sample-row-${ar.assertionId}-${idx}`}
                                    >
                                      {typeof sample === 'string' ? sample : JSON.stringify(sample)}
                                    </li>
                                  ))}
                                </ul>
                              )}
                              {samples.length === 0 && (
                                <div className="text-xs text-gray-400" data-testid={`test-results-assertion-sample-empty-${ar.assertionId}`}>No samples</div>
                              )}
                              {truncated && (
                                <div className="text-xs text-orange-600 mt-2" data-testid={`test-results-assertion-sample-truncated-${ar.assertionId}`}>
                                  ...truncated
                                  {hash && (
                                    <span className="ml-2 text-gray-500" data-testid={`test-results-assertion-sample-hash-${ar.assertionId}`}>SHA-256: {hash}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
