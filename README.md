# Klaritex

## Required environment variables

Set these environment variables before running the API:

- `Klaritex`: Your Gemini API key used by `api/analyze.js`.
- `GEMINI_MODEL`: Gemini model id (example: `gemini-3-flash-preview`).

### Model fallback behavior

If `GEMINI_MODEL` is not set, the API falls back to `gemini-3-flash-preview`.

If the model id is invalid or Gemini rejects it, the API returns a clear error that includes the exact model name it tried to use.
