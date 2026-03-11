import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { execSync, execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

// Skip entire suite if tmux is not available
let tmuxAvailable = false;
try {
  execSync("tmux -V", { stdio: "ignore" });
  tmuxAvailable = true;
} catch {}

describe("integration", { skip: !tmuxAvailable && "tmux not available" }, () => {
  let tmpDir;
  const session = "tmux-ide-test-integration";
  const cli = join(import.meta.dirname, "..", "bin", "cli.js");

  function run(args) {
    return execFileSync("node", [cli, ...args], { cwd: tmpDir, encoding: "utf-8" });
  }

  function runJSON(args) {
    return JSON.parse(run([...args, "--json"]));
  }

  function killSession() {
    try {
      execSync(`tmux kill-session -t "${session}"`, { stdio: "ignore" });
    } catch {}
  }

  function createSession() {
    execSync(`tmux new-session -d -s "${session}" -x 80 -y 24`, { stdio: "ignore" });
  }

  before(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "tmux-ide-test-"));
    writeFileSync(
      join(tmpDir, "ide.yml"),
      `name: ${session}\nrows:\n  - panes:\n      - title: Shell\n`
    );
  });

  after(() => {
    killSession();
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("status --json reports not running when no session exists", () => {
    killSession();
    const result = runJSON(["status"]);
    assert.strictEqual(result.running, false);
  });

  it("status --json reports running after session is created", () => {
    killSession();
    createSession();
    const result = runJSON(["status"]);
    assert.strictEqual(result.running, true);
    killSession();
  });

  it("stop --json kills a running session", () => {
    createSession();
    run(["stop"]);
    // Verify it's gone
    const result = runJSON(["status"]);
    assert.strictEqual(result.running, false);
  });

  it("validate --json reports valid for our test config", () => {
    const result = runJSON(["validate"]);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
  });

  it("doctor --json passes checks", () => {
    const result = runJSON(["doctor"]);
    assert.strictEqual(result.ok, true);
  });

  it("config --json dumps config", () => {
    const result = runJSON(["config"]);
    assert.strictEqual(result.name, session);
    assert.ok(Array.isArray(result.rows));
  });

  it("ls --json returns sessions list", () => {
    const result = runJSON(["ls"]);
    assert.ok(Array.isArray(result.sessions));
  });
});
