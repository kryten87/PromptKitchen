import { render, screen } from '@testing-library/react';
import type { TestCase } from '@prompt-kitchen/shared/src/dtos';
import { TestCaseDisplay } from './TestCaseDisplay';

describe('TestCaseDisplay', () => {
  const defaultTestCase: TestCase = {
    id: 'test-123',
    testSuiteId: 'suite-456',
    inputs: { name: 'John', age: 30 },
    expectedOutput: 'Hello John',
    runMode: 'DEFAULT' as const,
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z'),
  };

  it('renders basic test case information', () => {
    render(<TestCaseDisplay testCase={defaultTestCase} />);
    
    expect(screen.getByText('Test Case test-123')).toBeInTheDocument();
    expect(screen.getByText('Mode:')).toBeInTheDocument();
    expect(screen.getByText('DEFAULT')).toBeInTheDocument();
    expect(screen.getByText('Inputs:')).toBeInTheDocument();
    expect(screen.getByText('Expected:')).toBeInTheDocument();
  });

  it('displays simple expected output for default test cases', () => {
    render(<TestCaseDisplay testCase={defaultTestCase} />);
    
    expect(screen.getByText('Hello John')).toBeInTheDocument();
    expect(screen.queryByText('Assertions:')).not.toBeInTheDocument();
  });

  it('displays complex expected output for default test cases', () => {
    const testCaseWithComplexOutput: TestCase = {
      ...defaultTestCase,
      expectedOutput: { message: 'Hello', user: 'John' },
    };

    render(<TestCaseDisplay testCase={testCaseWithComplexOutput} />);
    
    expect(screen.getByText('{"message":"Hello","user":"John"}')).toBeInTheDocument();
  });

  it('displays assertions for advanced test cases', () => {
    const advancedTestCase: TestCase = {
      ...defaultTestCase,
      assertions: [
        {
          assertionId: 'assertion-1',
          path: '$.value',
          matcher: 'toEqual' as const,
          expected: 'hello, world',
          pathMatch: 'ANY' as const,
        },
      ],
    };

    render(<TestCaseDisplay testCase={advancedTestCase} />);
    
    expect(screen.getByText('Assertions:')).toBeInTheDocument();
    expect(screen.getByText('$.value toEqual "hello, world"')).toBeInTheDocument();
    expect(screen.queryByText('Expected:')).not.toBeInTheDocument();
  });

  it('displays multiple assertions for advanced test cases', () => {
    const advancedTestCase: TestCase = {
      ...defaultTestCase,
      assertions: [
        {
          assertionId: 'assertion-1',
          path: '$.name',
          matcher: 'toEqual' as const,
          expected: 'John',
          pathMatch: 'ANY' as const,
        },
        {
          assertionId: 'assertion-2',
          path: '$.age',
          matcher: 'toEqual' as const,
          expected: 30,
          pathMatch: 'ALL' as const,
        },
      ],
    };

    render(<TestCaseDisplay testCase={advancedTestCase} />);
    
    expect(screen.getByText('Assertions:')).toBeInTheDocument();
    expect(screen.getByText('$.name toEqual "John"')).toBeInTheDocument();
    expect(screen.getByText('$.age toEqual 30 (ALL match)')).toBeInTheDocument();
  });

  it('displays negated assertions correctly', () => {
    const advancedTestCase: TestCase = {
      ...defaultTestCase,
      assertions: [
        {
          assertionId: 'assertion-1',
          path: '$.status',
          matcher: 'toEqual' as const,
          expected: 'inactive',
          not: true,
          pathMatch: 'ANY' as const,
        },
      ],
    };

    render(<TestCaseDisplay testCase={advancedTestCase} />);
    
    expect(screen.getByText('$.status not toEqual "inactive"')).toBeInTheDocument();
  });

  it('displays assertions with different matchers', () => {
    const advancedTestCase: TestCase = {
      ...defaultTestCase,
      assertions: [
        {
          assertionId: 'assertion-1',
          path: '$.message',
          matcher: 'toContain' as const,
          expected: 'hello',
          pathMatch: 'ANY' as const,
        },
        {
          assertionId: 'assertion-2',
          path: '$.data',
          matcher: 'toBeNull' as const,
          pathMatch: 'ANY' as const,
        },
      ],
    };

    render(<TestCaseDisplay testCase={advancedTestCase} />);
    
    expect(screen.getByText('$.message toContain "hello"')).toBeInTheDocument();
    expect(screen.getByText('$.data toBeNull')).toBeInTheDocument();
  });

  it('handles assertions without expected values', () => {
    const advancedTestCase: TestCase = {
      ...defaultTestCase,
      assertions: [
        {
          assertionId: 'assertion-1',
          path: '$.data',
          matcher: 'toBeNull' as const,
          pathMatch: 'ANY' as const,
        },
      ],
    };

    render(<TestCaseDisplay testCase={advancedTestCase} />);
    
    expect(screen.getByText('$.data toBeNull')).toBeInTheDocument();
  });
});