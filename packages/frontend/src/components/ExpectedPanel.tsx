import { useState } from 'react';

interface ExpectedPanelProps {
  matcher: string;
  expected: unknown;
  onChange: (expected: unknown) => void;
}

export function ExpectedPanel({ matcher, expected, onChange }: ExpectedPanelProps) {
  const [textValue, setTextValue] = useState<string>(
    typeof expected === 'string' ? expected : ''
  );
  const [jsonValue, setJsonValue] = useState<string>(
    typeof expected === 'object' ? JSON.stringify(expected, null, 2) : ''
  );
  const [flags, setFlags] = useState({ i: false, m: false, s: false, u: false });

  const handleFlagChange = (flag: keyof typeof flags) => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  };

  const handleTextChange = (value: string) => {
    setTextValue(value);
    onChange(value);
  };

  const handleJsonChange = (value: string) => {
    setJsonValue(value);
    try {
      onChange(JSON.parse(value));
    } catch {
      // Handle invalid JSON
    }
  };

  if (matcher === 'toMatch') {
    return (
      <div className="p-4 border rounded">
        <input
          type="text"
          value={textValue}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Enter pattern"
          className="w-full border rounded px-2 py-1"
        />
        <div className="flex gap-2 mt-2">
          {Object.keys(flags).map((flag) => (
            <label key={flag} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={flags[flag as keyof typeof flags]}
                onChange={() => handleFlagChange(flag as keyof typeof flags)}
              />
              {flag}
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (matcher === 'toBeOneOf') {
    return (
      <div className="p-4 border rounded">
        <textarea
          value={jsonValue}
          onChange={(e) => handleJsonChange(e.target.value)}
          placeholder="Enter JSON array"
          className="w-full border rounded px-2 py-1"
        />
      </div>
    );
  }

  if (matcher === 'toEqual' || matcher === 'toContain') {
    return (
      <div className="p-4 border rounded">
        <textarea
          value={jsonValue}
          onChange={(e) => handleJsonChange(e.target.value)}
          placeholder="Enter JSON or text"
          className="w-full border rounded px-2 py-1"
        />
      </div>
    );
  }

  return null;
}
