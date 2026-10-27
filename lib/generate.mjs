// 把模板复制成一个主题目录。只做文件操作，不联网，方便测试。
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

export const template = resolve(import.meta.dirname, "..", "template");

// 和平台 packages/manifest 的 ParseTheme 保持一致：规则和模块 id 一样，内置皮肤的名字不能用。
const idPattern = /^[a-z][a-z0-9-]{1,30}$/;
const reservedIDs = new Set(["classic", "tiles"]);
// 名称和说明会原样写进 YAML、HTML 和代码模板，这些字符会破坏其中某一种。
const unsafe = /[<>{}$`"\\\n]/;

// validate 返回选项里的错误，没有错误时返回空字符串。
export function validate({ id, name }) {
  if (!idPattern.test(id) || reservedIDs.has(id)) {
    return "主题 id 只能是小写字母开头的小写字母、数字和连字符（2 到 31 个字符），且不能是 " + [...reservedIDs].join("、");
  }
  if (!name?.trim()) return "名称不能为空";
  if (unsafe.test(name)) return "名称里不能有 < > { } $ ` 引号、反斜杠或换行";
  return "";
}

// generate 在 dir 下生成主题，dir 必须不存在或为空。
export function generate(dir, opts) {
  const err = validate(opts);
  if (err) throw new Error(err);
  if (existsSync(dir) && readdirSync(dir).length > 0) throw new Error(`${dir} 已经存在且不为空`);
  const name = opts.name.trim();
  const description = (opts.description ?? "").replace(new RegExp(unsafe, "g"), " ").trim() || `${name}，一个 Vibebooth 主题`;
  mkdirSync(dir, { recursive: true });
  cpSync(template, dir, { recursive: true });
  fill(dir, { __ID__: opts.id, __NAME__: name, __DESCRIPTION__: description });
}

// fill 替换所有文件里的占位符，并把 _gitignore 改名为 .gitignore（npm 发布时会丢掉 .gitignore）。
function fill(dir, vars) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      fill(path, vars);
      continue;
    }
    let text = readFileSync(path, "utf8");
    for (const [k, v] of Object.entries(vars)) text = text.replaceAll(k, v);
    writeFileSync(path, text);
    if (entry === "_gitignore") renameSync(path, join(dir, ".gitignore"));
  }
}
