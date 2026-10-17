export type MetaLanguageId =
  | "typescript"
  | "javascript"
  | "cpp"
  | "csharp"
  | "java"
  | "python"
  | "rust"
  | "go"
  | "kotlin"
  | "swift"
  | "lua"
  | "sql";

export type PrimitiveType = "void" | "boolean" | "integer" | "float" | "string" | "bytes" | "any" | "unknown";
export type TypeRef = PrimitiveType | { name: string; genericArgs?: TypeRef[]; nullable?: boolean };

export interface MetaParameter {
  id: string;
  name: string;
  type: TypeRef;
  optional?: boolean;
  defaultValue?: MetaExpression;
}

export interface MetaExpression {
  kind: "literal" | "variable" | "binary" | "unary" | "call" | "member" | "array" | "object";
  value?: unknown;
  name?: string;
  operator?: string;
  left?: MetaExpression;
  right?: MetaExpression;
  operand?: MetaExpression;
  target?: MetaExpression;
  arguments?: MetaExpression[];
  members?: Record<string, MetaExpression>;
  elements?: MetaExpression[];
}

export interface MetaStatement {
  kind:
    | "expression"
    | "variable"
    | "assign"
    | "if"
    | "while"
    | "forEach"
    | "return"
    | "break"
    | "continue"
    | "throw"
    | "try"
    | "block";
  name?: string;
  type?: TypeRef;
  expression?: MetaExpression;
  condition?: MetaExpression;
  body?: MetaStatement[];
  elseBody?: MetaStatement[];
  itemName?: string;
  collection?: MetaExpression;
  catchName?: string;
  catchBody?: MetaStatement[];
  finallyBody?: MetaStatement[];
}

export interface MetaField {
  id: string;
  name: string;
  type: TypeRef;
  visibility?: "public" | "protected" | "private" | "internal";
  static?: boolean;
  readonly?: boolean;
}

export interface MetaFunction {
  id: string;
  name: string;
  parameters: MetaParameter[];
  returnType: TypeRef;
  body: MetaStatement[];
  visibility?: "public" | "protected" | "private" | "internal";
  static?: boolean;
  async?: boolean;
  abstract?: boolean;
}

export interface MetaType {
  id: string;
  name: string;
  kind: "class" | "interface" | "struct" | "record" | "enum" | "alias" | "module";
  fields: MetaField[];
  functions: MetaFunction[];
  extends?: string[];
  implements?: string[];
  enumValues?: string[];
}

export interface MetaProgram {
  id: string;
  name: string;
  version: string;
  language?: MetaLanguageId;
  imports: string[];
  types: MetaType[];
  functions: MetaFunction[];
  globals: MetaField[];
}

export interface Diagnostic {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  path?: string;
}

export interface SymbolEntry {
  name: string;
  kind: "type" | "field" | "function" | "parameter" | "variable";
  type: TypeRef;
}

export class SymbolTable {
  private readonly scopes: Map<string, SymbolEntry>[] = [new Map()];

  push(): void { this.scopes.push(new Map()); }
  pop(): void { if (this.scopes.length === 1) throw new Error("Cannot pop global symbol scope"); this.scopes.pop(); }
  define(symbol: SymbolEntry): void {
    const scope = this.scopes[this.scopes.length - 1];
    if (scope.has(symbol.name)) throw new Error(`Duplicate symbol: ${symbol.name}`);
    scope.set(symbol.name, symbol);
  }
  resolve(name: string): SymbolEntry | undefined {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      const found = this.scopes[i].get(name);
      if (found) return found;
    }
    return undefined;
  }
}

export function typeName(type: TypeRef): string {
  if (typeof type === "string") return type;
  const generic = type.genericArgs?.length ? `<${type.genericArgs.map(typeName).join(", ")}>` : "";
  return `${type.name}${generic}${type.nullable ? "?" : ""}`;
}

export function sameType(a: TypeRef, b: TypeRef): boolean {
  return typeName(a) === typeName(b) || a === "any" || b === "any" || a === "unknown" || b === "unknown";
}

export function inferExpressionType(expression: MetaExpression, symbols: SymbolTable): TypeRef {
  switch (expression.kind) {
    case "literal": {
      if (expression.value === null) return { name: "null", nullable: true };
      if (typeof expression.value === "boolean") return "boolean";
      if (typeof expression.value === "number") return Number.isInteger(expression.value) ? "integer" : "float";
      if (typeof expression.value === "string") return "string";
      return "any";
    }
    case "variable": return expression.name ? symbols.resolve(expression.name)?.type ?? "unknown" : "unknown";
    case "array": return { name: "Array", genericArgs: expression.elements?.length ? [inferExpressionType(expression.elements[0], symbols)] : ["any"] };
    case "object": return { name: "object" };
    case "unary": return expression.operand ? inferExpressionType(expression.operand, symbols) : "unknown";
    case "binary": {
      const left = expression.left ? inferExpressionType(expression.left, symbols) : "unknown";
      const right = expression.right ? inferExpressionType(expression.right, symbols) : "unknown";
      if (["==", "!=", "===", "!==", ">", ">=", "<", "<=", "&&", "||"].includes(expression.operator ?? "")) return "boolean";
      if (expression.operator === "+" && (left === "string" || right === "string")) return "string";
      if (left === "float" || right === "float") return "float";
      if (left === "integer" && right === "integer") return "integer";
      return "any";
    }
    case "call": return expression.name ? symbols.resolve(expression.name)?.type ?? "unknown" : "unknown";
    case "member": return "unknown";
    default: return "unknown";
  }
}

export function validateProgram(program: MetaProgram): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const symbols = new SymbolTable();
  const types = new Set<string>();
  for (const type of program.types) {
    if (types.has(type.name)) diagnostics.push({ severity: "error", code: "E1001", message: `Duplicate type '${type.name}'.`, path: `types.${type.id}` });
    types.add(type.name);
    symbols.define({ name: type.name, kind: "type", type: { name: type.name } });
  }
  const functions = new Set<string>();
  for (const fn of program.functions) {
    if (functions.has(fn.name)) diagnostics.push({ severity: "error", code: "E1002", message: `Duplicate function '${fn.name}'.`, path: `functions.${fn.id}` });
    functions.add(fn.name);
    symbols.define({ name: fn.name, kind: "function", type: fn.returnType });
    symbols.push();
    for (const p of fn.parameters) {
      try { symbols.define({ name: p.name, kind: "parameter", type: p.type }); }
      catch { diagnostics.push({ severity: "error", code: "E1003", message: `Duplicate parameter '${p.name}'.`, path: `functions.${fn.id}.parameters.${p.id}` }); }
    }
    validateStatements(fn.body, symbols, fn.returnType, diagnostics, `functions.${fn.id}.body`);
    symbols.pop();
  }
  for (const type of program.types) {
    const members = new Set<string>();
    for (const field of type.fields) {
      if (members.has(field.name)) diagnostics.push({ severity: "error", code: "E1004", message: `Duplicate member '${field.name}' in '${type.name}'.`, path: `types.${type.id}.fields.${field.id}` });
      members.add(field.name);
    }
    for (const fn of type.functions) {
      if (members.has(fn.name)) diagnostics.push({ severity: "error", code: "E1005", message: `Duplicate member '${fn.name}' in '${type.name}'.`, path: `types.${type.id}.functions.${fn.id}` });
      members.add(fn.name);
    }
  }
  return diagnostics;
}

function validateStatements(statements: MetaStatement[], symbols: SymbolTable, returnType: TypeRef, diagnostics: Diagnostic[], path: string): void {
  statements.forEach((statement, index) => {
    const p = `${path}.${index}`;
    if (statement.kind === "variable" && statement.name && statement.type) {
      try { symbols.define({ name: statement.name, kind: "variable", type: statement.type }); }
      catch { diagnostics.push({ severity: "error", code: "E1101", message: `Duplicate variable '${statement.name}'.`, path: p }); }
    }
    if (statement.kind === "assign" && statement.name && !symbols.resolve(statement.name)) diagnostics.push({ severity: "error", code: "E1102", message: `Unknown variable '${statement.name}'.`, path: p });
    if (statement.kind === "return") {
      const actual = statement.expression ? inferExpressionType(statement.expression, symbols) : "void";
      if (!sameType(actual, returnType)) diagnostics.push({ severity: "error", code: "E1103", message: `Return type '${typeName(actual)}' does not match '${typeName(returnType)}'.`, path: p });
    }
    if (statement.body) { symbols.push(); validateStatements(statement.body, symbols, returnType, diagnostics, `${p}.body`); symbols.pop(); }
    if (statement.elseBody) { symbols.push(); validateStatements(statement.elseBody, symbols, returnType, diagnostics, `${p}.elseBody`); symbols.pop(); }
    if (statement.catchBody) { symbols.push(); validateStatements(statement.catchBody, symbols, returnType, diagnostics, `${p}.catchBody`); symbols.pop(); }
    if (statement.finallyBody) { symbols.push(); validateStatements(statement.finallyBody, symbols, returnType, diagnostics, `${p}.finallyBody`); symbols.pop(); }
  });
}

export function createProgram(name: string, version = "1.0.0"): MetaProgram {
  return { id: cryptoRandomId(), name, version, imports: [], types: [], functions: [], globals: [] };
}

export function createFunction(name: string, returnType: TypeRef = "void"): MetaFunction {
  return { id: cryptoRandomId(), name, parameters: [], returnType, body: [] };
}

export function createStatement(kind: MetaStatement["kind"], expression?: MetaExpression): MetaStatement {
  return { kind, ...(expression ? { expression } : {}) };
}

export function literal(value: unknown): MetaExpression { return { kind: "literal", value }; }
export function variable(name: string): MetaExpression { return { kind: "variable", name }; }
export function binary(operator: string, left: MetaExpression, right: MetaExpression): MetaExpression { return { kind: "binary", operator, left, right }; }
export function call(name: string, args: MetaExpression[] = []): MetaExpression { return { kind: "call", name, arguments: args }; }

function cryptoRandomId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
