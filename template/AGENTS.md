# __NAME__（__ID__）主题约定（给 AI 编码工具和自己看）

这是一个 Vibebooth 门户的主题，遵循主题规范 `platform: 1`：https://github.com/Beane-Big/vibebooth/blob/main/docs/theme-spec.md 。不符合规范时平台安装时会直接报错。下面是本主题自己的约定。

- 主题 id 是 `__ID__`：选用后门户顶层有 class `skin-theme theme-__ID__`，主题文件在 `/api/platform/themes/__ID__/` 下。装到平台以后就不要再改 id。
- 入口是 `src/theme.tsx`，加载时调用一次 `registerTheme(...)`。能写的内容和类型都在 `src/vibebooth.d.ts`，那是门户给主题的接口，不要改它，也不要用里面没写的东西。
- 和门户打交道只经过 `src/platform.ts`：共享组件用它导出的 `antd`，主题包里的图片、字体用 `asset("文件名")` 算网址，不要直接读 `window.vibebooth`。
- 外观优先用参数改，不够时再写样式：
  - 颜色：`tokens` 的门户颜色参数（主色、页面底色、卡片底色、边框、阴影），深浅色各一份。
  - 表单、按钮、卡片、文字：`antd.token`（全局字号、圆角、控件高度）和 `antd.components`（按组件调）。
  - 页面背景：`background`，CSS background 写法。
  - 玻璃效果：`glass`，卡片、顶栏、弹出层半透明并模糊背景。
- 样式表 `src/theme.css` 只在选用这个主题时加载。每条规则都以 `.theme-__ID__` 开头，或者只用在主题自己的 class 上（比如首页的 `.glass-home`），不要写会影响其他主题的全局规则。门户里能改的元素只有 `.topbar`（顶栏）、`.brand`（平台名称）、`.app-tabbar`（标签栏）、`.content`（内容区），其他 class 门户随时会改。
- 颜色用门户的 CSS 变量（`--accent`、`--text`、`--muted`（次要文字）、`--surface`（卡片底色）、`--bg`、`--border`、`--shadow`、`--radius`……，见规范），深浅色切换时自动跟着变；少写死颜色。
- 首页组件 `Home` 只用 `HomeProps` 里给的数据。应用的链接原样展开 `{...app.link}` 到 `<a>` 上，不要自己拼网址或另写点击跳转；不可用的应用（`healthy` 为 false）要看得出来。
- React 和共享的 Ant Design 组件来自门户，不打进主题：构建时 `react`、`antd` 都指向门户的那一份。所以 `antd` 里只有 `src/vibebooth.d.ts` 的 `SharedAntd` 列出的组件，别的组件 import 进来是 undefined；需要时用共享组件拼，或者自己写。图标从 `@ant-design/icons` import，会打进主题。
- 不加载远程脚本、样式或字体，也不请求平台以外的网址：门户里所有人都会运行这个主题。字体和图片放进 `public/assets/`。
- 主题只改门户和它自带的页面（首页、用户、设置）。模块的页面在 iframe 里，主题改不到，不要尝试。
- 改完用 `npm run dev` 预览：浅色、深色各看一遍，再把浏览器窗口拉到手机宽度（375px）看一遍。预览页的“组件效果”一栏是门户里常见的表单、文字和卡片，改 `antd` 参数后在那里检查。
- 发布新版本前把 `theme.yaml` 的 `version` 改大，再运行 `npm run pack`。`theme.yaml` 里不要写 `script`、`style`，打包时按构建结果补上。
