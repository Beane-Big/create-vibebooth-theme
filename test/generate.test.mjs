// 运行：npm test。生成一个主题，检查文件和占位符。
// 设置 VB_E2E=1 时，再运行 npm install 和 npm run install:local，装到本机正在运行的平台上（需要 Docker 和平台）。
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { generate, validate } from "../lib/generate.mjs";

function files(dir) {
  return readdirSync(dir).flatMap((e) => {
    const p = join(dir, e);
    return statSync(p).isDirectory() ? files(p) : [p];
  });
}

test("validate 拒绝不合规的选项", () => {
  assert.equal(validate({ id: "aurora", name: "极光" }), "");
  for (const bad of [{ id: "tiles" }, { id: "classic" }, { id: "Aurora" }, { id: "a" }, { name: " " }, { name: "极<光" }]) {
    assert.notEqual(validate({ id: "aurora", name: "极光", ...bad }), "", JSON.stringify(bad));
  }
});

test("生成主题", () => {
  const root = mkdtempSync(join(tmpdir(), "vb-theme-test-"));
  try {
    const dir = join(root, "t-theme");
    generate(dir, { id: "t-theme", name: "测试主题", description: "测试用的主题" });
    for (const f of files(dir)) assert.doesNotMatch(readFileSync(f, "utf8"), /__[A-Z_]+__/, `${f} 里还有没替换的占位符`);
    assert.ok(existsSync(join(dir, ".gitignore")));
    const manifest = readFileSync(join(dir, "theme.yaml"), "utf8");
    assert.match(manifest, /^id: t-theme$/m);
    assert.match(manifest, /^name: "测试主题"$/m);
    assert.doesNotMatch(manifest, /^(script|style):/m);
    assert.match(readFileSync(join(dir, "src", "theme.css"), "utf8"), /\.theme-t-theme /);
    assert.throws(() => generate(dir, { id: "t-theme", name: "测试主题" }), /不为空/);

    if (process.env.VB_E2E) {
      const res = spawnSync("npm", ["run", "install:local"], { cwd: dir, stdio: "inherit" });
      assert.equal(res.status, 0, "主题安装失败");
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
