import { diffChars } from 'diff';
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
  const diff = diffChars(expectedText, actualText);
  
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
      
      {/* Legend */}
      <div className="flex items-center gap-4 mb-3 text-xs" data-testid="diff-legend">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-100 rounded"></div>
          <span className="text-gray-600">Removed text</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-100 rounded"></div>
          <span className="text-gray-600">Added text</span>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded p-3 font-mono text-xs max-h-96 overflow-y-auto">
        <div className="whitespace-pre-wrap">
          {diff.map((part, index) => {
            let className = '';
            
            if (part.added) {
              className = 'bg-green-100 text-green-800';
            } else if (part.removed) {
              className = 'bg-red-100 text-red-800 line-through';
            } else {
              className = 'text-gray-700';
            }
            
            return (
              <span
                key={index}
                className={className}
                data-testid={`diff-char-${index}`}
              >
                {part.value}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};