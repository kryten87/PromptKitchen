import { useCallback, useState } from 'react';
import { AssertionRow } from './AssertionRow';
import { ExpectedPanel } from './ExpectedPanel';

export interface Assertion {
  id: string;
  path: string;
  matcher: string;
  not?: boolean;
  pathMatch?: 'ANY' | 'ALL';
  expected?: unknown;
}

interface AssertionsSectionProps {
  assertions?: Assertion[];
  onChange?: (items: Assertion[]) => void;
}

export function AssertionsSection({ assertions = [], onChange }: AssertionsSectionProps) {
  const [items, setItems] = useState<Assertion[]>(assertions);
  const [selectedAssertion, setSelectedAssertion] = useState<Assertion | null>(null);

  const handleChange = useCallback(
    (a: Assertion) => {
      const next = items.map((it) => (it.id === a.id ? a : it));
      setItems(next);
      onChange?.(next);
    },
    [items, onChange]
  );

  const handleRemove = useCallback(
    (id: string) => {
      const next = items.filter((it) => it.id !== id);
      setItems(next);
      onChange?.(next);
    },
    [items, onChange]
  );

  const genId = () => Math.random().toString(36).slice(2, 9);

  const handleAdd = () => {
    const newAssertion = { id: genId(), path: '', matcher: 'toEqual' };
    setItems([...items, newAssertion]);
    onChange?.([...items, newAssertion]);
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">Assertions (Advanced)</label>
        <div className="text-sm text-gray-500">Define assertions to run against response output</div>
      </div>

      {items.length === 0 ? (
        <div className="text-gray-500 text-sm py-2">No assertions defined</div>
      ) : (
        <div className="space-y-2">
          {items.map((a) => (
            <AssertionRow key={a.id} assertion={a} onChange={handleChange} onRemove={handleRemove} />
          ))}
        </div>
      )}

      <div className="mt-2">
        <button type="button" onClick={handleAdd} className="text-sm text-blue-600">
          + Add assertion
        </button>
      </div>

      {selectedAssertion && (
        <ExpectedPanel
          matcher={selectedAssertion.matcher}
          expected={selectedAssertion.expected}
          onChange={(expected) => {
            const updated = { ...selectedAssertion, expected };
            handleChange(updated);
            setSelectedAssertion(updated);
          }}
        />
      )}
    </div>
  );
}

export default AssertionsSection;
