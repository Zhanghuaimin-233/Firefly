# Kokkoro 部署说明

本文记录个人博客当前已验证的部署方式。部署目标分支统一为
`kokkoro/main`，不是 `main` 或其他分支。

## GitHub Pages

GitHub Pages 是当前可持续使用的公开部署入口：

- 地址：<https://zhanghuaimin-233.github.io/Firefly/>。
- 工作流：`.github/workflows/deploy.yml`。
- 触发条件：每次推送到 `kokkoro/main`，或在 Actions 页面手动触发。
- 构建命令：`pnpm run build`。

工作流为 GitHub Pages 注入下列环境变量：

```text
SITE_BASE=/Firefly/
SITE_URL=https://zhanghuaimin-233.github.io
```

因此生成的资源与站内链接会保留 `/Firefly/` 前缀。推送未提交的本地改动不会触发部署；只有已推送到目标分支的提交会被构建。

## 阿里云 ESA Pages

ESA 项目名为 `firefly`，已连接仓库 `Zhanghuaimin-233/Firefly`，生产分支同样为 `kokkoro/main`。

控制台构建配置：

```text
安装命令：pnpm install --no-frozen-lockfile
构建命令：pnpm build:esa
根目录：/
静态资源目录：./dist
Node.js：22.x
```

ESA 构建默认不设置 `SITE_BASE`，因此 Astro 使用根路径 `/`。`astro.config.mjs` 通过 `SITE_BASE` 与 `SITE_URL` 环境变量区分两种托管环境，GitHub Pages 的构建行为不会被 ESA 配置改变。

### ESA 的 25 MB 文件限制

原始 FLAC 背景音乐超过 ESA 单文件上限。为保留 GitHub Pages 的原始文件，同时让 ESA 可部署：

- 音乐配置改为引用同名的 Opus 文件；
- `pnpm build:esa` 先执行普通构建，再运行
  `scripts/exclude-esa-large-assets.mjs`；
- 该脚本只从 `dist` 中移除超限的 FLAC，不会删除 `public` 中的源文件。

发布 ESA 前可在本地验证：

```powershell
corepack pnpm build:esa
```

已验证生成的 ESA 产物不含该 FLAC，最大文件约 7.5 MB，低于 ESA 的 25 MB 限制。

### 后续 ESA 构建

当前已通过控制台“新增构建”验证部署流程。后续若要把新的
`kokkoro/main` 提交发布到 ESA，应先在控制台确认构建使用
`pnpm build:esa`，再查看构建历史为“构建成功”、生产环境版本为 100%。
GitHub Pages 的自动发布与此流程独立。

## ESA 自定义域名：当前状态

ESA 生产域名为 <https://kokkoro.me/>，站点 ID 为 `176473522002136`，采用 CNAME 接入和“全球（不包含中国内地）”区域。

当前权威 DNS 记录：

```text
@         CNAME  kokkoro.me.a1.initjj.com
_dnsauth  CNAME  kokkoro.me.176473522002136.dcv.aliyun-esa.com
```

`_dnsauth` 是 DigiCert 免费证书签发和自动续期使用的托管 DCV 记录，不要删除。ESA 已签发并部署免费证书，同时开启强制 HTTPS；HTTP 请求会以 `301` 重定向到 HTTPS。

不要将 ESA 测试访问链接、短时鉴权 token、账号信息或 DNS 凭据写入仓库。
