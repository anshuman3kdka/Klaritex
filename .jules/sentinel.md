## 2024-04-09 - Memory Exhaustion DoS via Unbounded Fetch
**Vulnerability:** The application used `node-fetch` to retrieve external URL contents without setting a maximum response size limit. A malicious server could return an extremely large response (e.g., streaming endless data or returning gigabytes of content), exhausting the Node.js process memory (`v8::internal::V8::FatalProcessOutOfMemory`) and causing a Denial of Service.
**Learning:** `fetch` calls, by default, will stream response bodies into memory indefinitely if no bounds are set. This is a critical risk when fetching arbitrary user-provided URLs.
**Prevention:** Always set the `size` option in `node-fetch` (e.g., `size: 5 * 1024 * 1024` for 5MB) when making requests to untrusted servers to strictly limit the maximum bytes consumed.

## 2024-04-08 - ReDoS Vulnerability in Input Sanitization
**Vulnerability:** The application was applying regular expression replacements (e.g., stripping null bytes and control characters) to unconstrained user input *before* truncating the string. This created a vector for Regular Expression Denial of Service (ReDoS) if an attacker submitted an extremely large string, as the regex engine would have to process the entire massive payload before truncation.
**Learning:** Any operation whose execution time scales linearly (or worse) with input length, such as regex pattern matching or replacement, should only be performed on size-constrained inputs.
**Prevention:** Always enforce hard length constraints (e.g., using `slice()`) on user-supplied strings *before* applying any potentially expensive operations, sanitization logic, or regular expressions.

## 2024-04-07 - SSRF Vulnerability in URL Extraction
**Vulnerability:** The application was extracting URLs by making unrestricted HTTP fetches. Since no bounds validation existed, the app was susceptible to Server-Side Request Forgery (SSRF) and could be tricked into querying `localhost`, loopback metadata APIs, and internal IP subnets (e.g., `127.0.0.1`, `169.254.169.254`).
**Learning:** `fetch` calls and network libraries in Node.js do not natively protect against SSRF. Any user-provided URL must be strictly sanitized and tested against prohibited blocks prior to the initial request and also prior to redirect loops.
**Prevention:** Implement strict URL validation (e.g., protocol allowlisting and internal hostname/IP blocklisting) before passing URLs to network fetching interfaces like `node-fetch`.

## 2024-04-10 - SSRF Vulnerability via IPv4-mapped IPv6
**Vulnerability:** The application attempted to prevent Server-Side Request Forgery (SSRF) by validating hostnames extracted via `new URL()`. However, the validation failed to account for Node.js's automatic conversion of IPv4-mapped IPv6 addresses (e.g., `[::ffff:192.168.1.1]`) into their normalized hex string representation (e.g., `[::ffff:c0a8:101]`). This bypassed the standard decimal IP regex checks, allowing internal network requests.
**Learning:** `new URL()` strictly follows the WHATWG URL standard, parsing and normalizing various obfuscated IP formats (octal, hex, IPv4-in-IPv6) into canonical forms before any custom regex validation is applied.
**Prevention:** When implementing SSRF blocklists on IPv6 addresses parsed by the Node.js `URL` constructor, explicitly block IPv4-mapped IPv6 internal network addresses by checking for the normalized hex string prefixes corresponding to private subnets (e.g., `::ffff:c0a8:` for 192.168.0.0/16).
