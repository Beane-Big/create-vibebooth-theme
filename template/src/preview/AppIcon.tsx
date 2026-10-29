// 本地预览用的应用图标，抄自平台仓库 portal/src/components/AppIcon.tsx，平台改了要跟着改。
import { createContext, useContext, type CSSProperties } from "react";
import type { ThemeApp } from "../vibebooth";

// 当前主题有没有给图标指定颜色（icons），由预览页按深浅色提供。
export const ThemedIcons = createContext(false);

export default function AppIcon({ app }: { app: ThemeApp }) {
  const themed = useContext(ThemedIcons);
  const symbol = app.glyph ?? app.name.slice(0, 1);
  if (!themed || (app.icon && !app.mask)) {
    return app.icon ? <img className="app-icon" src={app.icon} alt="" /> : <span className="app-icon app-icon-plain">{symbol}</span>;
  }
  const own = app.tint ? `linear-gradient(150deg, ${app.tint[0]}, ${app.tint[1]} 75%)` : (app.color ?? "var(--accent)");
  return (
    <span className="app-icon app-icon-themed" style={{ "--app-color": own } as CSSProperties}>
      {app.mask ? (
        <span className="app-icon-mask" style={{ maskImage: `url("${app.mask}")`, WebkitMaskImage: `url("${app.mask}")` }} />
      ) : (
        symbol
      )}
    </span>
  );
}
