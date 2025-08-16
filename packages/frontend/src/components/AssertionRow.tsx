import type { MatcherName } from '@prompt-kitchen/shared/src/types';
import { useState } from 'react';
import type { Assertion } from './AssertionsSection';
import { ExpectedPanel } from './ExpectedPanel';

interface AssertionRowProps {
  assertion: Assertion;
  onChange: (a: Assertion) => void;
  onRemove: (id: string) => void;
}

export function AssertionRow({ assertion, onChange, onRemove }: AssertionRowProps) {
  const [showPanel, setShowPanel] = useState(false);

  return (
    <div className="flex flex-col gap-2 p-2 border border-gray-100 rounded">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={assertion.path}
          placeholder="Path (e.g. $.items[*].id)"
          onChange={(e) => onChange({ ...assertion, path: e.target.value })}
          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
        />

        <select
          value={assertion.pathMatch ?? 'ANY'}
          onChange={(e) => onChange({ ...assertion, pathMatch: e.target.value as 'ANY' | 'ALL' })}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value="ANY">ANY</option>
          <option value="ALL">ALL</option>
        </select>

        <select
          value={assertion.matcher}
          onChange={(e) => onChange({ ...assertion, matcher: e.target.value as MatcherName })}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value="toEqual">toEqual</option>
          <option value="toBeNull">toBeNull</option>
          <option value="toContain">toContain</option>
          <option value="toMatch">toMatch</option>
          <option value="toBeOneOf">toBeOneOf</option>
        </select>

        <button
          type="button"
          onClick={() => setShowPanel(!showPanel)}
          className="text-sm text-blue-500 hover:underline"
        >
          {showPanel ? 'Hide' : 'Edit'} Expected
        </button>

        <button
          type="button"
          onClick={() => onRemove(assertion.id)}
          className="text-sm text-red-500 hover:underline"
        >
          Remove
        </button>
      </div>

      {showPanel && (
        <ExpectedPanel
          matcher={assertion.matcher}
          expected={assertion.expected}
          onChange={(expected) => onChange({ ...assertion, expected })}
        />
      )}
    </div>
  );
}

export default AssertionRow;
