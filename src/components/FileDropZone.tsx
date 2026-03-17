'use client';

import { useCallback, useState } from 'react';

interface FileDropZoneProps {
  label: string;
  required?: boolean;
  accept?: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  icon?: React.ReactNode;
}

export function FileDropZone({
  label,
  required,
  accept = 'image/*,.pdf',
  file,
  onFileChange,
  icon,
}: FileDropZoneProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const f = e.dataTransfer.files?.[0];
      if (f) onFileChange(f);
    },
    [onFileChange]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      onFileChange(f ?? null);
    },
    [onFileChange]
  );

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-slate-400">
        {label}
        {required && <span className="text-red-400/80 ml-0.5">*</span>}
      </span>
      <label
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8
          transition-all duration-200 cursor-pointer
          ${file
            ? 'border-green-500/40 bg-green-500/5'
            : dragActive
              ? 'border-blue-500/60 bg-blue-500/10'
              : 'border-[var(--border)] bg-[var(--surface-elevated)]/50 hover:border-blue-900/60 hover:bg-[var(--surface-elevated)]'}
        `}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        {icon && (
          <span className={file ? 'text-green-500/80' : 'text-slate-500'}>
            {icon}
          </span>
        )}
        {file ? (
          <span className="text-sm font-medium text-slate-200 truncate max-w-full px-2">
            {file.name}
          </span>
        ) : (
          <span className="text-sm text-slate-500">
            Drag & drop or <span className="text-blue-400">browse</span>
          </span>
        )}
      </label>
    </div>
  );
}
