1. **Fix Path Traversal Vulnerability in `lib/posts.ts` (CRITICAL)**
   - The function `getPostBySlug` constructs a file path directly using `path.join(POSTS_DIR, \`\${slug}.md\`)` without verifying if the resolved path stays within `POSTS_DIR`. This allows a path traversal vulnerability where an attacker could pass a slug like `../../../etc/passwd` to read arbitrary files from the filesystem.
   - I will modify `getPostBySlug` to explicitly resolve the `candidate` path and ensure it starts with `path.resolve(POSTS_DIR) + path.sep`, returning `null` early if the check fails.

2. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.**
   - Run `pnpm lint` and `pnpm build` to verify the fix works and does not break the build.
   - Document the path traversal finding in `.jules/sentinel.md` as instructed.

3. **Submit the security fix via PR**
   - Use standard branch names and title for the PR as per Sentinel rules.
