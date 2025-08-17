import { registry } from '@prompt-kitchen/shared/src/evaluation/matcher';
import { useEffect, useState } from 'react';

interface ExpectedPanelProps {
  matcher: string;
  expected: unknown;
  onChange: (expected: unknown) => void;
}

export function ExpectedPanel({ matcher, expected, onChange }: ExpectedPanelProps) {
  const [textValue, setTextValue] = useState<string>('');
  const [jsonValue, setJsonValue] = useState<string>('');
  const [flags, setFlags] = useState({ i: false, m: false, s: false, u: false });
  const [validationError, setValidationError] = useState<string | null>(null);

  const matcherDef = registry[matcher];
  const arity = matcherDef ? matcherDef.arity : 'one';

  useEffect(() => {
    if (expected === null || expected === undefined) {
      setTextValue('');
      setJsonValue('');
      return;
    }

    if (typeof expected === 'object') {
      setJsonValue(JSON.stringify(expected, null, 2));
      return;
    }

    const valueAsString = String(expected);
    setTextValue(valueAsString);

    try {
      const parsed = JSON.parse(valueAsString);
      if (typeof parsed === 'object' && parsed !== null) {
        setJsonValue(JSON.stringify(parsed, null, 2));
      } else {
        setJsonValue(valueAsString);
      }
    } catch {
      setJsonValue(valueAsString);
    }
  }, [expected]);

  const handleFlagChange = (flag: keyof typeof flags) => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  };

  const handleTextChange = (value: string) => {
    setTextValue(value);
    try {
      if (matcher === 'toMatch') {
        new RegExp(value, Object.keys(flags).filter((f) => flags[f as keyof typeof flags]).join(''));
      } else if (matcher === 'toEqual' || matcher === 'toContain') {
        JSON.parse(value);
      }
      setValidationError(null);
    } catch {
      setValidationError('Invalid input');
    }
    onChange(value);
  };

  const handleJsonChange = (value: string) => {
    setJsonValue(value);
    try {
      const parsed = JSON.parse(value);
      setValidationError(null);
      onChange(parsed);
    } catch {
      setValidationError('Invalid JSON');
    }
  };

  if (arity === 'none') {
    return <div className="p-4 border rounded text-sm text-gray-500">This matcher does not require an expected value.</div>;
  }

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
        {validationError && <p className="text-red-500 text-sm">{validationError}</p>}
      </div>
    );
  }

  if (matcher === 'toEqual' || matcher === 'toContain' || matcher === 'toBeOneOf') {
    return (
      <div className="p-4 border rounded">
        <textarea
          value={jsonValue}
          onChange={(e) => handleJsonChange(e.target.value)}
          placeholder={matcher === 'toBeOneOf' ? 'Enter JSON array of options' : 'Enter JSON or text'}
          className="w-full border rounded px-2 py-1"
        />
        {validationError && <p className="text-red-500 text-sm">{validationError}</p>}
      </div>
    );
  }

  return null;
}
