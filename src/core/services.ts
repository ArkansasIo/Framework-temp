export interface ServiceToken<T> { readonly id: string; readonly default?: () => T; }

export class ServiceRegistry {
  private readonly services = new Map<string, unknown>();
  register<T>(token: ServiceToken<T>, value: T): this { this.services.set(token.id, value); return this; }
  resolve<T>(token: ServiceToken<T>): T {
    const existing = this.services.get(token.id);
    if (existing !== undefined) return existing as T;
    if (token.default) { const value = token.default(); this.services.set(token.id, value); return value; }
    throw new Error(`Service not registered: ${token.id}`);
  }
  has(token: ServiceToken<unknown>): boolean { return this.services.has(token.id); }
  remove(token: ServiceToken<unknown>): boolean { return this.services.delete(token.id); }
  clear(): void { this.services.clear(); }
}
