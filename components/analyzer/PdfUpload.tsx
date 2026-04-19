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
  const hasError = Boolean(activeErrorMessage);

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
        className={`k-radius-primary cursor-pointer border border-dashed bg-[var(--bg-primary)] p-6 text-sm transition-[border-color,box-shadow,background-color,color] duration-200 focus-visible:outline-none ${
          disabled
            ? "cursor-not-allowed k-border-ui bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
            : hasError
              ? "border-[var(--missing-color)] text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--missing-color)]/35 focus-visible:shadow-[0_0_0_4px_rgba(220,76,100,0.16)]"
            : isDragActive
              ? "border-[var(--border-accent)] bg-[var(--bg-elevated)] text-[var(--text-gold)] focus-visible:ring-2 focus-visible:ring-[var(--gold-primary)]/25 focus-visible:shadow-[0_0_0_4px_rgba(201,168,76,0.14)]"
              : "k-border-ui text-[var(--text-primary)] hover:border-[var(--border-accent)] focus-visible:ring-2 focus-visible:ring-[var(--gold-primary)]/25 focus-visible:shadow-[0_0_0_4px_rgba(201,168,76,0.14)]"
        }`}
        aria-label="Upload PDF"
      >
        <p className="font-ui k-text-heading">Drag and drop a PDF here, or click to choose a file</p>
        <p className="font-ui k-text-helper mt-2 text-sm leading-5">PDF only · Maximum 5MB</p>

        {value ? (
          <div className="k-radius-secondary mt-4 border border-[var(--clear-color)]/40 bg-[var(--clear-color)]/15 p-3">
            <p className="font-ui k-text-heading text-[var(--clear-color)]">{value.name}</p>
            <p className="font-ui k-text-helper text-[var(--clear-color)]">Ready to analyze</p>
          </div>
        ) : null}
      </div>

      <p className={`font-ui mt-2 min-h-5 text-sm leading-5 ${hasError ? "text-[var(--missing-color)]" : "text-transparent"}`}>
        {activeErrorMessage ?? "PDF selection ready."}
      </p>
    </div>
  );
}
