import React from 'react';

export interface TestResult {
  id: string;
  testCaseName: string;
  status: 'pass' | 'fail';
  actualOutput: string;
  expectedOutput: string;
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
