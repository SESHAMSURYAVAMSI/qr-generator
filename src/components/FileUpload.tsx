"use client";

import { Upload, FileText, X } from "lucide-react";
import { useRef } from "react";

interface FileUploadProps {
  title: string;
  description: string;
  accept: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export default function FileUpload({
  title,
  description,
  accept,
  file,
  onFileChange,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile?: File) => {
    if (!selectedFile) return;

    onFileChange(selectedFile);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          {title}
        </h2>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>

      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex min-h-40 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 transition hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          <div className="mb-3 rounded-full bg-white p-3 shadow-sm dark:bg-zinc-800">
            <Upload className="h-6 w-6 text-zinc-600 dark:text-zinc-300" />
          </div>

          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Click to upload
          </span>

          <span className="mt-1 text-xs text-zinc-500">
            {description}
          </span>
        </button>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-lg bg-white p-2 dark:bg-zinc-800">
              <FileText className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                {file.name}
              </p>

              <p className="text-xs text-zinc-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onFileChange(null)}
            className="rounded-lg p-2 transition hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const selected = event.target.files?.[0];
          handleFile(selected);
        }}
      />
    </div>
  );
}