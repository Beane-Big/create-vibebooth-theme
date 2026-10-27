// 本地预览时扮演门户：和门户一样把 React 和共享的 Ant Design 组件放到 window.vibebooth 上，接住主题的 registerTheme。
// 要在 ../theme.tsx 之前加载（main.tsx 第一行 import 它）。
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import {
  Alert, Avatar, Badge, Button, Card, Checkbox, Col, Empty, Flex, Form, Grid, Input, Row, Segmented, Select,
  Space, Spin, Tag, Tooltip, Typography, theme,
} from "antd";
import type { ThemeDefinition } from "../vibebooth";

export let registered: ThemeDefinition | null = null;

window.vibebooth = {
  platform: 1,
  React,
  jsxRuntime,
  antd: {
    Alert, Avatar, Badge, Button, Card, Checkbox, Col, Empty, Flex, Form, Grid, Input, Row, Segmented, Select,
    Space, Spin, Tag, Tooltip, Typography, theme,
  },
  registerTheme(def) {
    registered = def;
  },
};
