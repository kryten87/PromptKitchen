import { registry } from '@prompt-kitchen/shared/src/evaluation/matcher';
import { MatcherName } from '@prompt-kitchen/shared/src/types';
import { Assertion } from './AssertionsSection';

interface AssertionRowProps {
  assertion: Assertion;
  onChange: (assertion: Assertion) => void;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

export function AssertionRow({ assertion, onChange, onRemove, onSelect, isSelected }: AssertionRowProps) {
  const handlePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...assertion, path: e.target.value });
  };

  const handleMatcherChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...assertion, matcher: e.target.value as MatcherName, expected: undefined });
  };

  const handleNotToggle = () => {
    onChange({ ...assertion, not: !assertion.not });
  };

  const handlePathMatchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...assertion, pathMatch: e.target.value as 'ANY' | 'ALL' });
  };

  return (
    <li
      className={`p-2 border rounded-md cursor-pointer ${isSelected ? 'bg-blue-100 border-blue-500' : 'bg-gray-50'}`}
      onClick={() => onSelect(assertion.id)}
      role="listitem"
    >
      <div className="grid grid-cols-12 gap-2 items-center">
        <div className="col-span-4">
          <input
            type="text"
            value={assertion.path}
            onChange={handlePathChange}
            placeholder="Path (e.g. $.items[*].id)"
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </div>
        <div className="col-span-2">
          <select
            value={assertion.pathMatch ?? 'ANY'}
            onChange={handlePathMatchChange}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="ANY">Any match</option>
            <option value="ALL">All match</option>
          </select>
        </div>
        <div className="col-span-3">
          <select
            value={assertion.matcher}
            onChange={handleMatcherChange}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          >
            {Object.keys(registry).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2 flex items-center">
          <input
            type="checkbox"
            checked={assertion.not}
            onChange={handleNotToggle}
            className="form-checkbox"
            id={`not-${assertion.id}`}
          />
          <label htmlFor={`not-${assertion.id}`} className="ml-2 text-sm">
            Not
          </label>
        </div>
        <div className="col-span-1 text-right">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(assertion.id);
            }}
            className="text-sm text-red-500 hover:underline"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
