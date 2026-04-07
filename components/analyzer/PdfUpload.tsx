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
        className={`cursor-pointer rounded-lg border border-dashed p-6 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-primary)]/50 ${
          disabled
            ? "cursor-not-allowed border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
            : isDragActive
              ? "border-[var(--border-accent)] bg-[var(--bg-elevated)] text-[var(--text-gold)]"
              : "border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--border-accent)]"
        }`}
        aria-label="Upload PDF"
      >
        <p className="font-ui font-medium">Drag and drop a PDF here, or click to choose a file</p>
        <p className="font-ui mt-1 text-xs text-[var(--text-secondary)]">PDF only · Maximum 5MB</p>

        {value ? (
          <div className="mt-4 rounded-md border border-[var(--clear-color)]/40 bg-[var(--clear-color)]/15 p-3">
            <p className="font-ui text-sm font-medium text-[var(--clear-color)]">{value.name}</p>
            <p className="font-ui text-xs text-[var(--clear-color)]">Ready to analyze</p>
          </div>
        ) : null}
      </div>

      {activeErrorMessage ? <p className="font-ui mt-2 text-sm text-[var(--missing-color)]">{activeErrorMessage}</p> : null}
    </div>
  );
}
