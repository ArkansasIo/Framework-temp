export interface CommandDefinition {
  readonly id: string;
  readonly menu: string;
  readonly label: string;
  readonly shortcut?: string;
  readonly description: string;
}

export const COMMANDS: readonly CommandDefinition[] = [
  { id: "file.new-project", menu: "File", label: "New Project", shortcut: "Ctrl+N", description: "Create a project." },
  { id: "file.open-project", menu: "File", label: "Open Project", shortcut: "Ctrl+O", description: "Open a project." },
  { id: "file.save-all", menu: "File", label: "Save All", shortcut: "Ctrl+Shift+S", description: "Save all changes." },
  { id: "edit.command-palette", menu: "View", label: "Command Palette", shortcut: "Ctrl+Shift+P", description: "Search every application command." },
  { id: "project.build", menu: "Project", label: "Build", shortcut: "Ctrl+B", description: "Build the active project." },
  { id: "project.test", menu: "Project", label: "Run Tests", shortcut: "Ctrl+T", description: "Run the project test suite." },
  { id: "tools.api-designer", menu: "Tools", label: "API Designer", description: "Design API contracts." },
  { id: "tools.uml", menu: "Tools", label: "UML Studio", description: "Design UML diagrams." },
  { id: "tools.mlta", menu: "Tools", label: "MLTA Studio", description: "Open MLTA application tooling." },
  { id: "ai.assistant", menu: "AI", label: "AI Assistant", shortcut: "Ctrl+I", description: "Open the AI assistant." },
  { id: "ai.generate", menu: "AI", label: "Generate Code", description: "Generate code from a request." },
  { id: "ai.tests", menu: "AI", label: "Generate Tests", description: "Generate tests for selected code." },
  { id: "ai.security", menu: "AI", label: "Review Security", description: "Analyze the workspace for security issues." },
  { id: "build.configure", menu: "Build", label: "Configure", description: "Configure the build." },
  { id: "debug.start", menu: "Debug", label: "Start Debugging", shortcut: "F5", description: "Start a debugging session." },
  { id: "git.status", menu: "Git", label: "Status", description: "Show repository status." },
  { id: "git.commit", menu: "Git", label: "Commit", description: "Create a Git commit." },
  { id: "help.docs", menu: "Help", label: "Documentation", shortcut: "F1", description: "Open documentation." },
];

export function commandsForMenu(menu: string): readonly CommandDefinition[] {
  return COMMANDS.filter((command) => command.menu === menu);
}
