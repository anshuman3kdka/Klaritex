## 2024-04-06 - [Fix SSRF in URL Extractor]
**Vulnerability:** Server-Side Request Forgery (SSRF) allowed the application to fetch contents from internal network ranges (e.g., localhost, 10.x.x.x, 192.168.x.x) and follow redirects to internal IP addresses through `lib/extractUrl.ts`.
**Learning:** External URL fetching must validate the domain/IP before the initial request AND before following any redirects to ensure they don't resolve to private network space.
**Prevention:** Always use a safe URL validation function (`isSafeUrl`) that strictly disallows internal IP ranges and localhost before making HTTP requests on behalf of the user.

## 2024-04-06 - [Fix ReDoS in Input Sanitizer]
**Vulnerability:** Regular Expression Denial of Service (ReDoS) was possible in `sanitizeInput` because complex regex replacements were running on potentially unbounded input sizes before the `.slice(0, 10000)` length limit was applied.
**Learning:** Length limits must be applied to user input *before* running any regular expressions to prevent CPU exhaustion.
**Prevention:** Always slice or validate string length as the first operation in a sanitization pipeline.
