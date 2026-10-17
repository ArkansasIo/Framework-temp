export type LifecycleState = "created" | "starting" | "running" | "stopping" | "stopped" | "failed";
const allowed: Record<LifecycleState, LifecycleState[]> = { created:["starting"], starting:["running","failed"], running:["stopping","failed"], stopping:["stopped","failed"], stopped:["starting"], failed:["starting","stopped"] };
export class StateMachine {
  public constructor(private state: LifecycleState = "created") {}
  current(): LifecycleState { return this.state; }
  can(next: LifecycleState): boolean { return allowed[this.state].includes(next); }
  transition(next: LifecycleState): void { if (!this.can(next)) throw new Error(`Invalid transition ${this.state} -> ${next}`); this.state = next; }
}
