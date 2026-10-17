export interface AgentMessage {
  readonly role: "system" | "user" | "assistant" | "tool";
  readonly content: string;
}

export interface AgentToolContext {
  readonly workspaceRoot: string;
  readonly approvedPaths?: readonly string[];
  readonly allowWrites?: boolean;
  readonly allowCommands?: boolean;
}

export interface AgentTool {
  readonly name: string;
  readonly description: string;
  execute(input: unknown, context: AgentToolContext): Promise<unknown>;
}

export interface FreeAIProvider {
  readonly id: string;
  readonly name: string;
  readonly baseUrl: string;
  listModels(): Promise<readonly string[]>;
  complete(messages: readonly AgentMessage[], model: string): Promise<AgentMessage>;
}

export interface AgentRequest {
  readonly prompt: string;
  readonly model: string;
  readonly messages?: readonly AgentMessage[];
  readonly tools?: readonly AgentTool[];
  readonly context: AgentToolContext;
}

export interface AgentResponse {
  readonly message: AgentMessage;
  readonly actions: readonly string[];
}

export class AIAgent {
  public constructor(private readonly provider: FreeAIProvider) {}

  public async run(request: AgentRequest): Promise<AgentResponse> {
    const messages: AgentMessage[] = [
      ...(request.messages ?? []),
      { role: "user", content: request.prompt },
    ];
    const response = await this.provider.complete(messages, request.model);
    return { message: response, actions: [] };
  }
}
