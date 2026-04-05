# Design Tokens

This project uses semantic color tokens so component styles don't rely on hard-coded hex values.

## Required semantic tokens

- `--color-bg`: Main page/app background color.
- `--color-surface`: Surface/card background color.
- `--color-text`: Default text color.
- `--color-muted`: Secondary text color (kept bright enough for readability on dark surfaces).
- `--color-primary`: Primary action/highlight color.
- `--color-success`: Success state color.
- `--color-warning`: Warning state color.
- `--color-error`: Error state color.

## Current token values

Defined in `styles.css` under the `:root` block:

- `--color-bg: #080808`
- `--color-surface: #1b1b1b`
- `--color-text: #f2f2f2`
- `--color-muted: #c6c6c6`
- `--color-primary: #c8a24a`
- `--color-success: #34c759`
- `--color-warning: #ffb020`
- `--color-error: #ff5a5f`

## Notes

- Use semantic tokens in component styles instead of hard-coded hex values.
- Keep contrast readable: avoid very light gray text on light backgrounds (and very dark text on dark backgrounds).
