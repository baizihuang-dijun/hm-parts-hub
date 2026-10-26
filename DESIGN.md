# DESIGN.md

## 气质与意象
重工配件经销商的「零件柜台 + 技术档案室」：钢架上一排排贴着手写标签的零件木箱、盖着钢印的纸质交叉引用卡、沾着油污的铭牌照片。网站应像一本翻得动的技术档案册——克制、精确、可信，而不是电商卖场。

## 视觉策略
- 摄影/图像：产品图为唯一主角，白底/素底实拍图原样呈现，加细边框像「档案照片」一样被钉在页面上，不做圆角卡片堆砌、不加炫光。
- 图形语言：细线框（1px）、直角或小圆角、分隔线驱动的版面；件号用等宽字体呈现「钢印标签」感。

## 配色方案（Tailwind 4 theme tokens）
- 纸面 `--background`: #f7f7f5 —— 档案册纸张的暖白
- 墨色 `--foreground`: #1b2430 ——  blueprint 图纸上的深钢蓝黑
- 主色 `--primary`: #243447 深钢蓝（机械漆面的暗部）
- 强调色（仅 CTA/关键提示）: amber-600 #d97706 —— 工程机械安全黄/警示胶带，点到为止
- 辅助 `--muted`: #ececea，边框 `--border`: #d6d6d1

## 字体排版
- 正文/标题：系统字体栈（Helvetica Neue / Arial / system-ui），标题收紧字距 tracking-tight
- 件号、序列号、规格：`--font-mono`（ui-monospace 栈），配合小号大写字距标签形成「档案字段」节奏
- 版面节奏：小号大写 section label（uppercase tracking-widest）+ 粗标题 + 细分隔线

## 动效与交互
- 几乎无动效：仅链接/按钮 hover 颜色过渡（150ms）、手风琴展开；无滚动动画、无视差。
- CTA 永远是明确的实心 amber 按钮，文案具体（Request a quote for this model），不用促销语气。

## 设计禁忌
- 禁止电商促销元素：价格、倒计时、库存角标、折扣横幅、购物车图标
- 禁止「科技蓝渐变 + 圆角卡片 + 发光」的 SaaS 默认审美
- 禁止 OEM 品牌色暗示授权关系（不用 Caterpillar 黄做整页底色等）
- 禁止在卡片/列表中堆砌应用场景长句（如 "tight-access utility / heavy excavation..." 列）；列表信息密度只保留 机型名 + PN + 吨位标签

## 组件规范（2024 重构批次）
### 机型卡片 ModelCard（首页/品类Hub/品牌枢纽列表统一使用）
- 响应式网格：桌面 3–4 列、平板 2 列、手机 1 列；卡片 rounded-lg + 1px 细边框 + hover 时轻微阴影
- 顶部主图缩略图：固定比例（aspect-[4/3]）+ object-cover + 浅灰（--muted）占位底 + loading="lazy"
- 卡片文字：机型名粗体一行；`PN {lead_pn}` 等宽字体（lead_pn 为空时显示 "Nameplate match"）；吨位 `~X T` 小标签
- 整卡可点击进机型页，右下角 "View →"
### 机型页图片画廊
- 主图大图展示：rounded-lg + 细边框 + 浅阴影；附图小缩略图可点击切换大图（客户端组件）
- 图片下方一行图注：Final drive for {Make} {Model}
### 机型页 CTA
- 首屏与页尾各一个实心 amber 圆角按钮；移动端增加 sticky 底部 CTA 栏（md 以上隐藏）
