// 门户提供给主题的接口，主题规范 platform: 1。和平台仓库 portal/src/themeHost.tsx、portal/src/theme.tsx 保持一致，
// 规范见 https://github.com/Beane-Big/vibebooth/blob/main/docs/theme-spec.md 。这个文件由脚手架生成，不要改。
import type * as React from "react";
import type * as jsxRuntime from "react/jsx-runtime";
import type * as Antd from "antd";
import type { ThemeConfig } from "antd";

// 门户的颜色参数，默认值见门户 theme.tsx 的 palette（Fluent 2 风格）。
export type Palette = {
  colorPrimary: string;
  colorError: string;
  colorSuccess: string;
  colorWarning: string;
  colorText: string;
  colorTextSecondary: string;
  // 页面底色和卡片底色。
  colorBgLayout: string;
  colorBgContainer: string;
  colorBorder: string;
  colorBorderSecondary: string;
  // 卡片、弹出层、彩色方块皮肤的悬浮顶栏的阴影（CSS box-shadow 写法）。
  cardShadow: string;
  popupShadow: string;
  floatShadow: string;
  // 输入框的底边颜色。
  inputBottom: string;
};

// 深浅色各一份，只写一边也行。
export type PerMode<T> = { light?: T; dark?: T };

export type ThemeOverrides = {
  // 门户的颜色参数，只写要改的。
  tokens?: PerMode<Partial<Palette>>;
  // Ant Design 的参数：token 是全局的（字号、圆角、字体……），components 按组件调（Input、Select、Button、Card、Typography……）。
  antd?: PerMode<Pick<ThemeConfig, "token" | "components">>;
  // 页面背景，CSS background 的写法：颜色、渐变或图片。图片用 asset() 算出网址。
  background?: PerMode<string>;
  // 玻璃效果：卡片、顶栏、弹出层半透明并模糊后面的背景。blur 是模糊半径（px，默认 20），opacity 是底色不透明度（默认 0.6）。
  glass?: boolean | { blur?: number; opacity?: number };
};

// 首页上的一个应用，平台自带的应用（用户、设置）和模块统一成一种。
export type ThemeApp = {
  id: string;
  name: string;
  description: string;
  url: string;
  // 模块的图片图标网址（满底色的方块），没有时为空。
  icon?: string;
  // 平台自带的应用的图标（Ant Design 图标元素）。
  glyph?: React.ReactNode;
  // 平台自带的应用建议的渐变底色，从左上到右下。
  tint?: [string, string];
  healthy: boolean;
  builtin: boolean;
  // 原样放到 <a> 上：普通点击在门户里以标签页打开，按住 Ctrl / Cmd 或中键在浏览器新标签页打开。
  link: { href: string; onClick: (e: React.MouseEvent) => void };
};

export type HomeProps = {
  apps: ThemeApp[];
  dark: boolean;
  user: { displayName: string };
};

export type ThemeDefinition = ThemeOverrides & {
  // 替换首页的应用列表，不写就用经典皮肤的首页。
  Home?: React.ComponentType<HomeProps>;
};

// 门户共享给主题的 Ant Design 组件，只有这些；要用别的组件或图标库，打包进主题自己。
export type SharedAntd = Pick<
  typeof Antd,
  | "Alert" | "Avatar" | "Badge" | "Button" | "Card" | "Checkbox" | "Col" | "Empty" | "Flex" | "Form" | "Grid"
  | "Input" | "Row" | "Segmented" | "Select" | "Space" | "Spin" | "Tag" | "Tooltip" | "Typography" | "theme"
>;

export type Vibebooth = {
  platform: number;
  React: typeof React;
  jsxRuntime: typeof jsxRuntime;
  antd: SharedAntd;
  registerTheme: (def: ThemeDefinition) => void;
};

declare global {
  interface Window {
    vibebooth: Vibebooth;
  }
}
