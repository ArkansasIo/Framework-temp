import type { AgentMessage, FreeAIProvider } from "./agent.js";

interface ChatCompletionResponse {
  choices?: readonly { message?: { role?: string; content?: string } }[];
}

/**
 * Provider adapter for local/free OpenAI-compatible model servers.
 * No API key is required for a local endpoint unless the configured server asks for one.
 */
export class OpenAICompatibleProvider implements FreeAIProvider {
  public constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly baseUrl: string,
    private readonly apiKey?: string,
  ) {}

  public async listModels(): Promise<readonly string[]> {
    const response = await this.request("/models");
    const body = (await response.json()) as { data?: readonly { id?: string }[] };
    return (body.data ?? []).flatMap((model) => (model.id ? [model.id] : []));
  }

  public async complete(messages: readonly AgentMessage[], model: string): Promise<AgentMessage> {
    const response = await this.request("/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model, messages, stream: false }),
    });
    const body = (await response.json()) as ChatCompletionResponse;
    const message = body.choices?.[0]?.message;
    if (!message?.content) throw new Error("AI provider returned no assistant content.");
    return { role: "assistant", content: message.content };
  }

  private async request(path: string, init?: RequestInit): Promise<Response> {
    const headers = new Headers(init?.headers);
    if (this.apiKey) headers.set("authorization", `Bearer ${this.apiKey}`);
    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}${path}`, {
      ...init,
      headers,
    });
    if (!response.ok) throw new Error(`AI provider request failed: HTTP ${response.status}.`);
    return response;
  }
}
