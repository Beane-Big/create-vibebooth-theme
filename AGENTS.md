# 仓库约定（给 AI 编码工具和自己看）

- 这里是 Vibebooth 门户主题的脚手架。生成的主题必须符合平台仓库 `docs/theme-spec.md` 的规范；改模板后运行 `VB_E2E=1 npm test`，确认能打包并装到本机平台。
- 主题包的校验逻辑在平台的安装器里，模板里的 `scripts/theme.mjs` 只按规范把文件放好，不要在这里重复实现校验规则。
- `template/src/vibebooth.d.ts` 是门户给主题的接口，和平台 `portal/src/themeHost.tsx`、`portal/src/theme.tsx` 保持一致：平台改了接口要同步改它，`template/src/preview/portal.tsx` 也要跟着门户的 `themeConfig` 改。
- 改了用法或生成的文件，同步更新 `README.md`。
