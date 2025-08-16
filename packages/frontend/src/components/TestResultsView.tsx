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
                  <div className="flex flex-wrap gap-2">
                    {result.assertionResults.map((ar) => (
                      <span
                        key={ar.assertionId}
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${ar.passed ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}
                        data-testid={`test-results-assertion-chip-${ar.assertionId}`}
                      >
                        {ar.passed ? 'Pass' : 'Fail'}
                        {` | ${ar.path}`}
                        {` | ${ar.matcher}`}
                        {` | ${ar.pathMatch}`}
                      </span>
                    ))}
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
