import { createWorkspaceTools } from "./workspace-tools.js";
import type { AIAgent, AgentRequest, AgentResponse } from "./agent.js";
export interface AgentTask { readonly id:string; readonly prompt:string; readonly model:string; }
export class AgentRuntime { private readonly tools=createWorkspaceTools(); constructor(private readonly agent:AIAgent){} async execute(task:AgentTask,workspaceRoot:string):Promise<AgentResponse>{const request:AgentRequest={prompt:task.prompt,model:task.model,tools:this.tools,context:{workspaceRoot,allowWrites:false,allowCommands:false}};return this.agent.run(request)} listTools(){return this.tools.map(t=>({name:t.name,description:t.description}))} }
