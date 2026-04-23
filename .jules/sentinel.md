## 2024-04-09 - Memory Exhaustion DoS via Unbounded Fetch
**Vulnerability:** The application used `node-fetch` to retrieve external URL contents without setting a maximum response size limit. A malicious server could return an extremely large response (e.g., streaming endless data or returning gigabytes of content), exhausting the Node.js process memory (`v8::internal::V8::FatalProcessOutOfMemory`) and causing a Denial of Service.
**Learning:** `fetch` calls, by default, will stream response bodies into memory indefinitely if no bounds are set. This is a critical risk when fetching arbitrary user-provided URLs.
**Prevention:** Always set the `size` option in `node-fetch` (e.g., `size: 5 * 1024 * 1024` for 5MB) when making requests to untrusted servers to strictly limit the maximum bytes consumed.

## 2024-04-07 - SSRF Vulnerability in URL Extraction
**Vulnerability:** The application was extracting URLs by making unrestricted HTTP fetches. Since no bounds validation existed, the app was susceptible to Server-Side Request Forgery (SSRF) and could be tricked into querying `localhost`, loopback metadata APIs, and internal IP subnets (e.g., `127.0.0.1`, `169.254.169.254`).
**Learning:** `fetch` calls and network libraries in Node.js do not natively protect against SSRF. Any user-provided URL must be strictly sanitized and tested against prohibited blocks prior to the initial request and also prior to redirect loops.
**Prevention:** Implement strict URL validation (e.g., protocol allowlisting and internal hostname/IP blocklisting) before passing URLs to network fetching interfaces like `node-fetch`.

## 2024-04-08 - ReDoS Vulnerability in Input Sanitization
**Vulnerability:** The application was applying regular expression replacements (e.g., stripping null bytes and control characters) to unconstrained user input *before* truncating the string. This created a vector for Regular Expression Denial of Service (ReDoS) if an attacker submitted an extremely large string, as the regex engine would have to process the entire massive payload before truncation.
**Learning:** Any operation whose execution time scales linearly (or worse) with input length, such as regex pattern matching or replacement, should only be performed on size-constrained inputs.
**Prevention:** Always enforce hard length constraints (e.g., using `slice()`) on user-supplied strings *before* applying any potentially expensive operations, sanitization logic, or regular expressions.

## 2024-04-11 - SSRF via IPv4-mapped IPv6 Address Normalization
**Vulnerability:** The application was vulnerable to SSRF bypasses via IPv4-mapped IPv6 internal network addresses (e.g., `[::ffff:192.168.1.1]`). The application attempted to block `127.0.0.1` and `::ffff:7f...` but Node.js `URL` constructor automatically normalizes these mapped addresses into their hex string equivalents (e.g., `[::ffff:c0a8:101]`), which bypassed the existing partial regex and exact string matching checks.
**Learning:** Standard decimal IP regex checks are insufficient when dealing with Node.js URL parsing of IPv6 inputs. Node will silently convert embedded IPv4 addresses into hex-mapped IPv6 addresses, which can still be used to route traffic to internal private IPs if the underlying network stack supports it.
**Prevention:** Implement comprehensive regex blocklists that catch the normalized hex equivalents of all private/internal IPv4 ranges (e.g., 10.x.x.x, 172.16.x.x, 192.168.x.x, 127.x.x.x, 169.254.x.x, 0.x.x.x) within the `::ffff:` mapped space, ensuring checks are run *after* the `URL` constructor has normalized the hostname.

## 2025-02-17 - SSRF Bypasses via IPv4-Compatible IPv6 and Trailing Dots
**Vulnerability:** The application was vulnerable to SSRF bypasses when parsing URLs for internal requests. Specifically, trailing dots on domain names (e.g., `localhost.`) bypassed strict string matching, and IPv4-compatible IPv6 addresses (e.g., `::127.0.0.1` and `[::127.0.0.1]`) bypassed dotted-decimal checks as Node.js normalizes them into hex format (e.g., `[::7f00:1]`).
**Learning:** Node.js URL normalization handles IPv6 IP translations uniquely. IPv4-mapped IPv6 (`::ffff:127.0.0.1`) and IPv4-compatible IPv6 (`::127.0.0.1`) are both converted. Second, Node.js preserves trailing dots on domain names (like `localhost.`) inside the `url.hostname` property, enabling SSRF bypasses via hostname string matching validation checks.
**Prevention:** Always validate hostnames ignoring trailing dots or block URLs with trailing dots entirely. In regex validation for SSRF, account for IPv4-compatible IPv6 (`::[hex]:[hex]`) matching alongside standard IPv4-mapped IPv6 blocklisting logic.
## 2026-04-12 - Memory Exhaustion DoS via Unbounded File Uploads
**Vulnerability:** The API route for analyzing PDFs called `file.arrayBuffer()` to read file contents into memory without checking the file size. This could lead to a Denial of Service (DoS) due to out-of-memory errors if a very large file is uploaded.
**Learning:** Default serverless platform limits might be too permissive. It is necessary to explicitly check file sizes before buffering them into memory to prevent resource exhaustion.
**Prevention:** Always check `file.size` against an upper limit (e.g., 10MB) before calling `arrayBuffer()` or similar methods that load the entire payload into RAM.

## 2024-05-20 - [CRITICAL] Path Traversal in Blog Post Meta Retrieval
**Vulnerability:** In `lib/posts.ts`, the `getPostBySlug` function constructed file paths dynamically by appending `.md` to a user-controlled `slug` via `path.join()`. No checks were performed to ensure that the resolved path stayed within the `content/posts` directory. This exposed the application to path traversal (e.g. `../../../etc/passwd`), potentially leading to arbitrary file disclosure since the contents are rendered as markdown.
**Learning:** Functions that access files dynamically based on input like an ID or Slug must always validate that the resolved path remains restricted to the intended target directory, even if the filename ends with an extension like `.md`.
**Prevention:** To avoid this next time, always securely resolve and validate the `candidate` path using `path.resolve(candidate).startsWith(path.resolve(BASE_DIR) + path.sep)`. This is safer than `path.normalize()` because it fully anchors the comparison and ensures boundaries are strictly maintained.
