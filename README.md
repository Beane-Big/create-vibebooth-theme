# create-vibebooth-theme

生成一个 [Vibebooth](https://github.com/Beane-Big/vibebooth) 门户主题的骨架。主题能换门户的颜色、背景、表单和卡片的样式、玻璃效果，以及首页的应用列表；模块的页面不受影响。规范见平台的[主题规范](https://github.com/Beane-Big/vibebooth/blob/main/docs/theme-spec.md)。

要做应用（模块），用 [create-vibebooth](https://github.com/Beane-Big/create-vibebooth)。

## 用法

```bash
npx github:Beane-Big/create-vibebooth-theme aurora
```

`aurora` 是主题 id，不写会提示输入。接下来会问显示名称和一句话说明。生成的目录是 `vibebooth-theme-<id>/`，并自动 `git init`、安装依赖。生成的主题是一个能直接用的玻璃效果示例，带本机预览页。

前提：Node.js 20.11 以上。

| 命令 | 做什么 |
| --- | --- |
| `npm run screenshot` | 只截图：截一张预览页的图存成 `preview.png`，主题应用里显示它（要本机装着 Chrome 或 Edge） |
| `npm run dev` | 本机预览：模拟门户的顶栏、首页和常见组件，可切换深浅色，不需要本机有平台 |
| `npm run pack` | 先截图，再构建并生成主题包 zip，上传到平台的“主题”应用；没有 Chrome 或 Edge 时沿用现有的截图 |
| `npm run install:local` | 打包并装到本机平台（要 Docker 和本机平台） |

## 生成了什么

| 文件 | 内容 |
| --- | --- |
| `theme.yaml` | 主题清单：id、名称、版本、截图 |
| `src/theme.tsx` | 主题本身：颜色参数、Ant Design 参数、背景、玻璃效果、首页组件 |
| `src/theme.css` | 主题的样式表，只在选用这个主题时加载 |
| `src/platform.ts` | 和门户打交道的地方：共享的 Ant Design 组件、`asset()`、`registerTheme()` |
| `src/vibebooth.d.ts` | 门户给主题的接口 |
| `src/preview/` | `npm run dev` 用的预览页，模仿门户，不会打进主题包 |
| `scripts/theme.mjs` | `screenshot`、`pack` 和 `install:local` 的实现 |
| `AGENTS.md` | 给 AI 编码工具看的约定：主题能改什么、不能改什么 |

## 开发脚手架本身

```bash
npm test                 # 生成一个主题，检查文件
VB_E2E=1 npm test        # 再把它装到本机平台
```

模板在 `template/`，里面的 `__ID__`、`__NAME__`、`__DESCRIPTION__` 由 `lib/generate.mjs` 替换；`_gitignore` 会改名为 `.gitignore`。
