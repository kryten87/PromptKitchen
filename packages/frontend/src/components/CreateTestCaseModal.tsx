import type { TestCase } from '@prompt-kitchen/shared/src/dtos';
import { TestCaseEditor } from './TestCaseEditor';

interface CreateTestCaseModalProps {
  open: boolean;
  testSuiteId: string;
  testCase?: TestCase | null;
  onTestCaseCreated?: (testCase: TestCase) => void;
  onTestCaseUpdated?: (testCase: TestCase) => void;
  onCancel: () => void;
}

export function CreateTestCaseModal({
  open,
  testSuiteId,
  testCase,
  onTestCaseCreated,
  onTestCaseUpdated,
  onCancel
}: CreateTestCaseModalProps) {
  if (!open) return null;

  const isEditing = !!testCase;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" data-testid={isEditing ? "edit-test-case-modal" : "create-test-case-modal"}>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <TestCaseEditor
          testSuiteId={testSuiteId}
          testCase={testCase}
          onTestCaseCreated={onTestCaseCreated}
          onTestCaseUpdated={onTestCaseUpdated}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
}