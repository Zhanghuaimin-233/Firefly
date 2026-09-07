# Spine 看板娘使用指南

## 功能说明

此功能为博客添加了可配置的 Spine 动画看板娘，可以显示在页面角落，支持多模型切换与前端设置面板开关。

完整架构说明（多模型解析、事件流、新增模型步骤）见 [docs/CODE_WIKI.md](../../docs/CODE_WIKI.md) §4.10。

## 配置入口

配置位于 `src/config/pioConfig.ts` 的 `spineModelConfig`（类型定义在 `src/types/pioConfig.ts`）：

```typescript
export const spineModelConfig: SpineModelConfig = {
  enable: true,              // 总开关默认值（前端面板可覆盖，存 localStorage.pioEnabled）
  models: [                  // 可切换模型列表，追加 entry 即新增模型，无需改组件代码
    {
      key: "105913",         // 唯一标识，存入 localStorage.pioModel
      name: "立绘",           // 前端按钮显示名
      model: {
        path: "/pio/models/spine/105913/105913.json",
        scale: 0.24,
        skin: "normal",                       // 命名皮肤，缺省只显示 base
        premultipliedAlpha: true,             // Spine 3.6 资源通常需要 true
        viewportPadding: { left: 0, right: 0, top: 0, bottom: 0 }, // 半身立绘贴底
      },
      size: { width: 150, height: 245 },
      position: { corner: "bottom-left", offsetX: 0, offsetY: 0 },
      interactive: {
        enabled: true,
        clickAnimations: ["mouth_talk", "eye_blink"], // 点击动画（随机）
        clickMessages: ["你好呀！"],                   // 点击消息（与动画独立随机）
        messageDisplayTime: 3000,
        idleAnimations: ["eye_idle"],                 // 待机动画
        idleInterval: 8000,
      },
    },
  ],
  defaultModel: "105913",    // 无 localStorage 时默认激活的 key
  responsive: { hideOnMobile: true, mobileBreakpoint: 768 },
};
```

`models` 为空时回退到旧的单模型字段（`model` / `position` / `size` / `interactive`），向后兼容。

## 文件结构要求

- **Spine 运行时**：优先从 CDN 加载，失败回退本地 `public/pio/static/spine-player.min.js`（含同名 `.min.css`）。
- **Spine 模型**：放置在 `public/pio/models/spine/<key>/`，每个模型包含：
  - `<key>.json` — 骨骼数据
  - `<key>.atlas` — 纹理图集
  - `<key>.png` — 纹理图像

## 启用步骤

1. 将 Spine 资源放入 `public/pio/models/spine/<key>/`。
2. 在 `src/config/pioConfig.ts` 的 `models` 数组追加一个 entry（或修改 `defaultModel`）。
3. 确认 `spineModelConfig.enable` 为 `true`。
4. `pnpm dev` 验证；前端「视图设置 → 看板娘」面板可实时开关与切换模型。

## 常见问题

- **半透明区变灰**：Spine 3.6 资源默认预乘 alpha，在该模型 entry 配 `premultipliedAlpha: true`。
- **模型底部有间隙**：半身立绘需配 `viewportPadding` 全 0 贴底；完整角色模型不配则保留默认 10% 间距。
- **待机动画报错**：`idleAnimations` 中的动画名必须存在于该模型的骨骼数据中，不存在的会被自动过滤。
- **看板娘选项卡不显示**：需同时满足 `models.length > 0` 且 `enable === true`。
