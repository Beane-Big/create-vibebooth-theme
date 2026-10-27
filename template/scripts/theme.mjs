#!/usr/bin/env node
// Vibebooth 主题命令：截预览图、打包、装到本机平台。
//
//   node scripts/theme.mjs screenshot  打开预览页截一张图存成 preview.png，作为主题应用里的截图（要本机装着 Chrome 或 Edge）
//   node scripts/theme.mjs pack        先截预览图，再构建并生成 dist/<id>-<版本>.zip，上传到平台的“主题”应用
//   node scripts/theme.mjs install     打包并装到本机平台（要 Docker 和本机平台）
//
// 主题包的规则由平台安装器在安装时检查，这里只按规范把文件放好。
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { deflateRawSync } from "node:zlib";

const root = resolve(import.meta.dirname, "..");
const built = join(root, "dist", "theme");
// 平台本体的 Compose 项目名，用来找到本机平台的安装器容器。
const platformProject = "home-platform";
const isWindows = process.platform === "win32";

function die(msg) {
  console.error("错误: " + msg);
  process.exit(1);
}

function run(cmd, args, opts = {}) {
  // Windows 上的 npm 是 npm.cmd，要经过 shell 才能运行。
  const res = spawnSync(cmd, args, { cwd: root, stdio: "inherit", shell: isWindows && cmd === "npm", ...opts });
  if (res.error) die(`${cmd} 无法运行：${res.error.message}`);
  if (res.status !== 0) die(`${cmd} ${args[0]} 失败`);
}

function output(cmd, args) {
  const res = spawnSync(cmd, args, { cwd: root, encoding: "utf8" });
  return res.status === 0 ? res.stdout.trim() : "";
}

function manifest() {
  const text = readFileSync(join(root, "theme.yaml"), "utf8");
  const field = (name) => text.match(new RegExp(`^${name}:\\s*"?([^"\\s#]+)`, "m"))?.[1];
  const id = field("id"), version = field("version"), preview = field("preview");
  if (!id || !version) die("theme.yaml 里缺少 id 或 version");
  if (/^(script|style):/m.test(text)) die("theme.yaml 里不用写 script 和 style，打包时会按构建结果补上");
  return { text, id, version, preview };
}

// files 列出构建结果里的文件（相对 dist/theme/），跳过 . 开头的文件，比如 public/assets/.gitkeep。
function files(dir, prefix = "") {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name.startsWith(".")) return [];
    const rel = prefix + e.name;
    return e.isDirectory() ? files(join(dir, e.name), rel + "/") : [rel];
  });
}

// screenshot 用 Vite 起预览页，用本机的 Chrome（没有时用 Edge）以 1280×800 的浅色截一张图，存成 preview.png 并写进 theme.yaml。
// 打包时也会先截一次（required 为 false）：找不到浏览器时只提示，沿用现有的截图。
async function screenshot(required = true) {
  const { text } = manifest();
  if (!existsSync(join(root, "node_modules"))) run("npm", ["install", "--no-audit", "--no-fund"]);
  const { createServer } = await import("vite");
  // Vite 的开发服务器会把 NODE_ENV 设成 development，打包时接着运行的构建会继承它，打出开发版的 React 代码；截完图要还原。
  const nodeEnv = process.env.NODE_ENV;
  const { chromium } = await import("playwright-core");
  const server = await createServer({ root, logLevel: "error", server: { port: 0 } });
  await server.listen();
  let browser;
  try {
    // 最后试 Playwright 自己下载的浏览器（装过 Playwright 的电脑上有）。
    for (const options of [{ channel: "chrome" }, { channel: "msedge" }, {}]) {
      browser = await chromium.launch(options).catch(() => null);
      if (browser) break;
    }
    if (!browser) {
      const hint = "没有找到 Chrome 或 Edge，装一个再运行；也可以自己截一张图存成 preview.png，写进 theme.yaml 的 preview";
      if (required) die(hint);
      console.log(`提示：${hint}。这次沿用现有的截图`);
      return;
    }
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, colorScheme: "light" });
    await page.goto(server.resolvedUrls.local[0]);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(root, "preview.png") });
  } finally {
    await browser?.close();
    await server.close();
    if (nodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = nodeEnv;
  }
  const yaml = /^preview:/m.test(text) ? text.replace(/^preview:.*$/m, "preview: preview.png     # 主题应用里的截图，npm run pack 时自动截") : text.trimEnd() + "\npreview: preview.png\n";
  writeFileSync(join(root, "theme.yaml"), yaml);
  console.log("已生成 preview.png，写进了 theme.yaml");
}

async function pack() {
  if (!existsSync(join(root, "node_modules"))) run("npm", ["install", "--no-audit", "--no-fund"]);
  console.log("截预览图…");
  await screenshot(false);
  const { text, id, version, preview } = manifest();
  console.log(`构建主题 ${id} ${version}…`);
  run("npm", ["run", "build"]);
  const list = files(built);
  if (!list.includes("theme.js")) die("构建结果里没有 theme.js");
  // 根目录只放清单声明的文件，其余（图片、字体）都在 assets/ 下。
  const stray = list.filter((f) => !["theme.js", "theme.css"].includes(f) && !f.startsWith("assets/"));
  if (stray.length) die(`构建结果里有放不进主题包的文件：${stray.join("、")}。图片和字体放进 public/assets/`);

  const style = list.includes("theme.css");
  const yaml = text.trimEnd() + "\nscript: theme.js\n" + (style ? "style: theme.css\n" : "");
  const entries = [
    { name: "theme.yaml", data: Buffer.from(yaml) },
    ...list.map((f) => ({ name: f, data: readFileSync(join(built, f)) })),
  ];
  if (preview) {
    if (!existsSync(join(root, preview))) die(`theme.yaml 里写了预览图 ${preview}，但文件不存在`);
    entries.push({ name: preview, data: readFileSync(join(root, preview)) });
    if (preview.endsWith(".svg")) console.log("提示：截图还是示意图，装好 Chrome 或 Edge 后再打包会换成真实的截图");
  }
  const out = `dist/${id}-${version}.zip`;
  writeFileSync(join(root, out), zip(entries));
  console.log(`已生成 ${out}（${entries.length} 个文件），上传到平台的“主题”应用安装`);
  return out;
}

async function install() {
  const out = await pack();
  const container = output("docker", ["ps", "-q", "--filter", `label=com.docker.compose.project=${platformProject}`,
    "--filter", "label=com.docker.compose.service=installer"]);
  if (!container) die("本机平台没有在运行，请先在平台仓库里运行 docker compose up -d");
  run("docker", ["cp", join(root, out), `${container}:/tmp/theme.zip`], { stdio: "ignore" });
  // 主题带脚本，本机安装时直接确认，等于在门户上点了“确认并安装”。
  run("docker", ["exec", container, "installer", "install-theme", "/tmp/theme.zip", "--allow-script"]);
}

// zip 用 Node 自带的 zlib 写一个普通的 zip 文件，不需要额外的工具。
function zip(entries) {
  const local = [];
  const central = [];
  let offset = 0;
  for (const { name, data } of entries) {
    const packed = deflateRawSync(data);
    const nameBuf = Buffer.from(name, "utf8");
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4); // 解压需要的版本
    header.writeUInt16LE(0x0800, 6); // 文件名是 UTF-8
    header.writeUInt16LE(8, 8); // deflate
    header.writeUInt32LE(0x00210000, 10); // 修改时间固定为 1980-01-01，同样的内容打出同样的包
    header.writeUInt32LE(crc32(data), 14);
    header.writeUInt32LE(packed.length, 18);
    header.writeUInt32LE(data.length, 22);
    header.writeUInt16LE(nameBuf.length, 26);
    local.push(header, nameBuf, packed);
    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0);
    entry.writeUInt16LE(0x0314, 4);
    header.copy(entry, 6, 4, 30);
    entry.writeUInt32LE((0o100644 << 16) >>> 0, 38);
    entry.writeUInt32LE(offset, 42);
    central.push(entry, nameBuf);
    offset += header.length + nameBuf.length + packed.length;
  }
  const centralSize = central.reduce((n, b) => n + b.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, ...central, end]);
}

let crcTable;
function crc32(buf) {
  crcTable ??= Array.from({ length: 256 }, (_, n) => {
    for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
    return n >>> 0;
  });
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const commands = { screenshot, pack, install };
const cmd = commands[process.argv[2]];
if (!cmd) die("用法: node scripts/theme.mjs screenshot | pack | install");
await cmd();
