import type { MetaExpression, MetaProgram, MetaStatement } from "./language.js";
import { inferExpressionType, SymbolTable } from "./language.js";

export type LogicNodeKind =
  | "start" | "end" | "literal" | "variable" | "assign" | "operator" | "condition"
  | "branch" | "loop" | "call" | "return" | "event" | "sequence" | "merge" | "comment";

export interface LogicPort { id: string; name: string; direction: "input" | "output"; type: string; required?: boolean; }
export interface LogicNode {
  id: string;
  name: string;
  kind: LogicNodeKind;
  x: number;
  y: number;
  inputs: LogicPort[];
  outputs: LogicPort[];
  properties: Record<string, unknown>;
}
export interface LogicEdge { id: string; fromNode: string; fromPort: string; toNode: string; toPort: string; dataType?: string; }
export interface LogicGraph { id: string; name: string; nodes: LogicNode[]; edges: LogicEdge[]; variables: Record<string, string>; }
export interface LogicTrace { nodeId: string; status: "enter" | "exit" | "error"; value?: unknown; error?: string; timestamp: number; }
export interface LogicExecutionContext { variables: Map<string, unknown>; events: Array<{ name: string; payload?: unknown }>; trace: LogicTrace[]; }

export function createGraph(name: string): LogicGraph { return { id: id(), name, nodes: [], edges: [], variables: {} }; }
export function addNode(graph: LogicGraph, node: Omit<LogicNode, "id"> & { id?: string }): LogicNode {
  const created = { ...node, id: node.id ?? id() };
  if (graph.nodes.some(n => n.id === created.id)) throw new Error(`Duplicate logic node '${created.id}'.`);
  graph.nodes.push(created); return created;
}
export function connectNodes(graph: LogicGraph, edge: Omit<LogicEdge, "id"> & { id?: string }): LogicEdge {
  if (!graph.nodes.some(n => n.id === edge.fromNode) || !graph.nodes.some(n => n.id === edge.toNode)) throw new Error("Logic edge references an unknown node.");
  const created = { ...edge, id: edge.id ?? id() };
  if (graph.edges.some(e => e.id === created.id)) throw new Error(`Duplicate logic edge '${created.id}'.`);
  graph.edges.push(created); return created;
}
export function validateGraph(graph: LogicGraph): string[] {
  const errors: string[] = [];
  const nodeIds = new Set(graph.nodes.map(n => n.id));
  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.fromNode) || !nodeIds.has(edge.toNode)) errors.push(`Edge '${edge.id}' references a missing node.`);
    const from = graph.nodes.find(n => n.id === edge.fromNode)?.outputs.some(p => p.id === edge.fromPort);
    const to = graph.nodes.find(n => n.id === edge.toNode)?.inputs.some(p => p.id === edge.toPort);
    if (!from) errors.push(`Edge '${edge.id}' references missing output port '${edge.fromPort}'.`);
    if (!to) errors.push(`Edge '${edge.id}' references missing input port '${edge.toPort}'.`);
  }
  return errors;
}

export function createExecutionContext(seed: Record<string, unknown> = {}): LogicExecutionContext {
  return { variables: new Map(Object.entries(seed)), events: [], trace: [] };
}

export function executeGraph(graph: LogicGraph, context = createExecutionContext()): LogicExecutionContext {
  const errors = validateGraph(graph);
  if (errors.length) throw new Error(errors.join("\n"));
  const outgoing = new Map<string, LogicEdge[]>();
  for (const edge of graph.edges) outgoing.set(edge.fromNode, [...(outgoing.get(edge.fromNode) ?? []), edge]);
  const start = graph.nodes.find(n => n.kind === "start");
  if (!start) throw new Error("Logic graph has no start node.");
  const visited = new Set<string>();
  let current: LogicNode | undefined = start;
  while (current) {
    if (visited.has(current.id) && current.kind !== "loop") break;
    visited.add(current.id);
    context.trace.push({ nodeId: current.id, status: "enter", timestamp: Date.now() });
    try { executeNode(current, context); }
    catch (error) {
      context.trace.push({ nodeId: current.id, status: "error", error: String(error), timestamp: Date.now() });
      throw error;
    }
    context.trace.push({ nodeId: current.id, status: "exit", timestamp: Date.now() });
    const edges = outgoing.get(current.id) ?? [];
    current = selectNext(current, edges, context, graph);
  }
  return context;
}

function executeNode(node: LogicNode, context: LogicExecutionContext): void {
  switch (node.kind) {
    case "literal": context.variables.set(String(node.properties.outputName ?? node.id), node.properties.value); break;
    case "variable": {
      const name = String(node.properties.name ?? node.id);
      if (!context.variables.has(name)) throw new Error(`Unknown variable '${name}'.`);
      context.variables.set(String(node.properties.outputName ?? node.id), context.variables.get(name));
      break;
    }
    case "assign": {
      const name = String(node.properties.name);
      context.variables.set(name, node.properties.value);
      break;
    }
    case "operator": {
      const operator = String(node.properties.operator ?? "+");
      const a = node.properties.left;
      const b = node.properties.right;
      context.variables.set(String(node.properties.outputName ?? node.id), applyOperator(operator, a, b));
      break;
    }
    case "event": context.events.push({ name: String(node.properties.eventName ?? node.name), payload: node.properties.payload }); break;
    default: break;
  }
}

function selectNext(node: LogicNode, edges: LogicEdge[], context: LogicExecutionContext, graph: LogicGraph): LogicNode | undefined {
  if (node.kind === "condition" || node.kind === "branch") {
    const condition = Boolean(node.properties.condition ?? context.variables.get(String(node.properties.conditionVariable ?? "condition")));
    const port = condition ? "true" : "false";
    const edge = edges.find(e => e.fromPort === port) ?? edges[condition ? 0 : 1];
    return edge ? graph.nodes.find(n => n.id === edge.toNode) : undefined;
  }
  const edge = edges[0];
  return edge ? graph.nodes.find(n => n.id === edge.toNode) : undefined;
}

function applyOperator(operator: string, a: unknown, b: unknown): unknown {
  switch (operator) {
    case "+": return (a as any) + (b as any);
    case "-": return (a as any) - (b as any);
    case "*": return (a as any) * (b as any);
    case "/": if (Number(b) === 0) throw new Error("Division by zero."); return (a as any) / (b as any);
    case "%": return Number(a) % Number(b);
    case "==": case "===": return a === b;
    case "!=": case "!==": return a !== b;
    case ">": return Number(a) > Number(b);
    case ">=": return Number(a) >= Number(b);
    case "<": return Number(a) < Number(b);
    case "<=": return Number(a) <= Number(b);
    case "&&": return Boolean(a) && Boolean(b);
    case "||": return Boolean(a) || Boolean(b);
    default: throw new Error(`Unsupported operator '${operator}'.`);
  }
}

export function expressionToLogic(expression: MetaExpression): LogicNode {
  const type = inferExpressionType(expression, new SymbolTable());
  return {
    id: id(), name: expression.kind, kind: expression.kind === "call" ? "call" : expression.kind === "variable" ? "variable" : expression.kind === "literal" ? "literal" : "operator",
    x: 0, y: 0,
    inputs: [], outputs: [{ id: "result", name: "result", direction: "output", type: typeof type === "string" ? type : type.name }],
    properties: expression as unknown as Record<string, unknown>
  };
}

export function statementsToGraph(statements: MetaStatement[], name = "FunctionFlow"): LogicGraph {
  const graph = createGraph(name);
  let previous = addNode(graph, { name: "Start", kind: "start", x: 0, y: 0, inputs: [], outputs: [{ id: "next", name: "next", direction: "output", type: "flow" }], properties: {} });
  statements.forEach((statement, index) => {
    const node = statementToNode(statement, index);
    addNode(graph, node);
    connectNodes(graph, { fromNode: previous.id, fromPort: "next", toNode: node.id, toPort: "exec" });
    previous = node;
  });
  const end = addNode(graph, { name: "End", kind: "end", x: statements.length * 220, y: 0, inputs: [{ id: "exec", name: "exec", direction: "input", type: "flow" }], outputs: [], properties: {} });
  connectNodes(graph, { fromNode: previous.id, fromPort: "next", toNode: end.id, toPort: "exec" });
  return graph;
}

function statementToNode(statement: MetaStatement, index: number): Omit<LogicNode, "id"> {
  const kind: LogicNodeKind = statement.kind === "if" ? "condition" : statement.kind === "while" || statement.kind === "forEach" ? "loop" : statement.kind === "return" ? "return" : statement.kind === "assign" ? "assign" : "sequence";
  return {
    name: statement.kind,
    kind,
    x: (index + 1) * 220,
    y: 0,
    inputs: [{ id: "exec", name: "exec", direction: "input", type: "flow" }],
    outputs: [{ id: "next", name: "next", direction: "output", type: "flow" }],
    properties: statement as unknown as Record<string, unknown>
  };
}

export function programToGraphs(program: MetaProgram): LogicGraph[] {
  return [...program.functions.map(fn => statementsToGraph(fn.body, fn.name)), ...program.types.flatMap(t => t.functions.map(fn => statementsToGraph(fn.body, `${t.name}.${fn.name}`)))];
}

function id(): string { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`; }
