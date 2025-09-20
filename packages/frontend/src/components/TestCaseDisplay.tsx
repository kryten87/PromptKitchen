import type { TestCase } from '@prompt-kitchen/shared/src/dtos';
import type { Assertion } from '@prompt-kitchen/shared/src/types';

interface TestCaseDisplayProps {
  testCase: TestCase;
}

export function TestCaseDisplay({ testCase }: TestCaseDisplayProps) {
  const formatAssertion = (assertion: Assertion) => {
    const pathStr = assertion.path;
    const matcherStr = assertion.not ? `not ${assertion.matcher}` : assertion.matcher;
    const expectedStr = assertion.expected !== undefined ? 
      (typeof assertion.expected === 'string' ? `"${assertion.expected}"` : JSON.stringify(assertion.expected)) : '';
    const pathMatchStr = assertion.pathMatch && assertion.pathMatch !== 'ANY' ? ` (${assertion.pathMatch} match)` : '';
    
    return `${pathStr} ${matcherStr}${expectedStr ? ` ${expectedStr}` : ''}${pathMatchStr}`;
  };

  const isAdvancedTestCase = testCase.assertions && testCase.assertions.length > 0;

  return (
    <div className="pr-20">
      <div className="text-sm font-medium break-words whitespace-pre-wrap">Test Case {testCase.id}</div>
      <div className="text-xs text-gray-500">Mode: <span className="font-mono">{testCase.runMode}</span></div>
      <div className="text-xs">
        <div className="mb-1"><strong>Inputs:</strong> {JSON.stringify(testCase.inputs)}</div>
        
        {isAdvancedTestCase ? (
          <div>
            <div className="mb-1"><strong>Assertions:</strong></div>
            <ul className="list-disc list-inside pl-2 space-y-1">
              {testCase.assertions!.map((assertion, index) => (
                <li key={assertion.assertionId || index} className="font-mono text-xs">
                  {formatAssertion(assertion)}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div><strong>Expected:</strong> {typeof testCase.expectedOutput === 'string' ? testCase.expectedOutput : JSON.stringify(testCase.expectedOutput)}</div>
        )}
      </div>
    </div>
  );
}