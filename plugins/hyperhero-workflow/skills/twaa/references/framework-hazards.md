# 前端框架嵌套 a11y 地雷對照表

> 30+ 個常見「組件嵌套 / wrapper / slot / portal」會破壞 AAA 指引的 anti-pattern。
> 每條含：grep pattern / 為什麼壞 / 正確寫法 / 對應 WCAG 條目。

---

## Vue 3

### V01 — `<Teleport>` 抽出元素破壞焦點順序
**grep:** `<Teleport`
**為什麼壞:** 把元素抽出原 DOM tree，Tab 順序與 DOM 順序不一致 → 違反 2.4.3 焦點順序。
**正確寫法:** 配 focus trap（自寫或用 `vue-focus-trap`）；modal 開啟時把 `<body>` 設 `aria-hidden=true`。
**WCAG:** 2.4.3, 2.1.2

### V02 — `<Transition>` + `display:none` 動畫
**grep:** `<Transition.*v-show` 或 `<Transition.*v-if`
**為什麼壞:** 動畫期間 SR 看到舊狀態又看到新狀態的 ARIA。
**正確寫法:** 用 `aria-hidden` 配合動畫 lifecycle hook；或改用 `v-if`（但要確保焦點處理）。
**WCAG:** 4.1.3

### V03 — `v-html` 渲染 user input
**grep:** `v-html=`
**為什麼壞:** 注入未經 a11y 驗證的 markup（缺 alt、缺 label）。
**正確寫法:** 用 DOMPurify 或 server-side sanitize；對使用者內容盡量用 `{{ }}`。
**WCAG:** 4.1.2, 1.1.1

### V04 — Composition API `ref` 漏 `.value`
**grep:** `.focus()` 在 `ref<HTMLElement>` 上
**為什麼壞:** focus 操作失效，導致跳轉/錯誤焦點功能不工作。
**正確寫法:** 用 `el.value?.focus()`，並檢查 ref 已掛載。
**WCAG:** 2.4.3, 3.3.3

### V05 — `<KeepAlive>` 切換保留舊 focus
**grep:** `<KeepAlive>`
**為什麼壞:** 元件重新激活後焦點落在 stale 元素。
**正確寫法:** 用 `onActivated` hook 重設焦點。
**WCAG:** 2.4.3

---

## React

### R01 — `forwardRef` 漏傳 ref
**grep pattern (AST):** `forwardRef\(\s*(\([^,)]*\)|[\w]+)\s*=>` (參數只有一個)
**為什麼壞:** 父元件無法 focus 子輸入框。
**正確寫法:** `forwardRef((props, ref) => <input ref={ref} />)`
**WCAG:** 4.1.2, 2.4.3

### R02 — Portal 跳出 root
**grep:** `createPortal\(`
**為什麼壞:** 同 V01，Tab 順序斷。
**正確寫法:** focus trap + 開啟時 portal 之外設 inert。
**WCAG:** 2.4.3, 2.1.2

### R03 — `useEffect` cleanup 沒復原 ARIA
**grep:** `useEffect.*aria-`
**為什麼壞:** 路由切換後殘留 `aria-live` announcement。
**正確寫法:** cleanup 函式內把 ARIA 屬性歸位或移除節點。
**WCAG:** 4.1.3

### R04 — `<Suspense>` fallback 期 focus 落 spinner
**grep:** `<Suspense.*fallback`
**為什麼壞:** 載入中焦點丟失。
**正確寫法:** fallback 內放 `aria-live=polite` 文字，並在 resolved 後恢復焦點。
**WCAG:** 4.1.3, 2.4.3

---

## PrimeVue（您專案在用）

### P01 — `<DataTable>` slot 內 `<router-link>` 焦點被吃
**grep:** `<DataTable.*<router-link`
**為什麼壞:** DataTable cell click handler 攔截事件。
**正確寫法:** `<router-link @click.stop>` 或改用 `<a href>` + 自訂 click handler。
**WCAG:** 2.1.1, 4.1.2

### P02 — `<Dropdown>` 自訂 panel 未繼承 aria
**grep:** `<Dropdown.*<template #option`
**為什麼壞:** 自訂 option 沒有 `role="option"`、`aria-selected`。
**正確寫法:** 在 template 內保留 PrimeVue 預設屬性（`v-bind="slotProps"`）。
**WCAG:** 4.1.2

### P03 — `<Calendar>` 鍵盤箭頭與外層 Tab 衝突
**grep:** `<Calendar`
**為什麼壞:** 開啟時箭頭鍵被內部劫持，使用者以為被卡住。
**正確寫法:** 用 Esc 關閉，焦點還給觸發按鈕（Calendar 內建支援，但需確認 wrap layer 沒覆蓋 keydown）。
**WCAG:** 2.1.2

### P04 — `<FileUpload>` 隱藏 input 無 aria-describedby
**grep:** `<FileUpload`
**為什麼壞:** SR 不知道接受的格式 / 大小限制。
**正確寫法:** 加 `aria-describedby` 連到提示文字。
**WCAG:** 3.3.2

### P05 — `<Dialog :closeOnEscape="false">`
**grep:** `closeOnEscape="?false"?`
**為什麼壞:** 鍵盤陷阱（您退件意見之一）。
**正確寫法:** 移除此屬性使用預設行為，或自寫 Esc 處理。
**WCAG:** 2.1.2

---

## 通用（任何框架）

### C01 — `<div role="button">`
**grep:** `<div\b[^>]*role=["']button["']`
**為什麼壞:** 缺 keydown handler（Enter/Space）。
**正確寫法:** 改用 native `<button>`。
**WCAG:** 4.1.2, 2.1.1

### C02 — Wrapper props 未 forward → outer aria 被 inner 蓋
**grep:** wrapper 元件 template 沒有 `v-bind="$attrs"` (Vue) 或 `{...rest}` (React)
**為什麼壞:** 父給的 `aria-label` 不會傳到 native 元素。
**正確寫法:** Vue 用 `inheritAttrs: false` + `v-bind="$attrs"`；React 用 `{...rest}`。
**WCAG:** 4.1.2

### C03 — slot 內 child 提供 label，slot 外 parent 也提供
**grep:** 元件同時設 `aria-label` 與 `aria-labelledby`
**為什麼壞:** SR 雙重宣告。
**正確寫法:** 只擇一。
**WCAG:** 4.1.2

### C04 — 圖+相鄰文字連結 alt 重複
**grep:** `<a[^>]*>\s*<img[^>]*alt="[^"]+"[^>]*>\s*[一-鿿]`
**為什麼壞:** SR 讀「金展獎圖示 金展獎」雙重。
**正確寫法:** 圖 alt=""（您退件意見 HM1240402E）。
**WCAG:** 1.1.1

### C05 — 按鈕無可見文字（純圖示按鈕）無 aria-label
**grep:** `<button[^>]*>\s*<i\b[^>]*></i>\s*</button>`
**為什麼壞:** SR 念不出按鈕用途。
**正確寫法:** 加 `aria-label`。
**WCAG:** 4.1.2

### C06 — 漢堡選單無 aria-expanded
**grep:** `class="[^"]*hamburger\|menu-toggle`
**為什麼壞:** SR 不知道展開狀態。
**正確寫法:** 加 `aria-expanded` + `aria-controls`。
**WCAG:** 4.1.2

### C07 — focus 樣式被 `outline:none` 蓋掉沒補上替代
**grep:** `outline:\s*none` 但同檔案無 `:focus-visible`
**為什麼壞:** 鍵盤焦點不可見。
**正確寫法:** 用 `:focus-visible` 補上 outline。
**WCAG:** 1.4.1, 2.4.7（CS1140101E）

### C08 — `tabindex` 正值（≥1）
**grep:** `tabindex="[1-9]`
**為什麼壞:** 破壞自然 Tab 順序。
**正確寫法:** 移除。需要可聚焦但跳過自然 Tab 用 `tabindex="-1"`。
**WCAG:** 2.4.3

### C09 — `<input>` 缺 `<label>`（純 placeholder）
**grep:** `<input[^>]*placeholder` 但無 `<label for>`
**為什麼壞:** SR 念不出欄位用途；placeholder 不是 label。
**正確寫法:** 用 `<label for="id">` 或 `aria-label`。
**WCAG:** 3.3.2, 1.3.1

### C10 — autoplay video/audio 無控制
**grep:** `<video.*autoplay\|<audio.*autoplay`
**為什麼壞:** 違反 1.4.2。
**正確寫法:** 加 `controls` 或不要 autoplay。
**WCAG:** 1.4.2

### C11 — 表格無 `<th>` / `<caption>`
**grep:** `<table>` 但下無 `<th>`
**為什麼壞:** SR 讀不出表頭關聯。
**正確寫法:** 加 `<th>` + `<caption>`。
**WCAG:** 1.3.1

### C12 — 連結文字「點此」「按這裡」「more」
**grep:** `>\s*(?:點此|這裡|here|click here|more|查看)\s*<`
**為什麼壞:** 脫離脈絡無意義（2.4.4、AAA 2.4.9 更嚴格）。
**正確寫法:** 用描述性文字。
**WCAG:** 2.4.4, 2.4.9

### C13 — `<svg>` 缺 `<title>` 或 `aria-label`
**grep:** `<svg(?![^>]*aria-).*>` 不含 `<title>`
**為什麼壞:** SR 讀不出。
**正確寫法:** 裝飾用 `aria-hidden="true"`；資訊用 `<title>` 或 `aria-label`。
**WCAG:** 1.1.1

### C14 — 模態開啟時背景不 inert / `aria-hidden`
**grep:** modal/dialog 元件
**為什麼壞:** SR 仍可走訪背景內容造成混亂。
**正確寫法:** 開啟時對 modal 外的兄弟元素加 `inert` 或 `aria-hidden`。
**WCAG:** 2.4.3, 4.1.2

### C15 — `lang` 屬性錯誤或缺失
**grep:** `<html` 無 `lang=` 或 `lang="zh-TW"`（應 `zh-Hant-TW`）
**WCAG:** 3.1.1（GN1310100E）
