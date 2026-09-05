# Kokkoro 部署说明

本文记录个人博客当前已验证的部署方式。正式访问入口为
<https://kokkoro.me/>，GitHub Pages 保留为备用入口。部署目标分支统一为
`kokkoro/main`，不是 `main` 或其他分支。

## GitHub Pages

GitHub Pages 是当前可持续使用的备用公开入口：

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

已验证生成的 ESA 产物不含该 FLAC，当前最大文件约 8.6 MB，低于 ESA 的 25 MB 限制。

### 后续 ESA 构建

ESA Pages 已关联 `kokkoro/main`。文章或代码提交推送到该分支后，会自动开始新的
ESA 构建；GitHub Pages 也会由独立的 GitHub Actions 工作流自动发布。因此日常更新博客只需提交并推送到 `kokkoro/main`。

若推送后线上没有更新，依次检查：

1. ESA 构建历史是否出现对应提交并显示“构建成功”；
2. 构建命令是否仍为 `pnpm build:esa`，生产环境版本是否为 100%；
3. GitHub Actions 中的 Pages 工作流是否成功；
4. <https://kokkoro.me/> 的响应内容是否已经切换，避免只根据控制台状态判断部署完成。

## ESA 自定义域名：当前状态

ESA 生产域名为 <https://kokkoro.me/>，站点 ID 为 `176473522002136`，采用 CNAME 接入和“全球（不包含中国内地）”区域。

当前权威 DNS 记录：

```text
@         CNAME  kokkoro.me.a1.initjj.com
_dnsauth  CNAME  kokkoro.me.176473522002136.dcv.aliyun-esa.com
@         TXT    google-site-verification=<Search Console 生成值>
```

`_dnsauth` 是 DigiCert 免费证书签发和自动续期使用的托管 DCV 记录，不要删除。ESA 已签发并部署免费证书，同时开启强制 HTTPS；HTTP 请求会以 `301` 重定向到 HTTPS。

根域名的 TXT 记录用于维持 Google Search Console 的域名所有权验证，也应保留。验证值本身可从公开 DNS 查询到，不属于密码，但仓库只记录用途和占位符，避免固化账号关联值。

## 主域名与搜索索引

`src/config/siteConfig.ts` 中的站点主地址为 `https://kokkoro.me`。所有完整 HTML 页面由 `src/layouts/Layout.astro` 输出：

- 指向正式域名的 `<link rel="canonical">`；
- 与 canonical 一致的 `og:url` 和 `twitter:url`；
- GitHub Pages 备用入口会移除 `/Firefly/` 部署前缀后再指向同一路径的 `kokkoro.me` 页面。

搜索引擎发现入口：

- `robots.txt`：<https://kokkoro.me/robots.txt>；
- 站点地图索引：<https://kokkoro.me/sitemap-index.xml>；
- RSS：<https://kokkoro.me/rss.xml>。

Google Search Console 的 `kokkoro.me` 域名资源已于 2026-09-05 通过根域名 TXT 记录完成所有权验证。当前控制台仍在处理首次数据；所有权验证只证明域名归属，不等于页面已经被收录，也不保证具体收录时间。待数据可用后，在 Search Console 中检查或提交上述站点地图，并通过网址检查查看重点页面状态。

## 线上验收记录

2026-09-05 已对用户实际访问面完成只读检查：

- `http://kokkoro.me/` 返回 `301` 并跳转到 HTTPS；
- `https://kokkoro.me/` 返回 `200`，响应服务为 ESA；
- 正式域名首页、部署实录文章和 GitHub Pages 备用首页均把 canonical、`og:url`、`twitter:url` 指向 `kokkoro.me`；
- `robots.txt` 指向 `sitemap-index.xml`，站点地图与 RSS 使用正式域名。

不要将 ESA 测试访问链接、短时鉴权 token、账号信息或 DNS 凭据写入仓库。
