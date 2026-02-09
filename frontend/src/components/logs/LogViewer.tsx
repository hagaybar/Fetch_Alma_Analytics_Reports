import { useEffect, useRef } from 'react';

interface LogViewerProps {
  content: string;
  filename: string;
}

export function LogViewer({ content, filename }: LogViewerProps) {
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (preRef.current) {
      preRef.current.scrollTop = preRef.current.scrollHeight;
    }
  }, [content]);

  return (
    <div className="flex flex-col rounded-lg border border-[hsl(var(--border))]">
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-4 py-2">
        <p className="font-mono text-sm">{filename}</p>
      </div>
      <pre
        ref={preRef}
        className="max-h-[500px] overflow-auto bg-gray-900 p-4 font-mono text-xs text-gray-100"
      >
        {content || 'No log content'}
      </pre>
    </div>
  );
}
