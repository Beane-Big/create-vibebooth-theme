import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// npm run dev 打开 index.html 预览主题；npm run build 只把 src/theme.tsx 构建成门户加载的 dist/theme/theme.js 和 theme.css。
// 主题和门户共用 React 和一部分 Ant Design：构建时把它们指向门户放在 window.vibebooth 上的那一份，不打进主题里。
export default defineConfig({
  plugins: [react()],
  // 样式表里引用的图片按相对路径输出，装到平台后从主题自己的网址加载。
  base: "./",
  build: {
    outDir: "dist/theme",
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: "src/theme.tsx",
      formats: ["iife"],
      name: "vibeboothTheme",
      fileName: () => "theme.js",
      cssFileName: "theme",
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime", "antd"],
      output: {
        globals: { react: "vibebooth.React", "react/jsx-runtime": "vibebooth.jsxRuntime", antd: "vibebooth.antd" },
      },
    },
  },
});
