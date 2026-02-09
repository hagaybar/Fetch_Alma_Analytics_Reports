import { useState, useEffect, useCallback, useRef } from 'react';
import { reportsApi } from '../api/client';
import type { Job } from '../types';

export function useJobs(autoRefresh = true, refreshInterval = 2000) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setError(null);
      const data = await reportsApi.listJobs();
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();

    if (autoRefresh) {
      intervalRef.current = window.setInterval(() => {
        const hasActiveJobs = jobs.some(
          (j) => j.status === 'pending' || j.status === 'running'
        );
        if (hasActiveJobs) {
          fetchJobs();
        }
      }, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchJobs, autoRefresh, refreshInterval, jobs]);

  const runReport = async (taskName: string, testMode: boolean) => {
    const job = await reportsApi.run(taskName, testMode);
    setJobs((prev) => [job, ...prev]);
    return job;
  };

  const cancelJob = async (jobId: string) => {
    await reportsApi.cancelJob(jobId);
    fetchJobs();
  };

  return {
    jobs,
    loading,
    error,
    fetchJobs,
    runReport,
    cancelJob,
  };
}

export function useJobPolling(jobId: string | null, interval = 2000) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      return;
    }

    let mounted = true;
    let timeoutId: number;

    const poll = async () => {
      try {
        setLoading(true);
        const data = await reportsApi.getJob(jobId);
        if (mounted) {
          setJob(data);
          if (data.status === 'pending' || data.status === 'running') {
            timeoutId = window.setTimeout(poll, interval);
          }
        }
      } catch {
        if (mounted) setJob(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    poll();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [jobId, interval]);

  return { job, loading };
}
