// 本地预览用的门户外观：默认颜色参数和套用主题的规则抄自平台仓库 portal/src/theme.tsx，平台改了要跟着改。
// 预览只是近似效果，最终以装到本机平台（npm run install:local）后看到的为准。
import { theme as antTheme, type ThemeConfig } from "antd";
import type { Palette, ThemeOverrides } from "../vibebooth";

const palette: { light: Palette; dark: Palette } = {
  light: {
    colorPrimary: "#0f6cbd", colorError: "#c50f1f", colorSuccess: "#107c10", colorWarning: "#bc4b09",
    colorText: "#242424", colorTextSecondary: "#616161", colorBgLayout: "#f5f5f5", colorBgContainer: "#ffffff",
    colorBorder: "#d1d1d1", colorBorderSecondary: "#e0e0e0",
    cardShadow: "0 0 2px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.14)",
    popupShadow: "0 0 2px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.14)",
    floatShadow: "0 10px 30px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)",
    inputBottom: "#616161",
  },
  dark: {
    colorPrimary: "#479ef5", colorError: "#dc626d", colorSuccess: "#54b054", colorWarning: "#fa9e5e",
    colorText: "#ffffff", colorTextSecondary: "#adadad", colorBgLayout: "#1f1f1f", colorBgContainer: "#292929",
    colorBorder: "#666666", colorBorderSecondary: "#3d3d3d",
    cardShadow: "0 0 2px rgba(0,0,0,0.24), 0 2px 4px rgba(0,0,0,0.28)",
    popupShadow: "0 0 2px rgba(0,0,0,0.24), 0 8px 16px rgba(0,0,0,0.28)",
    floatShadow: "0 10px 30px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)",
    inputBottom: "#d6d6d6",
  },
};

const pick = <T,>(v: { light?: T; dark?: T } | undefined, dark: boolean) => (dark ? v?.dark : v?.light);

function translucent(color: string, alpha: number) {
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color)?.[1];
  if (!hex) return color;
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function glassOf(o?: ThemeOverrides) {
  if (!o?.glass) return null;
  const g = o.glass === true ? {} : o.glass;
  return { blur: g.blur ?? 20, opacity: g.opacity ?? 0.6 };
}

export function paletteFor(dark: boolean, o?: ThemeOverrides): Palette {
  return { ...(dark ? palette.dark : palette.light), ...pick(o?.tokens, dark) };
}

export function backgroundFor(dark: boolean, o?: ThemeOverrides) {
  return pick(o?.background, dark) ?? "";
}

export function themeConfig(dark: boolean, o?: ThemeOverrides): ThemeConfig {
  const { cardShadow, popupShadow, floatShadow: _f, inputBottom: _i, ...colors } = paletteFor(dark, o);
  const base: ThemeConfig = {
    algorithm: dark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    token: {
      ...colors,
      borderRadius: 4,
      borderRadiusSM: 2,
      borderRadiusLG: 8,
      fontSize: 14,
      fontFamily: '"Segoe UI Variable", "Segoe UI", -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
      boxShadowSecondary: popupShadow,
      boxShadowTertiary: cardShadow,
      wireframe: false,
    },
    components: {
      Layout: { headerBg: colors.colorBgContainer, headerPadding: "0 16px", headerHeight: 56 },
      Button: { fontWeight: 600, primaryShadow: "none", defaultShadow: "none", dangerShadow: "none" },
      Card: { headerFontSize: 16 },
      Tag: { defaultBg: "transparent" },
    },
  };
  const glass = glassOf(o);
  if (glass) {
    const surface = translucent(colors.colorBgContainer, glass.opacity);
    const elevated = translucent(dark ? "#2b2b2b" : "#ffffff", Math.min(1, glass.opacity + 0.2));
    base.token = { ...base.token, colorBgContainer: surface, colorBgElevated: elevated };
    base.components = { ...base.components, Layout: { ...base.components!.Layout, headerBg: surface } };
  }
  const extra = pick(o?.antd, dark);
  if (!extra) return base;
  const components: Record<string, object> = { ...base.components };
  for (const [name, value] of Object.entries(extra.components ?? {})) components[name] = { ...components[name], ...value };
  return { ...base, token: { ...base.token, ...extra.token }, components };
}
