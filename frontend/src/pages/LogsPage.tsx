import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { LogFileList, LogViewer } from '../components/logs';
import { useTasks, useLogs } from '../hooks';

export function LogsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { tasks, loading: tasksLoading } = useTasks();
  const { files, content, loading, fetchFiles, fetchContent, clearContent } = useLogs();

  const selectedTask = searchParams.get('task') || '';
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);

  // Track the last fetched combination to prevent duplicate fetches
  const lastFetchRef = useRef<string>('');

  const taskOptions = [
    { value: '', label: 'Select a task...' },
    ...tasks.map((t) => ({ value: t.name, label: t.name })),
  ];

  useEffect(() => {
    if (selectedTask) {
      const fetchKey = `${selectedTask}-${testMode}`;

      // Only fetch if the task/mode combination changed
      if (lastFetchRef.current !== fetchKey) {
        lastFetchRef.current = fetchKey;
        fetchFiles(selectedTask, testMode);
        setSelectedFile(null);
        clearContent();
      }
    } else {
      lastFetchRef.current = '';
    }
  }, [selectedTask, testMode, fetchFiles, clearContent]);

  const handleTaskChange = (taskName: string) => {
    setSearchParams(taskName ? { task: taskName } : {});
  };

  const handleFileSelect = (filename: string) => {
    setSelectedFile(filename);
    if (selectedTask) {
      fetchContent(selectedTask, filename, testMode);
    }
  };

  return (
    <div className="p-8">
      <Header
        title="Logs"
        description="View execution logs for your Alma Analytics report tasks."
      />

      <div className="mb-6 flex items-end gap-4">
        <div className="w-64">
          <Select
            label="Task"
            value={selectedTask}
            onChange={(e) => handleTaskChange(e.target.value)}
            options={taskOptions}
            disabled={tasksLoading}
          />
        </div>
        <label className="flex items-center gap-2 pb-1">
          <input
            type="checkbox"
            checked={testMode}
            onChange={(e) => setTestMode(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
          />
          <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Test mode logs</span>
        </label>
      </div>

      {!selectedTask ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500 dark:text-slate-400">
            Select a task to view its log files
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Log Files</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && !content ? (
                <p className="py-8 text-center text-slate-500 dark:text-slate-400">Loading...</p>
              ) : (
                <LogFileList
                  files={files}
                  selectedFile={selectedFile}
                  onSelect={handleFileSelect}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Log Content</CardTitle>
            </CardHeader>
            <CardContent>
              {content ? (
                <LogViewer content={content.content} filename={content.name} />
              ) : (
                <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                  Select a log file to view its contents
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
