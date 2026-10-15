# MLTA Studio

MLTA Studio is the first desktop application planned for the MLTAEngine: a C++23 development environment with a source editor, project explorer, visual logic outline, validation and execution entry points.

## Current implementation

- Qt 6 Widgets desktop shell when Qt 6.4+ is installed.
- File menu and keyboard shortcuts for opening and saving source text.
- Main toolbar, project explorer, source editor, logic outline, diagnostics output, and status footer.
- Basic empty-document validation and clearly marked runtime placeholders.
- CLI bootstrap build when Qt is unavailable, so the project can still be configured and compiled.

## Build

Requirements: CMake 3.25+ and a C++23-capable compiler. For the desktop interface, install Qt 6.4+ with the Widgets component.

```sh
cmake -S mlta-studio -B build/mlta-studio -DCMAKE_BUILD_TYPE=Release
cmake --build build/mlta-studio --config Release
```

Run the executable:

- Windows: `build\\mlta-studio\\Release\\mlta_studio.exe` (multi-config generators) or `build\\mlta-studio\\mlta_studio.exe`
- Linux/macOS: `./build/mlta-studio/mlta_studio`

If Qt is not found, CMake builds a CLI bootstrap and prints the dependency instructions.

## Planned milestones

1. **Engine integration:** connect MLTAEngine configuration, registry, context, parser, validation, planning, and execution.
2. **Editable logic graph:** select, create, connect, reorder, and configure nodes with undo/redo.
3. **Project model:** source files, modules, classes, types, arrays, and project settings.
4. **Diagnostics:** source locations, severity levels, trace inspection, and resource-budget reporting.
5. **Persistence and extensibility:** project serialization, settings, plugin API, automated tests, and packaged installers.

## Scope note

This is an initial application shell, not a completed IDE. The parser, graph editing, full validation, execution runtime, project persistence, and plugin loading remain future milestones.
