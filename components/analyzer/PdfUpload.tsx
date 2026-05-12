"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { LabWell, LabLabel } from "../lab";

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
  const helperId = "klaritex-pdf-helper";
  const messageId = "klaritex-pdf-message";

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
        aria-describedby={hasError ? `${helperId} ${messageId}` : helperId}
      />

      <LabWell
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
        className={`cursor-pointer p-6 text-sm transition-[box-shadow,background-color,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-gold)]/50 ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : hasError
              ? "text-[var(--lab-red)] "
            : isDragActive
              ? "text-[var(--lab-gold)] shadow-[var(--shadow-pressed)] bg-[var(--lab-surface)] "
              : "text-[var(--lab-ink)] hover:text-[var(--lab-gold)]"
        }`}
        aria-label="Upload PDF"
      >
        <p className="font-sans font-semibold">Drag and drop a PDF here, or click to choose a file</p>
        <p className="font-sans text-xs mt-2 opacity-80">PDF only · Maximum 5MB</p>

        {value ? (
          <div className="rounded-lg mt-4 shadow-[var(--shadow-extruded)] p-4 text-[var(--lab-green)] ">
            <p className="font-sans font-semibold">{value.name}</p>
            <p className="font-sans text-xs mt-1">Ready to analyze</p>
          </div>
        ) : null}
      </LabWell>

      <p id={helperId} className="sr-only">
        PDF only. Maximum 5MB.
      </p>
      <p
        id={messageId}
        role={hasError ? "alert" : "status"}
        aria-live={hasError ? "assertive" : "polite"}
        className={`font-sans mt-2 min-h-5 text-sm ${hasError ? "text-[var(--lab-red)]" : "text-transparent"}`}
      >
        {activeErrorMessage ?? "PDF selection ready."}
      </p>
    </div>
  );
}
