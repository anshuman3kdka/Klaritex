"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";

const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024;

interface PdfUploadProps {
  value: File | null;
  disabled?: boolean;
  errorMessage?: string | null;
  onFileChange: (file: File | null) => void;
}

function validatePdfFile(file: File): string | null {
  const isPdfByType = file.type === "application/pdf";
  const isPdfByName = file.name.toLowerCase().endsWith(".pdf");

  if (!isPdfByType && !isPdfByName) {
    return "Only PDF files are supported.";
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    return "File is too large. Maximum size is 5MB.";
  }

  return null;
}

export function PdfUpload({ value, disabled = false, errorMessage, onFileChange }: PdfUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function updateFile(nextFile: File | null) {
    if (!nextFile) {
      setLocalError(null);
      onFileChange(null);
      return;
    }

    const validationError = validatePdfFile(nextFile);

    if (validationError) {
      setLocalError(validationError);
      onFileChange(null);
      return;
    }

    setLocalError(null);
    onFileChange(nextFile);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    updateFile(nextFile);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragActive(false);

    if (disabled) {
      return;
    }

    const nextFile = event.dataTransfer.files?.[0] ?? null;
    updateFile(nextFile);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    if (!disabled) {
      setIsDragActive(true);
    }
  }

  function handleDragLeave() {
    setIsDragActive(false);
  }

  const activeErrorMessage = localError ?? errorMessage;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleInputChange}
        disabled={disabled}
        className="sr-only"
        id="klaritex-pdf-upload"
      />

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(event) => {
          if (!disabled && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={`cursor-pointer rounded-lg border border-dashed p-6 text-sm transition ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
            : isDragActive
              ? "border-indigo-500 bg-indigo-50 text-indigo-700"
              : "border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400"
        }`}
        aria-label="Upload PDF"
      >
        <p className="font-medium">Drag and drop a PDF here, or click to choose a file</p>
        <p className="mt-1 text-xs text-slate-500">PDF only · Maximum 5MB</p>

        {value ? (
          <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-sm font-medium text-emerald-800">{value.name}</p>
            <p className="text-xs text-emerald-700">Ready to analyze</p>
          </div>
        ) : null}
      </div>

      {activeErrorMessage ? <p className="mt-2 text-sm text-red-600">{activeErrorMessage}</p> : null}
    </div>
  );
}
