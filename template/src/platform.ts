// 主题和门户打交道只经过这个文件：拿共享的 Ant Design 组件、注册主题、算主题包里文件的网址。
import type { ThemeDefinition } from "./vibebooth";

const vb = window.vibebooth;

// 门户共享的 Ant Design 组件，用法：const { Button, Card } = antd。没列出的组件不能用。
export const antd = vb.antd;

// 门户的应用图标组件，首页组件里用 <AppIcon app={app} /> 画图标，会按 registerTheme 里的 icons 上色。
export const AppIcon = vb.AppIcon;

// 主题包里的脚本加载时，当前 <script> 就是自己，从它的网址算出主题文件所在的目录；本地预览时是 public/。
const base = (document.currentScript as HTMLScriptElement | null)?.src;

// asset 返回 public/assets/ 里一个文件的网址，比如背景图 asset("bg.jpg")。打包后这些文件在主题包的 assets/ 下。
export const asset = (file: string) => (base ? new URL(`assets/${file}`, base).href : `/assets/${file}`);

export function registerTheme(def: ThemeDefinition) {
  vb.registerTheme(def);
}
