# __NAME__

__DESCRIPTION__

Vibebooth 门户的主题。主题能换门户的颜色、背景、表单和卡片的样式、玻璃效果，以及首页的应用列表。规范见 [主题规范](https://github.com/Beane-Big/vibebooth/blob/main/docs/theme-spec.md)。

## 命令

```bash
npm run dev             # 本机预览：示例首页和常见组件，可切换深浅色
npm run screenshot      # 只截图：截一张预览页的图存成 preview.png（要本机装着 Chrome 或 Edge）
npm run pack            # 先截图，再构建并生成 dist/__ID__-<版本>.zip
npm run install:local   # 打包并装到本机平台（要 Docker 和本机平台）
```

`npm run pack` 会先截一张预览页的图（`preview.png`），平台的“主题”应用里每个主题都显示它的截图；本机没有 Chrome 或 Edge 时沿用现有的截图。生成的 zip 上传到“主题”应用安装，要有“应用管理”权限；主题带脚本，安装时要确认。装好后每个人都能在“主题”应用里选用。

## 文件

| 文件 | 内容 |
| --- | --- |
| `theme.yaml` | 主题清单：id、名称、版本、预览图 |
| `src/theme.tsx` | 主题本身：颜色参数、Ant Design 参数、背景、玻璃效果、首页组件 |
| `src/theme.css` | 主题的样式表，只在选用这个主题时加载 |
| `src/platform.ts` | 和门户打交道的地方：共享的 Ant Design 组件、`asset()`、`registerTheme()` |
| `src/vibebooth.d.ts` | 门户给主题的接口，不要改 |
| `src/preview/` | `npm run dev` 用的预览页，模仿门户，不会打进主题包 |
| `public/assets/` | 图片、字体，打包后在主题包的 `assets/` 下，用 `asset("文件名")` 引用 |
| `preview.svg` | 示意图，第一次 `npm run pack` 后换成 `preview.png` |
| `AGENTS.md` | 给 AI 编码工具看的约定 |
