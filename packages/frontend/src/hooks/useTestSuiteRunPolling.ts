// Polls the backend for test suite run status/results
import { useEffect, useRef, useState } from 'react';
import { useApiClient } from './useApiClient';

interface TestResult {
  id: string;
  testSuiteRunId: string;
  testCaseId: string;
  status: 'PASS' | 'FAIL';
  output: string;
  createdAt: string | Date;
}

interface TestSuiteRun {
  id: string;
  testSuiteId: string;
  createdAt: string | Date;
  status: string;
  passPercentage: number;
  promptHistoryId: string;
  results: TestResult[];
}

export function useTestSuiteRunPolling(runId: string | null, pollInterval = 2000) {
  const apiClient = useApiClient();
  const [run, setRun] = useState<TestSuiteRun | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    // Reset state if runId is null
    if (!runId) {
      setRun(null);
      setLoading(false);
      setError(null);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      cancelledRef.current = true;
      return;
    }
    cancelledRef.current = false;
    setLoading(true);
    setError(null);
    setRun(undefined);

    async function fetchRun() {
      try {
        const data = await apiClient.request<TestSuiteRun>(`/test-suite-runs/${runId}`);
        if (!cancelledRef.current) {
          setRun(data);
          if (data && (data.status === 'COMPLETED' || data.status === 'FAILED')) {
            setLoading(false);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
          }
        }
      } catch (err) {
        if (!cancelledRef.current) {
          setRun(null);
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      }
    }

    fetchRun();
    intervalRef.current = setInterval(fetchRun, pollInterval);
    return () => {
      cancelledRef.current = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [runId, apiClient, pollInterval]);

  return { run, loading, error };
}
