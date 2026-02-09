import { FileText } from 'lucide-react';
import type { LogFile } from '../../types';

interface LogFileListProps {
  files: LogFile[];
  selectedFile: string | null;
  onSelect: (filename: string) => void;
}

export function LogFileList({ files, selectedFile, onSelect }: LogFileListProps) {
  const formatDate = (timestamp: number) =>
    new Date(timestamp * 1000).toLocaleString();

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (files.length === 0) {
    return (
      <div className="py-8 text-center text-[hsl(var(--muted-foreground))]">
        No log files found
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {files.map((file) => (
        <button
          key={file.name}
          onClick={() => onSelect(file.name)}
          className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
            selectedFile === file.name
              ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
              : 'hover:bg-[hsl(var(--muted))]'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p
                className={`text-xs ${
                  selectedFile === file.name
                    ? 'text-[hsl(var(--primary-foreground))]/70'
                    : 'text-[hsl(var(--muted-foreground))]'
                }`}
              >
                {formatDate(file.modified)} · {formatSize(file.size)}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
