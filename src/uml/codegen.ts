import type { MetaExpression, MetaFunction, MetaProgram, MetaStatement, MetaType, TypeRef } from "./language.js";
import type { MetaLanguageId } from "./language.js";

export interface LanguageAdapter {
  id: MetaLanguageId;
  extension: string;
  comment(text: string): string;
  type(type: TypeRef): string;
  parameter(name: string, type: TypeRef): string;
  function(fn: MetaFunction, owner?: MetaType): string;
  program(program: MetaProgram): string;
}

const adapters: Record<MetaLanguageId, LanguageAdapter> = {
  typescript: makeAdapter("typescript", "ts", "//", { void: "void", boolean: "boolean", integer: "number", float: "number", string: "string", bytes: "Uint8Array", any: "any", unknown: "unknown" }),
  javascript: makeAdapter("javascript", "js", "//", { void: "void", boolean: "boolean", integer: "number", float: "number", string: "string", bytes: "Uint8Array", any: "any", unknown: "unknown" }),
  cpp: makeAdapter("cpp", "cpp", "//", { void: "void", boolean: "bool", integer: "std::int64_t", float: "double", string: "std::string", bytes: "std::vector<std::byte>", any: "std::any", unknown: "std::any" }),
  csharp: makeAdapter("csharp", "cs", "//", { void: "void", boolean: "bool", integer: "long", float: "double", string: "string", bytes: "byte[]", any: "object", unknown: "object" }),
  java: makeAdapter("java", "java", "//", { void: "void", boolean: "boolean", integer: "long", float: "double", string: "String", bytes: "byte[]", any: "Object", unknown: "Object" }),
  python: makeAdapter("python", "py", "#", { void: "None", boolean: "bool", integer: "int", float: "float", string: "str", bytes: "bytes", any: "Any", unknown: "Any" }),
  rust: makeAdapter("rust", "rs", "//", { void: "()", boolean: "bool", integer: "i64", float: "f64", string: "String", bytes: "Vec<u8>", any: "Box<dyn std::any::Any>", unknown: "Box<dyn std::any::Any>" }),
  go: makeAdapter("go", "go", "//", { void: "void", boolean: "bool", integer: "int64", float: "float64", string: "string", bytes: "[]byte", any: "any", unknown: "any" }),
  kotlin: makeAdapter("kotlin", "kt", "//", { void: "Unit", boolean: "Boolean", integer: "Long", float: "Double", string: "String", bytes: "ByteArray", any: "Any", unknown: "Any" }),
  swift: makeAdapter("swift", "swift", "//", { void: "Void", boolean: "Bool", integer: "Int64", float: "Double", string: "String", bytes: "[UInt8]", any: "Any", unknown: "Any" }),
  lua: makeAdapter("lua", "lua", "--", { void: "nil", boolean: "boolean", integer: "number", float: "number", string: "string", bytes: "string", any: "any", unknown: "any" }),
  sql: makeAdapter("sql", "sql", "--", { void: "NULL", boolean: "BOOLEAN", integer: "BIGINT", float: "DOUBLE PRECISION", string: "TEXT", bytes: "BYTEA", any: "JSON", unknown: "JSON" })
};

export function getLanguageAdapter(id: MetaLanguageId): LanguageAdapter { return adapters[id]; }
export function listLanguageAdapters(): LanguageAdapter[] { return Object.values(adapters); }
export function generateCode(program: MetaProgram, language: MetaLanguageId): string { return getLanguageAdapter(language).program(program); }

function makeAdapter(id: MetaLanguageId, extension: string, commentToken: string, primitives: Record<string, string>): LanguageAdapter {
  const type = (ref: TypeRef): string => {
    if (typeof ref === "string") return primitives[ref] ?? ref;
    const base = ref.name === "Array" ? `${collectionName(id)}<${(ref.genericArgs ?? ["any"]).map(type).join(", ")}>` : ref.name;
    return ref.nullable && !["python", "javascript", "lua", "sql"].includes(id) ? `${base}?` : base;
  };
  const parameter = (name: string, ref: TypeRef): string => id === "python" ? `${name}: ${type(ref)}` : id === "go" ? `${name} ${type(ref)}` : `${type(ref)} ${name}`;
  const fn = (fn: MetaFunction, owner?: MetaType): string => emitFunction(id, fn, type, parameter, owner);
  return { id, extension, comment: text => `${commentToken} ${text}`, type, parameter, function: fn, program: program => emitProgram(id, program, type, parameter) };
}

function collectionName(id: MetaLanguageId): string {
  if (["typescript", "javascript"].includes(id)) return "Array";
  if (id === "cpp") return "std::vector";
  if (id === "csharp") return "List";
  if (id === "java") return "List";
  if (id === "rust") return "Vec";
  if (id === "go") return "[]";
  if (id === "kotlin") return "List";
  return "Array";
}

function emitProgram(id: MetaLanguageId, program: MetaProgram, type: (t: TypeRef) => string, parameter: (n: string, t: TypeRef) => string): string {
  const lines: string[] = [];
  for (const imp of program.imports) lines.push(importLine(id, imp));
  if (lines.length) lines.push("");
  for (const global of program.globals) lines.push(globalLine(id, global, type));
  for (const model of program.types) { lines.push(emitType(id, model, type, parameter)); lines.push(""); }
  for (const fn of program.functions) { lines.push(emitFunction(id, fn, type, parameter)); lines.push(""); }
  return lines.join("\n").trimEnd() + "\n";
}

function emitType(id: MetaLanguageId, model: MetaType, type: (t: TypeRef) => string, parameter: (n: string, t: TypeRef) => string): string {
  if (model.kind === "enum") {
    if (id === "python") return `${model.name} = Enum`;
    return `${id === "cpp" ? "enum class" : "enum"} ${model.name} {\n${(model.enumValues ?? []).map(v => `  ${v}`).join(",\n")}\n}`;
  }
  const keyword = model.kind === "interface" ? (id === "cpp" ? "struct" : "interface") : model.kind === "struct" ? "struct" : "class";
  const bases = [...(model.extends ?? []), ...(model.implements ?? [])];
  const inheritance = bases.length ? ` ${id === "cpp" ? ": public " : id === "python" ? "(" : "extends "}${bases.join(id === "cpp" ? ", public " : ", ")}${id === "python" ? ")" : ""}` : "";
  const body = [...model.fields.map(f => `  ${fieldLine(id, f, type)}`), ...model.functions.map(fn => `  ${emitFunction(id, fn, type, parameter, model).replace(/^/gm, "")}`)].join("\n");
  return `${keyword} ${model.name}${inheritance} {\n${body}\n}`;
}

function fieldLine(id: MetaLanguageId, field: MetaType["fields"][number], type: (t: TypeRef) => string): string {
  if (id === "python") return `${field.name}: ${type(field.type)}`;
  if (id === "go") return `${field.name} ${type(field.type)}`;
  return `${field.visibility ?? "public"} ${type(field.type)} ${field.name};`;
}

function emitFunction(id: MetaLanguageId, fn: MetaFunction, type: (t: TypeRef) => string, parameter: (n: string, t: TypeRef) => string, _owner?: MetaType): string {
  const params = fn.parameters.map(p => parameter(p.name, p.type)).join(", ");
  const ret = type(fn.returnType);
  const prefix = fn.static ? "static " : "";
  const body = fn.body.map(s => emitStatement(id, s, type)).join("\n");
  if (id === "python") return `def ${fn.name}(${params}):\n${indent(body || "pass")}\n`;
  if (id === "rust") return `${prefix}fn ${fn.name}(${params}) -> ${ret} {\n${indent(body)}\n}`;
  if (id === "go") return `func ${fn.name}(${params}) ${ret} {\n${indent(body)}\n}`;
  if (id === "lua") return `function ${fn.name}(${fn.parameters.map(p => p.name).join(", ")})\n${indent(body)}\nend`;
  if (id === "sql") return `-- UML function ${fn.name}\n`;
  return `${prefix}${ret} ${fn.name}(${params}) {\n${indent(body)}\n}`;
}

function emitStatement(id: MetaLanguageId, statement: MetaStatement, type: (t: TypeRef) => string): string {
  switch (statement.kind) {
    case "variable": return id === "python" ? `${statement.name} = ${emitExpression(id, statement.expression)}` : `${type(statement.type ?? "any")} ${statement.name}${statement.expression ? ` = ${emitExpression(id, statement.expression)}` : ""};`;
    case "assign": return `${statement.name} = ${emitExpression(id, statement.expression)}${id === "python" || id === "lua" ? "" : ";"}`;
    case "expression": return `${emitExpression(id, statement.expression)}${id === "python" || id === "lua" ? "" : ";"}`;
    case "return": return `return${statement.expression ? ` ${emitExpression(id, statement.expression)}` : ""}${id === "python" || id === "lua" ? "" : ";"}`;
    case "throw": return `${id === "python" ? "raise" : "throw"} ${emitExpression(id, statement.expression)}${id === "python" || id === "lua" ? "" : ";"}`;
    case "if": return id === "python" ? `if ${emitExpression(id, statement.condition)}:\n${indent((statement.body ?? []).map(s => emitStatement(id, s, type)).join("\n"))}` : `if (${emitExpression(id, statement.condition)}) {\n${indent((statement.body ?? []).map(s => emitStatement(id, s, type)).join("\n"))}\n}`;
    case "while": return id === "python" ? `while ${emitExpression(id, statement.condition)}:\n${indent((statement.body ?? []).map(s => emitStatement(id, s, type)).join("\n"))}` : `while (${emitExpression(id, statement.condition)}) {\n${indent((statement.body ?? []).map(s => emitStatement(id, s, type)).join("\n"))}\n}`;
    case "block": return `{\n${indent((statement.body ?? []).map(s => emitStatement(id, s, type)).join("\n"))}\n}`;
    case "break": return "break;";
    case "continue": return "continue;";
    default: return "";
  }
}

function emitExpression(_id: MetaLanguageId, expression?: MetaExpression): string {
  if (!expression) return "undefined";
  switch (expression.kind) {
    case "literal": return typeof expression.value === "string" ? JSON.stringify(expression.value) : expression.value === undefined ? "undefined" : JSON.stringify(expression.value);
    case "variable": return expression.name ?? "undefined";
    case "binary": return `(${emitExpression(_id, expression.left)} ${expression.operator} ${emitExpression(_id, expression.right)})`;
    case "unary": return `${expression.operator ?? "!"}${emitExpression(_id, expression.operand)}`;
    case "call": return `${expression.name ?? "call"}(${(expression.arguments ?? []).map(a => emitExpression(_id, a)).join(", ")})`;
    case "member": return `${emitExpression(_id, expression.target)}.${expression.name ?? "member"}`;
    case "array": return `[${(expression.elements ?? []).map(a => emitExpression(_id, a)).join(", ")}]`;
    case "object": return `{ ${(Object.entries(expression.members ?? {})).map(([k, v]) => `${k}: ${emitExpression(_id, v)}`).join(", ")} }`;
  }
}

function globalLine(id: MetaLanguageId, field: MetaProgram["globals"][number], type: (t: TypeRef) => string): string { return id === "python" ? `${field.name}: ${type(field.type)}` : `${type(field.type)} ${field.name};`; }
function importLine(id: MetaLanguageId, value: string): string {
  if (id === "python") return `import ${value}`;
  if (id === "cpp") return `#include <${value}>`;
  if (id === "go") return `import "${value}"`;
  if (id === "rust") return `use ${value};`;
  if (id === "csharp") return `using ${value};`;
  if (id === "java" || id === "kotlin") return `import ${value}`;
  if (id === "swift") return `import ${value}`;
  return `import ${value};`;
}
function indent(value: string): string { return value.split("\n").map(line => `  ${line}`).join("\n"); }
