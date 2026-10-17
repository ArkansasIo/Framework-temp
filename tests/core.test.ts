import test from "node:test";
import assert from "node:assert/strict";
import { loadConfig, Lifecycle, requireNonEmptyString } from "../src/index.js";

test("loadConfig accepts valid configuration", () => {
  const result = loadConfig({
    APP_NAME: "sample",
    NODE_ENV: "test",
    PORT: "4321",
    LOG_LEVEL: "debug",
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.port, 4321);
    assert.equal(result.value.appName, "sample");
    assert.equal(result.value.environment, "test");
    assert.equal(result.value.logLevel, "debug");
  }
});

test("loadConfig applies defaults when variables are absent", () => {
  assert.deepEqual(loadConfig({}), {
    ok: true,
    value: {
      appName: "application",
      environment: "development",
      port: 3000,
      logLevel: "info",
    },
  });
});

test("loadConfig rejects ports outside the supported range", () => {
  for (const PORT of ["0", "-1", "65536", "70000"]) {
    assert.equal(loadConfig({ PORT }).ok, false, `expected PORT=${PORT} to fail`);
  }
});

test("loadConfig rejects non-decimal and malformed ports", () => {
  for (const PORT of ["", " ", "3.5", "1e3", "0x10", "+80", "80abc"]) {
    assert.equal(loadConfig({ PORT }).ok, false, `expected PORT=${JSON.stringify(PORT)} to fail`);
  }
});

test("loadConfig rejects blank or overlong application names", () => {
  assert.equal(loadConfig({ APP_NAME: "   " }).ok, false);
  assert.equal(loadConfig({ APP_NAME: "x".repeat(101) }).ok, false);
  const result = loadConfig({ APP_NAME: "  valid-app  " });
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.value.appName, "valid-app");
});

test("loadConfig rejects unsupported environment and log level", () => {
  assert.equal(loadConfig({ NODE_ENV: "staging" }).ok, false);
  assert.equal(loadConfig({ LOG_LEVEL: "trace" }).ok, false);
});

test("requireNonEmptyString trims valid values and rejects blank values", () => {
  const valid = requireNonEmptyString("  hello  ", "name");
  assert.deepEqual(valid, { ok: true, value: "hello" });
  assert.equal(requireNonEmptyString("   ", "name").ok, false);
});

test("Lifecycle enforces valid transitions", () => {
  const lifecycle = new Lifecycle();
  lifecycle.transition("starting");
  lifecycle.transition("ready");
  lifecycle.transition("stopping");
  lifecycle.transition("stopped");
  assert.equal(lifecycle.state, "stopped");
  assert.throws(() => lifecycle.transition("ready"));
});
