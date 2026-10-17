export interface CommandContext { readonly args?: readonly string[]; readonly data?: unknown; }
export interface CommandHandler { execute(context: CommandContext): Promise<unknown> | unknown; }

export class CommandBus {
  private readonly handlers = new Map<string, CommandHandler>();
  register(id: string, handler: CommandHandler): this { if (this.handlers.has(id)) throw new Error(`Command already registered: ${id}`); this.handlers.set(id, handler); return this; }
  unregister(id: string): boolean { return this.handlers.delete(id); }
  has(id: string): boolean { return this.handlers.has(id); }
  async execute<T = unknown>(id: string, context: CommandContext = {}): Promise<T> {
    const handler = this.handlers.get(id);
    if (!handler) throw new Error(`Unknown command: ${id}`);
    return await handler.execute(context) as T;
  }
  list(): string[] { return [...this.handlers.keys()].sort(); }
}
