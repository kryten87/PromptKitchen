import { diffLines } from 'diff';
import React from 'react';

export interface DiffDisplayProps {
  expectedText: string;
  actualText: string;
  label?: string;
}

export const DiffDisplay: React.FC<DiffDisplayProps> = ({ 
  expectedText, 
  actualText, 
  label 
}) => {
  const diff = diffLines(expectedText, actualText);
  
  // If there are no differences, show a simple "identical" message
  if (diff.every(part => !part.added && !part.removed)) {
    return (
      <div>
        {label && <div className="text-sm font-medium text-gray-700 mb-2">{label}:</div>}
        <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
          ✓ Expected and actual outputs are identical
        </div>
      </div>
    );
  }

  return (
    <div>
      {label && <div className="text-sm font-medium text-gray-700 mb-2">{label}:</div>}
      <div className="bg-white border border-gray-200 rounded p-3 font-mono text-xs max-h-96 overflow-y-auto">
        {diff.map((part, index) => {
          const lineClasses = [];
          
          if (part.added) {
            lineClasses.push('bg-green-100', 'text-green-800', 'border-l-4', 'border-green-400', 'pl-2');
          } else if (part.removed) {
            lineClasses.push('bg-red-100', 'text-red-800', 'border-l-4', 'border-red-400', 'pl-2');
          } else {
            lineClasses.push('text-gray-700');
          }
          
          const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
          
          return (
            <div
              key={index}
              className={lineClasses.join(' ')}
              data-testid={`diff-line-${index}`}
            >
              <span className="select-none text-gray-400 mr-1">{prefix}</span>
              <span className="whitespace-pre-wrap">{part.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};