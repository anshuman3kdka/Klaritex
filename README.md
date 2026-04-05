# Klaritex

## Required environment variables

Set these environment variables before running the API:

- `Klaritex`: Your Gemini API key used by `api/analyze.js`.
- `GEMINI_MODEL`: Gemini model id (example: `gemini-3-flash-preview`).

### Model fallback behavior

If `GEMINI_MODEL` is not set, the API falls back to `gemini-3-flash-preview`.

If the model id is invalid or Gemini rejects it, the API returns a clear error that includes the exact model name it tried to use.

## Typography

Use these text-size tokens consistently so screens feel clear and predictable:

- `display`: Hero-level statements, splash titles, or very high-emphasis numbers.
- `h1`: Page titles and primary section headers.
- `h2`: Card titles and major subsection headers.
- `h3`: Smaller subsection headers inside content blocks.
- `body`: Default paragraph text, descriptions, and most UI copy.
- `small`: Meta information, helper text, counters, and status details.

Font pairing:
- Heading font: `Space Grotesk` (strong personality for titles).
- Body font: `Inter` (high readability for longer reading).
