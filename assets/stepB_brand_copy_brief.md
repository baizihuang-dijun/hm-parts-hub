# Step B 工单：品牌切换 HM Parts Hub + 首页文案如实化 + 正式域静态构建准备

目标：把站点品牌从 Parts Desk 切到 **HM Parts Hub**，首页 H1/眉标/meta 按定稿如实落在 Final Drives & Travel Motors 品类，验证正式域 `https://hmpartshub.com` 下纯静态导出正确。**只改品牌与文案、只做构建验证；不改数据、URL、机型页内容、图片；不配置/不发布到任何线上自定义域名（Cloudflare 连接由主会话后续单独做）。**

## 一、品牌（全站统一）
1. `src/config/site.ts`：`SITE_NAME = 'Parts Desk'` 改为 `'HM Parts Hub'`。
2. 页眉（site-header.tsx）品牌主名随 SITE_NAME 显示 HM Parts Hub；其下副标 `Mobile machinery · aftermarket sourcing` 改为 `Mobile Equipment Aftermarket Parts`。
3. 页脚品牌名随之变 HM Parts Hub；页脚那句 "Independent sourcing support for mobile machinery aftermarket parts." 语义保留即可（如硬编码出现 Parts Desk 也要改）。
4. **"Parts Desk" 只允许保留为站内 RFQ/识别功能名**：全站搜索硬编码的 "Parts Desk"，凡是指代公司/站点品牌的一律改 HM Parts Hub；仅当某处明确是询价工具/服务模块名称时可保留 Parts Desk（没有合适位置就不必强行出现，不要新增 Parts Desk 字样）。
5. title 模板/OG/JSON-LD 里凡拼接站点品牌名的地方，随 SITE_NAME 自动变 HM Parts Hub；自检不要残留旧品牌。

## 二、首页文案（page.tsx hero + metadata，按定稿逐字）
- 眉标 kicker：`Replacement Final Drives & Travel Motors`
- H1：`Find Final Drives and Travel Motors by Equipment Model or OEM Part Number`
  - 可保留 `<em>` 视觉强调（如强调 "OEM Part Number"），但文案逐字一致。
- 副文案 sub：`Configuration-matched aftermarket parts for excavators and track equipment, with hands-on identification and quote support.`
  - 原那句 "Search N equipment models across M brands..." 不要删数据点：可作为副文案下方一行小字保留（动态 N/M），但主副文案用上面定稿。
- 首页 metadata：
  - title：`HM Parts Hub — Replacement Final Drives & Travel Motors`
  - description：`Find replacement final drives and travel motors by equipment model or OEM part number. Configuration-matched aftermarket parts for mobile equipment, with hands-on identification and quote support.`
- RFQ 页等其他页若硬编码了旧品牌名才改；其品类标题（Request a Quote — Final Drive Sourcing）保持，不要扩散改动。

## 三、正式域静态构建准备（不发布）
1. 保持 Step A 的 `output:'export'` + `images.unoptimized:true` + `allowedDevOrigins:['*.dev.coze.site']` 不变。
2. SITE_URL 仍只从 `NEXT_PUBLIC_SITE_URL` 读取（代码里**不要硬编码** hmpartshub.com）。本次用环境变量 `NEXT_PUBLIC_SITE_URL=https://hmpartshub.com` 跑一次生产构建做验证：
   - `NEXT_PUBLIC_SITE_URL=https://hmpartshub.com pnpm build`（在你的构建环境，按既有可行方式）必须成功；
   - 抽查 out/ 内产物：首页与任一机型页的 `<link rel=canonical>`、og:url、JSON-LD 内 URL、sitemap.xml/robots 全部为 `https://hmpartshub.com/...`，**不得出现 coze.site、example.com、localhost 或空占位**（未设环境变量时允许根相对回退，但本次设了变量必须绝对且正确）。
3. RFQ 表单仍纯前端直连 Web3Forms（NEXT_PUBLIC_WEB3FORMS_KEY / NEXT_PUBLIC_RFQ_EMAIL 走既有环境变量，不写入真实值、不改表单逻辑）。
4. 不得新增任何服务端 route handler / middleware / SSR 运行时依赖；80 机型页、sitemap、robots 仍为构建期静态产物。

## 四、禁改项（红线）
- 不改 src/lib/data.ts 任何型号/件号/分组数据；不改 URL 结构（/equipment/<make>/<model>/final-drives/ 尾斜杠等）；不改图片及文件名；不改机型页正文/三表/FAQ；不动 RFQ 字段与提交逻辑；不引入新依赖；不创建 CNAME、不写 deploy 目标、不连任何外部平台。
- 合规口径沿用现有：不出现 guaranteed fit / direct replacement / fully compatible / 1:1 / interchangeable 等承诺词。

## 五、验收（请在汇报中逐条给结果）
1. `grep -rni "parts desk" src` 列出剩余出现位置并逐条说明为何保留（应为 0 或仅 RFQ 功能名）。
2. 首页渲染文本含：HM Parts Hub、眉标、新 H1、新副文案，且动态 N models / M brands 仍正常显示；页脚品牌正确。
3. 设了 NEXT_PUBLIC_SITE_URL 后 `pnpm build` 成功；报 out/ 下 HTML 总数；抽查首页 + 1 个机型页（PC200-7）canonical/og:url/JSON-LD 域名全部为 hmpartshub.com；sitemap.xml 内 80 机型页 loc 全部 https://hmpartshub.com 开头。
4. 禁词扫描：guaranteed fit / direct replacement / fully compatible / interchangeable / 1:1 在新品牌与首页文案区为 0；example.com / coze.site 残留在 out/ 为 0（GSC 验证文件等既有必要资源除外，若有请单列说明）。
5. RFQ 相关文件 diff 仅可能是品牌名，表单 action/key 读取逻辑不变。
6. 完成后 git add/commit 并推送到 main（提交信息如 `brand: switch to HM Parts Hub, final-drives-focused home copy, prod-domain static build ready`）。若 `.github/workflows/*` 因权限推不上可跳过并说明，其余源码必须真实 push 成功，并回报 commit sha。

完成后只在项目内汇报，不要发布、不要绑定任何线上域名。
