import { describe, expect, it } from "vitest";
import { createFunction, createProgram, literal, validateProgram } from "../src/uml/language.js";
import { addNode, connectNodes, createExecutionContext, createGraph, executeGraph, statementsToGraph } from "../src/uml/logic.js";
import { generateCode, listLanguageAdapters } from "../src/uml/codegen.js";

describe("UML Meta Studio language", () => {
  it("creates and validates a typed function", () => {
    const program = createProgram("Example");
    const fn = createFunction("answer", "integer");
    fn.body.push({ kind: "return", expression: literal(42) });
    program.functions.push(fn);
    expect(validateProgram(program)).toEqual([]);
  });

  it("detects return type errors", () => {
    const program = createProgram("Example");
    const fn = createFunction("answer", "integer");
    fn.body.push({ kind: "return", expression: literal("wrong") });
    program.functions.push(fn);
    expect(validateProgram(program).some(d => d.code === "E1103")).toBe(true);
  });

  it("executes a visual logic graph", () => {
    const graph = createGraph("flow");
    const start = addNode(graph, { name: "Start", kind: "start", x: 0, y: 0, inputs: [], outputs: [{ id: "next", name: "next", direction: "output", type: "flow" }], properties: {} });
    const value = addNode(graph, { name: "Value", kind: "literal", x: 100, y: 0, inputs: [{ id: "exec", name: "exec", direction: "input", type: "flow" }], outputs: [{ id: "next", name: "next", direction: "output", type: "flow" }], properties: { outputName: "answer", value: 42 } });
    const end = addNode(graph, { name: "End", kind: "end", x: 200, y: 0, inputs: [{ id: "exec", name: "exec", direction: "input", type: "flow" }], outputs: [], properties: {} });
    connectNodes(graph, { fromNode: start.id, fromPort: "next", toNode: value.id, toPort: "exec" });
    connectNodes(graph, { fromNode: value.id, fromPort: "next", toNode: end.id, toPort: "exec" });
    const result = executeGraph(graph, createExecutionContext());
    expect(result.variables.get("answer")).toBe(42);
  });

  it("generates source for every registered target language", () => {
    const program = createProgram("Example");
    program.functions.push(createFunction("run", "void"));
    for (const adapter of listLanguageAdapters()) {
      expect(generateCode(program, adapter.id)).toContain("run");
    }
  });

  it("converts statements into a visual graph", () => {
    const graph = statementsToGraph([{ kind: "return", expression: literal(1) }], "run");
    expect(graph.nodes.some(n => n.kind === "start")).toBe(true);
    expect(graph.nodes.some(n => n.kind === "return")).toBe(true);
    expect(graph.nodes.some(n => n.kind === "end")).toBe(true);
    expect(graph.edges.length).toBe(2);
  });
});
