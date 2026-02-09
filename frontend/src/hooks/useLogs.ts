import { useState, useCallback } from 'react';
import { logsApi } from '../api/client';
import type { LogFile, LogContent } from '../types';

export function useLogs() {
  const [files, setFiles] = useState<LogFile[]>([]);
  const [content, setContent] = useState<LogContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async (taskName: string, testMode = false) => {
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
