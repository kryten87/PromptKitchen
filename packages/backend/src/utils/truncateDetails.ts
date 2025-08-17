import type { AssertionResult } from '@prompt-kitchen/shared';
import { createHash } from 'crypto';

export interface TruncateResult {
  truncated: boolean;
  details: AssertionResult[];
  hash?: string;
}

export function truncateDetails(
  details: AssertionResult[],
  maxBytes: number
): TruncateResult {
  const serialized = JSON.stringify(details);
  if (Buffer.byteLength(serialized, 'utf8') <= maxBytes) {
    return { truncated: false, details };
  }
  // Truncate actualSamples in each AssertionResult
  const truncatedDetails = details.map((result) => {
    if (!result.actualSamples || result.actualSamples.length === 0) {
      return result;
    }
    // Replace actualSamples with marker and hash
    const fullContent = JSON.stringify(result.actualSamples);
    const hash = createHash('sha256').update(fullContent).digest('hex');
    return {
      ...result,
      actualSamples: ['...truncated'],
      hash,
    };
  });
  // Re-serialize and check size again
  let finalSerialized = JSON.stringify(truncatedDetails);
  if (Buffer.byteLength(finalSerialized, 'utf8') > maxBytes) {
    // If still too large, remove actualSamples entirely
    const minimalDetails = truncatedDetails.map((result) => {
      return {
        ...result,
        actualSamples: [],
      };
    });
    finalSerialized = JSON.stringify(minimalDetails);
    return {
      truncated: true,
      details: minimalDetails,
      hash: createHash('sha256').update(serialized).digest('hex'),
    };
  }
  return {
    truncated: true,
    details: truncatedDetails,
    hash: createHash('sha256').update(serialized).digest('hex'),
  };
}
