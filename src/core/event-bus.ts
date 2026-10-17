export type EventHandler<T = unknown> = (event: T) => void | Promise<void>;

export class EventBus {
  private readonly handlers = new Map<string, Set<EventHandler>>();

  on<T>(name: string, handler: EventHandler<T>): () => void {
    const set = this.handlers.get(name) ?? new Set<EventHandler>();
    set.add(handler as EventHandler);
    this.handlers.set(name, set);
    return () => set.delete(handler as EventHandler);
  }

  async emit<T>(name: string, event: T): Promise<void> {
    const set = this.handlers.get(name);
    if (!set) return;
    for (const handler of [...set]) await handler(event);
  }

  clear(name?: string): void {
    if (name) this.handlers.delete(name); else this.handlers.clear();
  }
}
