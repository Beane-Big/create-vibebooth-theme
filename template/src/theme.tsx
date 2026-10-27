// __NAME__：门户的主题。这里是一个能直接用的示例：渐变背景、玻璃效果的卡片和顶栏、
// 调过圆角和字重的表单组件，以及一个玻璃方块的首页。按需要改，不需要的部分整段删掉就会用平台默认的样子。
import "./theme.css";
import { registerTheme } from "./platform";
import type { HomeProps, ThemeDefinition } from "./vibebooth";

// Ant Design 的参数，深浅色共用一份。可以调的组件和参数见 https://ant.design/docs/react/customize-theme-cn 。
const antd: NonNullable<ThemeDefinition["antd"]>["light"] = {
  token: { borderRadius: 10, borderRadiusSM: 6, borderRadiusLG: 18, fontSize: 14 },
  components: {
    Button: { fontWeight: 600, controlHeight: 36 },
    Input: { controlHeight: 36 },
    Select: { controlHeight: 36 },
    Card: { headerFontSize: 17 },
    Typography: { titleMarginBottom: 8 },
  },
};

registerTheme({
  // 门户的颜色参数，只写要改的。
  tokens: {
    light: { colorPrimary: "#6b5cff", colorBgLayout: "#eef0ff" },
    dark: { colorPrimary: "#a196ff", colorBgLayout: "#14142b" },
  },
  antd: { light: antd, dark: antd },
  background: {
    light: "radial-gradient(60% 50% at 15% 10%, #c9c3ff 0%, transparent 70%), radial-gradient(50% 50% at 90% 20%, #ffc6dc 0%, transparent 70%), radial-gradient(60% 60% at 60% 100%, #b8ecff 0%, transparent 70%), #f4f3ff",
    dark: "radial-gradient(60% 50% at 15% 10%, #3b2f8f 0%, transparent 70%), radial-gradient(50% 50% at 90% 20%, #6b2450 0%, transparent 70%), radial-gradient(60% 60% at 60% 100%, #0f4a63 0%, transparent 70%), #101024",
  },
  glass: { blur: 24, opacity: 0.55 },
  Home,
});

// Home 替换门户首页的应用列表：玻璃方块，图标在上，名称在下。
function Home({ apps }: HomeProps) {
  return (
    <div className="glass-home">
      {apps.map((app) => (
        <a key={app.id} className={app.healthy ? "glass-app" : "glass-app unhealthy"} title={app.description} {...app.link}>
          <span className="glass-icon">
            {app.icon ? <img src={app.icon} alt="" /> : (app.glyph ?? app.name.slice(0, 1))}
          </span>
          <span className="glass-name">{app.healthy ? app.name : `${app.name}（不可用）`}</span>
        </a>
      ))}
    </div>
  );
}
