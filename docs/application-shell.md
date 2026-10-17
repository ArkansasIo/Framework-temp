# Framework Application Shell

The Framework application shell is a desktop-style command environment for the TypeScript/C++23 framework. It defines a complete menu hierarchy, toolbar, command palette, workspace navigation, diagnostics, project management, AI agent, and developer tools.

## Main Menu

### File
- New Project
- Open Project
- Open Recent
- Save / Save All
- Import / Export
- Project Settings
- Workspace Settings
- Close Project
- Exit

### Edit
- Undo / Redo
- Cut / Copy / Paste
- Duplicate / Delete
- Select All
- Find
- Find and Replace
- Preferences

### View
- Command Palette
- Project Explorer
- File Explorer
- Outline
- Problems
- Output
- Terminal
- Debug Console
- AI Assistant
- Documentation
- Properties
- Status Bar
- Full Screen
- Reset Layout

### Project
- New Module
- New Service
- New API
- New Database Adapter
- New UI Page
- New Test
- Build / Rebuild / Clean
- Run / Run Tests
- Coverage
- Package
- Generate Documentation
- Generate API Contract

### Tools
- Code Generator
- Schema Generator
- API Designer
- Data Model Designer
- Workflow Designer
- Algorithm Explorer
- UML Studio
- MLTA Studio
- JSON Inspector
- Configuration Editor
- Environment Editor
- Dependency Graph
- Performance Profiler
- Log Viewer
- Database Browser
- HTTP Client
- Task Runner

### AI
- AI Assistant
- New Agent Session
- Explain Selection
- Generate Code
- Refactor Code
- Generate Tests
- Debug Error
- Generate Documentation
- Analyze Repository
- Review Security
- Review Architecture
- Run Agent Task
- Agent Memory
- Agent Settings
- Local/Free Provider Settings

### Build
- Configure
- Type Check
- Build TypeScript
- Build C++23
- Run Unit Tests
- Run Integration Tests
- Run Security Tests
- Run Static Analysis
- Package Application
- View Build Logs

### Debug
- Start Debugging
- Start Without Debugging
- Attach to Process
- Breakpoints
- Watch
- Call Stack
- Threads
- Variables
- Memory
- Network Trace
- Event Trace
- Crash Reports

### Git
- Clone / Open Repository
- Fetch / Pull / Push
- Commit
- Branch
- Merge / Rebase
- Stash
- Compare
- History
- Pull Requests
- Issues
- Actions

### Window
- New Window
- New Workspace
- Split Editor
- Split Preview
- Focus Next/Previous Panel
- Minimize Panels
- Restore Layout

### Help
- Documentation
- API Reference
- Keyboard Shortcuts
- Tutorials
- Examples
- Diagnostics
- Check for Updates
- About Framework
- License

## Global toolbar

New, Open, Save, Undo/Redo, Build, Run, Debug, Test, Git Sync, Search, Command Palette, AI Agent, and Settings.

## Work areas

- Home dashboard
- Project workspace
- Code editor
- Visual designer
- API designer
- Data designer
- UML designer
- Algorithm explorer
- Terminal
- Diagnostics
- Test explorer
- Git workspace
- AI workspace
- Documentation browser

## Free AI agent

The AI agent is provider-neutral and does not require a paid cloud API. The default design supports a local/free model provider through an adapter interface. A local model server can expose an OpenAI-compatible API, allowing the framework to remain independent of a specific vendor.

### Agent tools
- Repository search
- File read/write
- Code generation
- Code patching
- Test execution
- Build execution
- Diagnostics
- Documentation search
- Symbol search
- Git status/diff
- Task planning
- Structured command execution

### Agent safety
- Require approval before destructive file operations.
- Restrict commands to the workspace by default.
- Never expose secrets to model prompts.
- Redact credentials from logs and tool output.
- Require confirmation for Git push, branch deletion, and releases.
- Record agent actions in an auditable session log.
