// npm run dev 的预览页：模拟门户的顶栏、首页和常用组件，切换深浅色看主题的效果。
import { registered } from "./host";
import "../theme";
import "./portal.css";
import { StrictMode, useEffect, useState, type MouseEvent } from "react";
import { createRoot } from "react-dom/client";
import { Alert, Button, Card, Checkbox, ConfigProvider, Flex, Form, Input, Segmented, Select, Space, Tag, Typography, theme } from "antd";
import { HomeOutlined, SettingOutlined, TeamOutlined } from "@ant-design/icons";
import zhCN from "antd/locale/zh_CN";
import type { ThemeApp, ThemeDefinition } from "../vibebooth";
import { backgroundFor, glassOf, paletteFor, themeConfig } from "./portal";

const def: ThemeDefinition = registered ?? {};

// 演示用的模块图标：满底色的圆角方块加白色图形，和真实模块的 icon.svg 一样。
const icon = (color: string, path: string) =>
  "data:image/svg+xml," +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="${color}"/>${path}</svg>`);

const noop = (e: MouseEvent) => e.preventDefault();
const demoApps: ThemeApp[] = [
  { id: "users", name: "用户", description: "家庭成员和他们的账号", url: "#", glyph: <TeamOutlined />, tint: ["#4fd2ff", "#0a5cff"], healthy: true, builtin: true, link: { href: "#", onClick: noop } },
  { id: "settings", name: "设置", description: "平台的系统设置和应用管理", url: "#", glyph: <SettingOutlined />, tint: ["#ff7a6b", "#9b4dff"], healthy: true, builtin: true, link: { href: "#", onClick: noop } },
  { id: "score", name: "家庭积分", description: "孩子做家务攒积分", url: "#", icon: icon("#e8912d", '<path d="M24 11l3.9 7.9 8.7 1.3-6.3 6.1 1.5 8.7L24 30.9l-7.8 4.1 1.5-8.7-6.3-6.1 8.7-1.3z" fill="#fff"/>'), healthy: true, builtin: false, link: { href: "#", onClick: noop } },
  { id: "builder", name: "模块构建器", description: "在网页上打包模块", url: "#", icon: icon("#2f6fde", '<rect x="12" y="14" width="24" height="20" rx="3" fill="none" stroke="#fff" stroke-width="3"/>'), healthy: true, builtin: false, link: { href: "#", onClick: noop } },
  { id: "ledger", name: "记账本", description: "", url: "#", healthy: true, builtin: false, link: { href: "#", onClick: noop } },
  { id: "photos", name: "家庭相册", description: "全家的照片", url: "#", icon: icon("#4caf50", '<circle cx="24" cy="24" r="8" fill="#fff"/>'), healthy: false, builtin: false, link: { href: "#", onClick: noop } },
];

function Preview() {
  const [dark, setDark] = useState(matchMedia("(prefers-color-scheme: dark)").matches);
  return (
    <ConfigProvider locale={zhCN} theme={themeConfig(dark, def)} button={{ autoInsertSpace: false }}>
      <CssVars dark={dark} />
      <div className="ant-layout skin-theme theme-__ID__" style={{ minHeight: "100vh" }}>
        <header className="topbar">
          <span className="brand">Vibebooth</span>
          <span className="app-tabbar">
            <span className="preview-tab active">
              <HomeOutlined />
            </span>
            <span className="preview-tab">家庭积分</span>
          </span>
          <Segmented
            value={dark ? "dark" : "light"}
            onChange={(v) => setDark(v === "dark")}
            options={[
              { value: "light", label: "浅色" },
              { value: "dark", label: "深色" },
            ]}
          />
        </header>
        <div className="content">
          {def.Home ? <def.Home apps={demoApps} dark={dark} user={{ displayName: "演示用户" }} /> : <Alert type="info" showIcon message="这个主题没有替换首页，门户里会显示经典皮肤的应用卡片。" />}
          <Components />
        </div>
      </div>
    </ConfigProvider>
  );
}

// 门户的“用户”“设置”等页面里常见的组件，看颜色参数和 Ant Design 参数的效果。
function Components() {
  return (
    <Flex vertical gap={16} style={{ marginTop: 32 }}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        组件效果
      </Typography.Title>
      <Card title="添加成员">
        <Form layout="vertical" style={{ maxWidth: 420 }}>
          <Form.Item label="姓名" required>
            <Input placeholder="例如 小明" />
          </Form.Item>
          <Form.Item label="角色">
            <Select defaultValue="user" options={[{ value: "user", label: "家庭成员" }, { value: "admin", label: "管理员" }]} />
          </Form.Item>
          <Form.Item>
            <Checkbox defaultChecked>可以登录门户</Checkbox>
          </Form.Item>
          <Space wrap>
            <Button type="primary">保存</Button>
            <Button>取消</Button>
            <Button danger>删除</Button>
          </Space>
        </Form>
      </Card>
      <Card title="文字和标签">
        <Flex vertical gap={8}>
          <Typography.Text strong>正文加粗</Typography.Text>
          <Typography.Text>普通正文，用来看字号、行高和颜色。</Typography.Text>
          <Typography.Text type="secondary">次要文字，比如说明和提示。</Typography.Text>
          <Space wrap>
            <Tag>0.1.0</Tag>
            <Tag color="success">可用</Tag>
            <Tag color="error">不可用</Tag>
          </Space>
          <Alert type="success" showIcon message="已保存" />
        </Flex>
      </Card>
    </Flex>
  );
}

// 和门户一样把颜色写成 CSS 变量，主题的样式表和预览页的门户样式都用它们。
function CssVars({ dark }: { dark: boolean }) {
  const { token } = theme.useToken();
  const p = paletteFor(dark, def);
  const background = backgroundFor(dark, def);
  const glass = glassOf(def);
  useEffect(() => {
    const vars: Record<string, string> = {
      "--bg": token.colorBgLayout,
      "--surface": token.colorBgContainer,
      "--text": token.colorText,
      "--muted": token.colorTextSecondary,
      "--border": token.colorBorderSecondary,
      "--accent": token.colorPrimary,
      "--danger": token.colorError,
      "--radius": `${token.borderRadiusLG}px`,
      "--shadow": token.boxShadowTertiary,
      "--input-bottom": p.inputBottom,
      "--float-shadow": p.floatShadow,
      "--page-bg": background || token.colorBgLayout,
      "--glass-blur": `${glass?.blur ?? 0}px`,
    };
    const root = document.documentElement;
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
    root.style.colorScheme = dark ? "dark" : "light";
    root.classList.toggle("vb-has-bg", !!background);
    root.classList.toggle("vb-glass", !!glass);
  });
  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Preview />
  </StrictMode>,
);
