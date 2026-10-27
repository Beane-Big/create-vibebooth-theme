#!/usr/bin/env node
// 生成一个 Vibebooth 门户主题：npx github:Beane-Big/create-vibebooth-theme <主题 id>
// 主题包的规则由平台安装器在安装时检查，规范见平台仓库 docs/theme-spec.md。
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { createInterface } from "node:readline";
import { generate, validate } from "./lib/generate.mjs";

// 自己排队读行，而不用 rl.question：输入是管道时，提问之前就到达的行不会丢。
const rl = createInterface({ input: process.stdin });
const lines = [];
let waiting = null;
let closed = false;
rl.on("line", (line) => (waiting ? (waiting(line), (waiting = null)) : lines.push(line)));
rl.on("close", () => {
  closed = true;
  waiting?.(null);
});

async function ask(question, fallback = "") {
  process.stdout.write(fallback ? `${question}（默认 ${fallback}）：` : `${question}：`);
  const line = lines.length ? lines.shift() : closed ? null : await new Promise((r) => (waiting = r));
  if (line === null) throw new Error("输入已结束");
  if (!process.stdin.isTTY) process.stdout.write(line + "\n");
  return line.trim() || fallback;
}

// step 在生成的目录里运行一条命令。失败不影响已经生成的文件，只提示怎么补做。
function step(cwd, label, cmd, args) {
  console.log(`\n${label}…`);
  // Windows 上的 npm 是 npm.cmd，要经过 shell 才能运行。
  const res = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: process.platform === "win32" && cmd === "npm" });
  if (res.status !== 0) console.log(`（${label}没有成功，稍后可以在这个目录里重新运行 ${cmd} ${args.join(" ")}）`);
  return res.status === 0;
}

async function main() {
  console.log("创建一个 Vibebooth 主题\n");
  let id = process.argv[2] ?? "";
  while (validate({ id, name: "x" })) {
    if (id) console.log(validate({ id, name: "x" }));
    id = await ask("主题 id（小写字母开头，例如 aurora）");
  }
  const name = await ask("显示名称", id);
  const description = await ask("一句话说明", "");
  rl.close();

  const dir = resolve(process.cwd(), `vibebooth-theme-${id}`);
  generate(dir, { id, name, description });
  console.log(`\n已生成 ${dir}`);
  step(dir, "初始化 git 仓库", "git", ["init", "-q", "-b", "main"]);
  step(dir, "安装依赖", "npm", ["install", "--no-audit", "--no-fund"]);

  console.log(`
完成。接下来：
  cd vibebooth-theme-${id}
  npm run dev             本机预览，可切换深浅色
  npm run pack            截预览图并生成主题包，上传到平台的“主题”应用
  npm run install:local   装到本机平台，然后打开 http://localhost:8080（要 Docker 和本机平台）

开发规范见 AGENTS.md；用 AI 编码工具时，让它先读这个文件。`);
}

main().catch((err) => {
  rl.close();
  console.error("错误: " + err.message);
  process.exit(1);
});
