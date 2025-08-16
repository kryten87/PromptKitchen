import type { Assertion } from './AssertionsSection';

interface AssertionRowProps {
  assertion: Assertion;
  onChange: (a: Assertion) => void;
  onRemove: (id: string) => void;
}

export function AssertionRow({ assertion, onChange, onRemove }: AssertionRowProps) {
  return (
    <div className="flex gap-2 items-center p-2 border border-gray-100 rounded">
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
        onChange={(e) => onChange({ ...assertion, matcher: e.target.value })}
        className="border border-gray-300 rounded px-2 py-1 text-sm"
      >
        <option value="toEqual">toEqual</option>
        <option value="toBeNull">toBeNull</option>
        <option value="toContain">toContain</option>
        <option value="toMatch">toMatch</option>
        <option value="toBeOneOf">toBeOneOf</option>
      </select>

      <label className="inline-flex items-center text-sm">
        <input
          type="checkbox"
          checked={!!assertion.not}
          onChange={(e) => onChange({ ...assertion, not: e.target.checked })}
          className="form-checkbox"
        />
        <span className="ml-1">NOT</span>
      </label>

      <button
        type="button"
        onClick={() => onRemove(assertion.id)}
        className="text-warning px-2"
      >
        ✕
      </button>
    </div>
  );
}

export default AssertionRow;
