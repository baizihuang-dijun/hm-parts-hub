# 项目上下文

### 版本技术栈

- **Framework**: Next.js 16 (App Router), `output: 'export'` 纯静态导出, `trailingSlash: true`
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)，预装于 `src/components/ui/`
- **Styling**: Tailwind CSS 4

## 项目定位

英文 B2B 静态站：移动机械售后配件 RFQ 平台（第一批：excavator Final Drives）。
内容为 JSON 快照驱动（`src/content/public_batch1.json`），不接数据库、不做电商功能。

## 目录结构

```
├── public/images/products/   # 产品图（JSON 中 images[].file 一一对应）
├── scripts/
│   ├── build.sh              # check(pre) → next build(静态导出) → check(post) → tsup
│   ├── check-data.mjs        # 数据/合规构建断言（失败非零退出阻断 build）
│   ├── dev.sh / start.sh     # 开发/生产启动
│   └── prepare.sh            # 依赖预处理
├── src/
│   ├── app/                  # 页面路由（仅需求书列出的页面）
│   │   ├── equipment/[make]/[model]/final-drives/  # 80 个机型页（generateStaticParams）
│   │   ├── parts/final-drives/                     # 品类 Hub
│   │   ├── parts/final-drives/for/[make]/          # 13 品牌枢纽
│   │   ├── request-quote/ about/ privacy/ terms/   # RFQ 与辅助页
│   │   ├── guides/how-to-check-excavator-final-drive-nameplate/
│   │   ├── sitemap.ts / robots.ts                  # 由 allPublicRoutes() 生成
│   │   └── not-found.tsx                           # 404 (noindex)
│   ├── components/           # header/footer/consent-banner/analytics/rfq-form 等
│   ├── config/site.ts        # SITE_NAME 与 NEXT_PUBLIC_* 环境变量集中读取
│   ├── content/public_batch1.json  # 唯一内容数据源（新增页面只换它+图片）
│   ├── lib/data.ts           # JSON 类型化读取、路由推导、part_type 中→英映射
│   ├── lib/seo.ts            # buildMetadata() 统一 title/description/canonical/OG
│   └── server.ts             # 生产静态服务器（服务 out/，未命中回落 404.html）
├── .env.example              # NEXT_PUBLIC_SITE_URL / WEB3FORMS_KEY / RFQ_EMAIL / GA4_ID
└── DESIGN.md                 # 视觉设计规范（工业档案册风）
```

## 包管理规范

**仅允许使用 pnpm**，严禁 npm/yarn。常用：`pnpm add <pkg>` / `pnpm add -D <pkg>` / `pnpm install` / `pnpm remove <pkg>`。

## 开发规范

### 编码规范
- TypeScript strict 心智；禁止隐式 `any` 与 `as any`；函数参数、事件对象、`catch` 错误先类型收窄。
- 禁止引用未声明标识符；组件/函数/类型使用前必须 import。
- next.config 路径用 `path.resolve(__dirname, ...)` 动态拼接，不写死绝对路径。

### Hydration 防范
- 严禁 JSX 渲染期直接使用 `typeof window` / `Date.now()` / `Math.random()`；动态内容用 `'use client'` + `useEffect` + `useState`（参考 consent-banner）。
- 严禁非法 HTML 嵌套；不使用 `head` 标签，metadata 用 Next Metadata API。

### 内容/合规红线（check-data.mjs 强制）
- 路由只能来自 JSON：当前 80 个机型页 / 13 品牌，`url_path` 必须等于推导值；JSON 之外的机型绝不生成路由或文本。品牌枢纽只链接本品牌机型。
- 公共输出禁止：`guaranteed fit` / `direct replacement` / `drop-in` / `fully interchangeable` / `in stock` / `48-hour shipping` / 价格 / 购物车 / `core charge` / 旧学术措辞（reported for reference / not independently verified / do not order by ... alone）/ `LB-` / `SKU-` / UUID / S1S2S3 标签 / 供应商名与成本 / 任何中文字符。
- 机型页是**商业采购页**：H1、主图+CTA、`copy.intro/sourcing/fit_check/pn_note/generation_note` 逐字渲染；件号区有件号用 "Part numbers for this model"（件号可对照、底部 pn_note 收口、每号有 Quote 链接），无件号用 "Need the right part number?" + "Send my nameplate" 按钮，绝不放空表。
- 每 页 intro 必须含 make+model（差异化文案断言）；title/description/canonical 全站唯一；layout title template 已自动追加站名，metadata 传裸 title 即可，勿再手写 `| SITE_NAME`。
- JSON 里 `part_type` 为中文，渲染必须经 `partTypeEn()` 映射为英文（新增取值需同步扩 map）；`verification_note` **不渲染**（部分含禁用语）。
- 图片：主图 tag=main 不 lazy 且 fetchPriority=high，其余 lazy；所有 `<img>` 必须有 width/height（尺寸维护在 `src/lib/image-sizes.ts`，换图需重新生成）。
- RFQ 走 Web3Forms（`NEXT_PUBLIC_WEB3FORMS_KEY` 未配置时显示占位不崩溃）；GA4 仅 consent=granted 后注入，`generate_lead` 只在提交成功且已授权时触发。

## 构建与验证

- `pnpm check`：仅跑 pre 断言；`pnpm build`：pre 断言 → 静态导出 → post 断言（扫描 `out/`）。
- 修改数据/文案后必须 `pnpm build` 全绿方可交付。
- 静态导出无服务端 API；接口测试不适用，验证以构建断言 + 页面静态检查为准。
