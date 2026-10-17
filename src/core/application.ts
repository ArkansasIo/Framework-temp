import { CommandBus } from "./command-bus.js";
import { EventBus } from "./event-bus.js";
import { ServiceRegistry } from "./services.js";
import { StateMachine } from "./state-machine.js";
import { Logger } from "./logger.js";
import type { CommandDefinition } from "../app/commands.js";

export class ApplicationKernel {
  readonly events = new EventBus(); readonly services = new ServiceRegistry(); readonly commands = new CommandBus(); readonly lifecycle = new StateMachine(); readonly logger = new Logger();
  async start():Promise<void>{this.lifecycle.transition("starting");await this.events.emit("application.starting",{});this.lifecycle.transition("running");await this.events.emit("application.started",{});this.logger.info("Application started");}
  async stop():Promise<void>{if(this.lifecycle.current()!=="running")return;this.lifecycle.transition("stopping");await this.events.emit("application.stopping",{});this.lifecycle.transition("stopped");await this.events.emit("application.stopped",{});this.logger.info("Application stopped");}
  registerCommands(definitions:readonly CommandDefinition[],handlers:Record<string,()=>unknown>):void{for(const d of definitions){const h=handlers[d.id];if(h)this.commands.register(d.id,{execute:h});}}
}
