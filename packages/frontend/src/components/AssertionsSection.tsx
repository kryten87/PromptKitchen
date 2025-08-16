import { evaluateAssertions } from '@prompt-kitchen/shared/src/evaluation';
import { defaultMatcherContext } from '@prompt-kitchen/shared/src/evaluation/matcher';
import type { AssertionResult, Assertion as SharedAssertion } from '@prompt-kitchen/shared/src/types';
import { useCallback, useState } from 'react';
import { AssertionRow } from './AssertionRow';
import { ExpectedPanel } from './ExpectedPanel';

// Updated Assertion interface to extend SharedAssertion
export interface Assertion extends SharedAssertion {
  id: string; // Local ID for UI purposes
}

interface AssertionsSectionProps {
  assertions?: Assertion[];
  onChange?: (items: Assertion[]) => void;
}

export function AssertionsSection({ assertions = [], onChange }: AssertionsSectionProps) {
  const [items, setItems] = useState<Assertion[]>(assertions);
  const [selectedAssertion, setSelectedAssertion] = useState<Assertion | null>(null);
  const [previewResults, setPreviewResults] = useState<AssertionResult[]>([]);

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

  // Updated genId to include assertionId
  const genId = () => Math.random().toString(36).slice(2, 9);

  const handleAdd = () => {
    const newAssertion: Assertion = { id: genId(), assertionId: genId(), path: '', matcher: 'toEqual' };
    setItems([...items, newAssertion]);
    onChange?.([...items, newAssertion]);
  };

  const handleImport = () => {
    // Mock implementation for importing from last output
    const importedAssertions: Assertion[] = [
      { id: genId(), assertionId: genId(), path: '$.user.name', matcher: 'toMatch', expected: 'John' },
      { id: genId(), assertionId: genId(), path: '$.items[*].id', matcher: 'toBeOneOf', expected: [1, 2, 3] },
    ];
    setItems([...items, ...importedAssertions]);
    onChange?.([...items, ...importedAssertions]);
  };

  // Updated handlePreview to include matcherContext
  const handlePreview = () => {
    const sampleOutput = { user: { name: 'John' }, items: [{ id: 1 }, { id: 2 }] }; // Mock sample output
    const results = evaluateAssertions(sampleOutput, items, { matcherContext: defaultMatcherContext });

    // Render results in the UI
    setPreviewResults(results.results);
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

      <div className="mt-2 flex gap-2">
        <button type="button" onClick={handleAdd} className="text-sm text-blue-600">
          + Add assertion
        </button>
        <button type="button" onClick={handleImport} className="text-sm text-green-600">
          Import from last output
        </button>
        <button type="button" onClick={handlePreview} className="text-sm text-purple-600">
          Preview
        </button>
      </div>

      {previewResults.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700">Preview Results</h3>
          <ul className="list-disc pl-5">
            {previewResults.map((result, index) => (
              <li key={index} className={result.passed ? 'text-green-600' : 'text-red-600'}>
                {result.message}
              </li>
            ))}
          </ul>
        </div>
      )}

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
