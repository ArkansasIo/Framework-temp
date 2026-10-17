import test from "node:test";
import assert from "node:assert/strict";
import { COMMANDS, commandsForMenu } from "../src/index.js";

test("command registry contains the primary application menus", () => {
  for (const menu of ["File", "Edit", "View", "Project", "Tools", "AI", "Build", "Debug", "Git", "Window", "Help"]) {
    assert.ok(commandsForMenu(menu).length > 0, `missing commands for ${menu}`);
  }
});

test("command identifiers are unique", () => {
  const ids = COMMANDS.map((command) => command.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("AI commands are exposed", () => {
  const ai = commandsForMenu("AI");
  assert.ok(ai.some((command) => command.id === "ai.assistant"));
  assert.ok(ai.some((command) => command.id === "ai.generate"));
  assert.ok(ai.some((command) => command.id === "ai.security"));
});
