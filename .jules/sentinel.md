## 2024-04-08 - ReDoS Vulnerability in Input Sanitization
**Vulnerability:** The application was applying regular expression replacements (e.g., stripping null bytes and control characters) to unconstrained user input *before* truncating the string. This created a vector for Regular Expression Denial of Service (ReDoS) if an attacker submitted an extremely large string, as the regex engine would have to process the entire massive payload before truncation.
**Learning:** Any operation whose execution time scales linearly (or worse) with input length, such as regex pattern matching or replacement, should only be performed on size-constrained inputs.
**Prevention:** Always enforce hard length constraints (e.g., using `slice()`) on user-supplied strings *before* applying any potentially expensive operations, sanitization logic, or regular expressions.

## 2024-04-07 - SSRF Vulnerability in URL Extraction
**Vulnerability:** The application was extracting URLs by making unrestricted HTTP fetches. Since no bounds validation existed, the app was susceptible to Server-Side Request Forgery (SSRF) and could be tricked into querying `localhost`, loopback metadata APIs, and internal IP subnets (e.g., `127.0.0.1`, `169.254.169.254`).
**Learning:** `fetch` calls and network libraries in Node.js do not natively protect against SSRF. Any user-provided URL must be strictly sanitized and tested against prohibited blocks prior to the initial request and also prior to redirect loops.
**Prevention:** Implement strict URL validation (e.g., protocol allowlisting and internal hostname/IP blocklisting) before passing URLs to network fetching interfaces like `node-fetch`.
