# Universal Application Framework Template

A reusable, language-independent application architecture and algorithm catalog, with a TypeScript reference implementation.

## Goals

- Standardize application lifecycle, configuration, errors, validation, persistence boundaries, API processing, security, testing, and release operations.
- Keep domain logic independent from UI, HTTP transport, and storage providers.
- Document algorithms in `.alg` files and provide executable TypeScript foundations.
- Support web, desktop, mobile, CLI, and service applications through optional adapters.

## Repository status

This repository starts as a template. Algorithm specifications are reference designs; each production integration must supply its concrete database, identity provider, transport, deployment environment, and tests.

## Structure

- `algorithms/`: language-neutral algorithm specifications.
- `src/`: TypeScript reference primitives.
- `tests/`: automated tests.
- `docs/`: architecture and implementation guidance.
- `.github/workflows/`: CI checks.

## Requirements

- Node.js 20 or newer
- npm 10 or newer

## Commands

```sh
npm ci
npm run typecheck
npm test
npm run build
```

## Engineering rules

1. Validate all untrusted input at the trust boundary.
2. Default to deny for protected operations.
3. Keep secrets out of source control and logs.
4. Use atomic persistence operations for concurrent writes.
5. Make retries bounded and only retry operations safe to retry.
6. Test restore and rollback procedures; do not assume backups are valid.
7. Treat production readiness as a measured outcome, not a checklist assertion.

## License

MIT. See [LICENSE](LICENSE).
