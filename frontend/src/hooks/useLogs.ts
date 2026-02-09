import { useState, useCallback, useRef } from 'react';
import { logsApi } from '../api/client';
import type { LogFile, LogContent } from '../types';

export function useLogs() {
  const [files, setFiles] = useState<LogFile[]>([]);
  const [content, setContent] = useState<LogContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track current fetch to prevent duplicate calls
  const currentFetchRef = useRef<string | null>(null);

  const fetchFiles = useCallback(async (taskName: string, testMode = false) => {
    const fetchKey = `${taskName}-${testMode}`;

    // Prevent duplicate fetches for the same task/mode
    if (currentFetchRef.current === fetchKey) {
      return;
    }
    currentFetchRef.current = fetchKey;

    try {
      setLoading(true);
      setError(null);
      const data = await logsApi.listFiles(taskName, testMode);
      setFiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch log files');
      setFiles([]);
    } finally {
      setLoading(false);
      // Reset after a short delay to allow re-fetch if needed
      setTimeout(() => {
        if (currentFetchRef.current === fetchKey) {
          currentFetchRef.current = null;
        }
      }, 100);
    }
  }, []);

  const fetchContent = useCallback(
    async (taskName: string, filename: string, testMode = false) => {
      try {
        setLoading(true);
        setError(null);
        const data = await logsApi.readFile(taskName, filename, testMode);
        setContent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to read log file');
        setContent(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearContent = useCallback(() => setContent(null), []);

  return {
    files,
    content,
    loading,
    error,
    fetchFiles,
    fetchContent,
    clearContent,
  };
}
