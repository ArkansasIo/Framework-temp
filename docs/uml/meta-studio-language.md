# UML Meta Studio Programming Language Library

The UML Meta Studio language layer is the language-independent semantic model used by the visual UML/MLTA editor. It is not intended to replace a target programming language. Instead, it provides one canonical representation that can be rendered as source code, a UML class model, a visual logic graph, or an executable workflow.

## Architecture

```text
UML Model
   |
   +-- Types / Fields / Relations
   |
   +-- MetaProgram
          |
          +-- MetaType
          |     +-- fields
          |     +-- functions
          |
          +-- MetaFunction
          |     +-- parameters
          |     +-- statements
          |            +-- expressions
          |
          +-- Semantic Validation
          |
          +-- Visual Logic Graph
          |
          +-- Language Adapters
                 +-- TypeScript / JavaScript
                 +-- C++ / C# / Java
                 +-- Python / Rust / Go
                 +-- Kotlin / Swift
                 +-- Lua / SQL
```

## Core programming constructs

The model supports modules, imports, packages, classes, interfaces, structs, records, enums, aliases, fields, properties, constants, functions, methods, constructors, parameters, variables, expressions, assignment, conditions, loops, return, throw, try/catch/finally, events, callbacks, async operations, generics, constraints, annotations, attributes, and query-oriented constructs.

## Semantic systems

### Type system

`TypeRef` supports primitive types, named types, generic arguments, nullability, `any`, and `unknown`. `inferExpressionType()` provides baseline expression inference. `sameType()` provides compatibility checks suitable for visual-editor validation.

### Symbol system

`SymbolTable` provides lexical scopes for types, fields, functions, parameters, and local variables. Duplicate declarations are rejected and unresolved assignments are diagnosed.

### Program validation

`validateProgram()` checks duplicate types/functions/members/parameters, unknown assignments, and incompatible return types. Diagnostics have a stable severity, error code, message, and optional model path so the Studio can place errors directly on UML or logic nodes.

### Visual logic

`LogicGraph` represents executable flow as nodes and typed ports. It supports start/end, literals, variables, assignments, operators, conditions, branches, loops, calls, returns, events, sequences, merges, and comments. `executeGraph()` provides a deterministic local execution engine and emits an execution trace for Studio debugging.

### Code generation

`LanguageAdapter` is the target-language boundary. The current registry includes TypeScript, JavaScript, C++, C#, Java, Python, Rust, Go, Kotlin, Swift, Lua, and SQL. Every adapter provides type rendering, parameter rendering, function rendering, program rendering, comments, and file-extension metadata.

## Meta Studio workflow

1. Create a UML component/class.
2. Add typed fields and operations.
3. Build an operation body with the visual logic editor.
4. Validate symbols and types.
5. Convert statements to a `LogicGraph` for visual editing.
6. Execute the graph locally for testing and tracing.
7. Generate target source code through a selected `LanguageAdapter`.
8. Preserve the canonical model so regeneration does not depend on generated source formatting.

## Data sets

`data/uml/languages.json` is the language registry and capability matrix. The existing UML component/function datasets remain the framework API catalog. Together they form the initial Meta Studio design data layer.

## Design rule

The UML/Meta Studio model is the source of truth for visual design. Generated TypeScript, C++, Python, Rust, and other source files are projections of that model. This keeps the visual editor, UML diagrams, runtime functions, datasets, and generated code synchronized.
