# Universal Application Framework Template

A reusable, language-independent application architecture and algorithm catalog, with TypeScript and native C++23 reference implementations.

## Goals

- Standardize application lifecycle, configuration, errors, validation, persistence boundaries, API processing, security, testing, and release operations.
- Keep domain logic independent from UI, HTTP transport, and storage providers.
- Document algorithms in `.alg` files and provide executable TypeScript and C++23 foundations.
- Support web, desktop, mobile, CLI, and service applications through optional adapters.

## Repository status

This repository is a framework template. Algorithm specifications are reference designs; each production integration must supply its concrete database, identity provider, transport, deployment environment, and tests.

## Structure

- `algorithms/`: language-neutral algorithm specifications.
- `src/`: TypeScript reference primitives.
- `tests/`: TypeScript automated tests.
- `cpp23/`: native C++23 library, CMake build, reusable core headers, examples, and tests.
- `docs/`: architecture, API contracts, testing, setup, release, and implementation guidance.
- `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`: project maintenance and security policies.
- `.github/workflows/`: CI checks for TypeScript and C++23.

## TypeScript requirements and commands

Requirements: Node.js 20 or newer, npm 10 or newer.

```sh
npm install
npm run typecheck
npm test
npm run build
```

## C++23 requirements and commands

Requirements: CMake 3.25+ and a C++23-capable compiler (GCC 13+, Clang 16+, or a recent Visual Studio 2022 toolset).

```sh
cmake -S cpp23 -B build/cpp23 -DCMAKE_BUILD_TYPE=Release
cmake --build build/cpp23 --config Release
ctest --test-dir build/cpp23 --output-on-failure
```

See [the C++23 implementation guide](cpp23/README.md) for modules, configuration keys, and design boundaries. The [algorithm implementation matrix](docs/algorithm-implementation-matrix.md) separates implemented primitives from specification-only algorithms and provider-specific integrations.

## Engineering rules

1. Validate all untrusted input at the trust boundary.
2. Default to deny for protected operations.
3. Keep secrets out of source control and logs.
4. Use atomic persistence operations for concurrent writes.
5. Make retries bounded and only retry operations safe to retry.
6. Test restore and rollback procedures; do not assume backups are valid.
7. Treat production readiness as a measured outcome, not a checklist assertion.


## MLTA Application Engine UML

The UML design for the C++23 application shell is available in [docs/uml](docs/uml/README.md). It covers the application core, public API, header/menu/toolbar GUI shell, navigation, pages and subpages, workspace planes, persistence, plugins, and command dispatch.

- [Class diagram source](docs/uml/MLTA_Application_Engine.puml)
- [Navigation sequence diagram source](docs/uml/MLTA_Navigation_Sequence.puml)

## License

MIT. See [LICENSE](LICENSE).
