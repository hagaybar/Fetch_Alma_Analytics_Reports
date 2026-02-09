import { useState, useEffect, useCallback, useRef } from 'react';
import { reportsApi } from '../api/client';
import type { Job } from '../types';

export function useJobs(autoRefresh = true, refreshInterval = 2000) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);
  const jobsRef = useRef<Job[]>([]);
  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);

  // Keep ref in sync with state to access latest value in interval callback
  jobsRef.current = jobs;

  const fetchJobs = useCallback(async () => {
    // Prevent concurrent fetches
    if (fetchingRef.current || !mountedRef.current) {
      return;
    }
    fetchingRef.current = true;

    try {
      setError(null);
      const data = await reportsApi.listJobs();
      if (mountedRef.current) {
        setJobs(data);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      }
    } finally {
      fetchingRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchJobs();

    if (autoRefresh) {
      // Clear any existing interval first
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = window.setInterval(() => {
        const hasActiveJobs = jobsRef.current.some(
          (j) => j.status === 'pending' || j.status === 'running'
        );
        if (hasActiveJobs && mountedRef.current) {
          fetchJobs();
        }
      }, refreshInterval);
    }

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchJobs, autoRefresh, refreshInterval]);

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
