# Free Local AI Agent

## Goal

Framework includes a provider-neutral AI agent so the application can run an AI assistant without requiring a paid cloud API.

## Architecture

`AIAgent` -> `FreeAIProvider` -> `OpenAICompatibleProvider` -> local model server

The provider contract is intentionally small:

- `listModels()` discovers available local models.
- `complete()` sends a conversation and receives an assistant message.
- `baseUrl` is configurable.
- An API key is optional.

## Local deployment

Use any local model server that exposes an OpenAI-compatible `/v1/models` and `/v1/chat/completions` interface. Configure the application with the server URL and a locally installed model.

Example conceptual configuration:

```text
AI_PROVIDER=local
AI_BASE_URL=http://127.0.0.1:PORT/v1
AI_MODEL=<local-model-name>
AI_API_KEY=<optional>
```

The framework does not bundle model weights. This keeps the repository small and lets the user choose a model appropriate for their hardware.

## Agent capabilities

The planned tool layer supports:

- repository search
- file inspection
- code generation
- code edits
- test execution
- build execution
- diagnostics
- documentation lookup
- Git status and diff
- project scaffolding
- task planning

## Safety model

The agent is not granted unrestricted operating-system access. File writes, shell commands, Git pushes, branch deletion, and releases require explicit policy/approval. Secrets are never included in model context.
