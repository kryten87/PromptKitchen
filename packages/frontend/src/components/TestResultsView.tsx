import type { AssertionResult } from '@prompt-kitchen/shared/src/types';
import React from 'react';

export interface TestResult {
  id: string;
  testCaseName: string;
  status: 'pass' | 'fail';
  actualOutput: string;
  expectedOutput: string;
  assertionResults?: AssertionResult[];
}

export interface TestResultsViewProps {
  results: TestResult[];
}

export const TestResultsView: React.FC<TestResultsViewProps> = ({ results }) => {
  // Expand/collapse state for each assertion chip
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  const handleToggle = (assertionId: string) => {
    setExpanded((prev) => ({ ...prev, [assertionId]: !prev[assertionId] }));
  };

  if (!results || results.length === 0) {
    return <div className="p-4 text-gray-500">No test results to display.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Case Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Output</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Output</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assertions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {results.map((result) => (
            <tr key={result.id}>
              <td className="px-4 py-2 whitespace-nowrap">{result.testCaseName}</td>
              <td
                className={
                  `px-4 py-2 whitespace-nowrap font-semibold ` +
                  (result.status === 'pass' ? 'text-green-600' : 'text-red-600')
                }
                data-testid={`status-${result.id}`}
              >
                {result.status === 'pass' ? 'Pass' : 'Fail'}
              </td>
              <td className="px-4 py-2 whitespace-pre-wrap font-mono text-sm">{result.expectedOutput}</td>
              <td className="px-4 py-2 whitespace-pre-wrap font-mono text-sm">{result.actualOutput}</td>
              <td className="px-4 py-2">
                {Array.isArray(result.assertionResults) && result.assertionResults.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {result.assertionResults.map((ar) => {
                      const isExpanded = expanded[ar.assertionId] || false;
                      // Truncation marker and hash logic (assume if actualSamples contains a special object)
                      // Convention: If last sample is { truncated: true, hash: string }, treat as truncation marker
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
                        <div key={ar.assertionId} className="mb-2">
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
                            onClick={() => handleToggle(ar.assertionId)}
                            data-testid={`test-results-assertion-expand-button-${ar.assertionId}`}
                          >
                            {isExpanded ? 'Hide Samples' : 'Show Samples'}
                          </button>
                          {isExpanded && (
                            <div className="mt-2 ml-4 border-l-2 border-gray-200 pl-2" data-testid={`test-results-assertion-samples-area-${ar.assertionId}`}>
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
                ) : (
                  <span className="text-gray-400 text-xs" data-testid={`test-results-assertion-none-${result.id}`}>No assertions</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
