# DESIGN.md

## 气质与意象
重工配件经销商的「零件柜台 + 技术档案室」：钢架上一排排贴着手写标签的零件木箱、盖着钢印的纸质交叉引用卡、沾着油污的铭牌照片。网站应像一本翻得动的技术档案册——克制、精确、可信，而不是电商卖场。

## 视觉策略
- 摄影/图像：产品图为唯一主角，白底/素底实拍图原样呈现，加细边框像「档案照片」一样被钉在页面上，不做圆角卡片堆砌、不加炫光。
- 图形语言：细线框（1px）、直角或小圆角、分隔线驱动的版面；件号用等宽字体呈现「钢印标签」感。

## 配色方案（Tailwind 4 theme tokens，v6 工业零件目录）
- 纸面 `--background` / `--paper`: #F4F2ED —— 档案册纸张的暖白
- 墨色 `--foreground`: #16191C —— 近黑墨色；次级文字 #5A6268 / #8A9096
- 主色 `--primary` / `--steel`: #1E2A33 深钢炭（topbar / hero / 卡片图底 / footer）；`--steel-2`: #2A3945
- 强调色（仅主 CTA/焦点/件号高亮）: `--orange` #E8531C，hover `--orange-d` #C8430F —— 工程机械安全橙，点到为止，不大面积铺
- 辅助 `--muted`/`--secondary`: #ECE8E0，边框 `--border`: #DEDAD1
- 钢底上的文字层级：#EEF2F4 主文 / #AEB9C0 次文 / #7E8A93 弱提示 / 分隔线 #33444F

## 字体排版
- 正文/标题：系统无衬线栈（system-ui / Segoe UI / Arial），标题收紧字距
- 件号、序列号、规格、计数徽章：`--font-mono`（ui-monospace/SFMono/Menlo/Consolas 栈），配合小号大写字距标签形成「钢印标签」节奏
- 版面节奏：mono 小号大写 kicker + 粗标题 + 细分隔线；左对齐、强栅格、高信息密度

## 动效与交互
- 几乎无动效：仅链接/按钮 hover 颜色过渡（150ms）、卡片 hover translateY(-2px)；无滚动动画、无视差
- CTA 永远是明确的实心橙按钮，文案具体（Request a quote），不用促销语气

## 设计禁忌
- 禁止电商促销元素：价格、倒计时、库存角标、折扣横幅、购物车图标
- 禁止「科技蓝渐变 + 圆角卡片 + 发光」的 SaaS 默认审美
- 禁止 OEM 品牌色暗示授权关系（不用 Caterpillar 黄做整页底色等）
- 禁止在卡片/列表中堆砌应用场景长句（如 "tight-access utility / heavy excavation..." 列）；列表信息密度只保留 机型名 + PN + 吨位标签

## 组件规范（v6 重构批次，以 /tmp/assets/mockup_v6.html 打样为准）
### 机型卡片 ModelCard（首页/品类Hub/品牌枢纽列表统一使用）
- 网格：repeat(auto-fill, minmax(250px,1fr))；卡片 6px 圆角 + 1px 细边框 + hover translateY(-2px)
- 顶部主图：固定 4:3 + object-contain + 深钢炭 #1E2A33 底 + padding 14px + loading="lazy"
- 卡片文字：m-make（mono 大写小字）→ m-model（粗体）→ m-meta 行：吨位 `~X T` 边框小标签（ton 为 null 不显示）+ `PN {lead_pn}` 橙色等宽右对齐（lead_pn 为空显示灰色 "Nameplate match"，不带 PN 前缀）
- 整卡可点击进机型页
### 首页结构（v6-step2）
- topbar：钢底 60px + 3px 橙色底边；左 Parts Desk 字标（mono 副标），右导航 + 橙色 Request a quote 按钮
- Hero 钢底左对齐：kicker + H1（em 橙色）+ sub + 大号搜索框（客户端静态检索，键盘上下+回车，空结果给引导）+ 6 热门件号 chip（真实 <a> 链接进机型页）
- trust 三条（01/02/03 编号）；13 品牌格（品牌名 + 钢底计数徽章）；8 常用机型卡；How it works 3 步（分隔线）；钢底 CTA band；钢底 footer + 商标声明行
### 机型页图片画廊
- 主图大图展示：rounded-lg + 细边框 + 浅阴影；附图小缩略图可点击切换大图（客户端组件）
- 图片下方一行图注：Final drive for {Make} {Model}
### 机型页 CTA
- 首屏与页尾各一个实心 amber 圆角按钮；移动端增加 sticky 底部 CTA 栏（md 以上隐藏）
