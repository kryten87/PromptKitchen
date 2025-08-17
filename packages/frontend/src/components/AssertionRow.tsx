import { Assertion } from './AssertionsSection';
import { ExpectedPanel } from './ExpectedPanel';

interface AssertionRowProps {
  assertion: Assertion;
  onChange: (assertion: Assertion) => void;
  onRemove: (id: string) => void;
}

export function AssertionRow({ assertion, onChange, onRemove }: AssertionRowProps) {
  return (
    <div className="p-2 border rounded-md bg-gray-50">
      <div className="grid grid-cols-6 gap-2 items-center">
        <input
          type="text"
          value={assertion.path}
          placeholder="Path (e.g. $.items[*].id)"
          onChange={(e) => onChange({ ...assertion, path: e.target.value })}
          className="col-span-2 border border-gray-300 rounded px-2 py-1 text-sm"
        />

        <select
          value={assertion.pathMatch ?? 'ANY'}
          onChange={(e) => onChange({ ...assertion, pathMatch: e.target.value as 'ANY' | 'ALL' })}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value="Any match">Any match</option>
          <option value="All match">All match</option>
        </select>
        <div className="flex-1 col-span-2">
          <ExpectedPanel
            matcher={assertion.matcher}
            expected={assertion.expected}
            onChange={(expected) => onChange({ ...assertion, expected })}
          />
        </div>
        <button
          type="button"
          onClick={() => onRemove(assertion.id)}
          className="text-sm text-red-500 hover:underline"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default AssertionRow;
