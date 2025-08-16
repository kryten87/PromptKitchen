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
}

export function AssertionsSection({ assertions = [] }: AssertionsSectionProps) {
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">Assertions (Advanced)</label>
        <div className="text-sm text-gray-500">Add assertions in a later iteration</div>
      </div>

      {assertions.length === 0 ? (
        <div className="text-gray-500 text-sm py-2">No assertions defined</div>
      ) : (
        <div className="space-y-2">
          {assertions.map((a) => (
            <div key={a.id} className="flex items-center justify-between border border-gray-100 rounded p-2">
              <div className="text-sm">
                <div className="font-medium">{a.path}</div>
                <div className="text-xs text-gray-500">{a.matcher}{a.not ? ' (not)' : ''} • {a.pathMatch ?? 'ANY'}</div>
              </div>
              <div className="text-xs text-gray-500">Expected: {String(a.expected ?? '')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AssertionsSection;
