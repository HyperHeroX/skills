/**
 * EXTRA_KEYBOARD_ALL_REACHABLE — 所有可互動元素鍵盤可達 (GN1210101E)
 *
 * 背景：稽核員 (2026-05-13) 在 https://dsos.wda.gov.tw/zh-tw/identity/login 抓出
 * 「鍵盤焦點無法遊走至更新眼睛圖片，僅能藉由滑鼠操作」— 一個有 click handler
 * 但 class="hidden" 的 refresh icon。
 *
 * 偵測策略：
 *   1. 找所有「視覺上可見」且「有 click 行為」的元素：
 *      - 內建有 click 語意：<a href>, <button>, <input type="button|submit|reset|image">
 *      - role="button" / "link" / "menuitem" / "tab" / "checkbox" / "switch"
 *      - 有 @click / onclick 屬性的任意 div / span / li / svg
 *      - 含 cursor:pointer 樣式的元素（推測有 click 行為）
 *   2. 判斷該元素是否「鍵盤可達」：
 *      - 內建 tag (a/button/input) 預設 tabindex=0
 *      - tabindex >= 0
 *      - 對 div/span 等需明確 tabindex 或為 contentEditable
 *   3. 列出所有不可達的元素為違規
 */

const NAME = 'EXTRA_KEYBOARD_ALL_REACHABLE';
const RULE = '所有可互動元素皆可由鍵盤聚焦';

function pass(message = '', details = []) {
  return { code: NAME, rule: RULE, status: 'pass', message, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: NAME, rule: RULE, status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 */
export async function check(page) {
  try {
    const result = await page.evaluate(() => {
      function selectorOf(el) {
        if (el.id) return `#${el.id}`;
        const cls = (el.className || '').toString().trim().split(/\s+/).slice(0, 2).join('.');
        return `${el.tagName.toLowerCase()}${cls ? '.' + cls : ''}`;
      }
      function isVisible(el) {
        if (el.getAttribute('aria-hidden') === 'true') return false;
        const cs = window.getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none') return false;
        if (parseFloat(cs.opacity) === 0) return false;
        const r = el.getBoundingClientRect();
        return r.width > 1 && r.height > 1;
      }
      function isNativelyFocusable(el) {
        const tag = el.tagName;
        if (tag === 'A' && el.hasAttribute('href')) return true;
        if (tag === 'BUTTON' && !el.disabled) return true;
        if (tag === 'INPUT' && !el.disabled) {
          const t = (el.type || 'text').toLowerCase();
          return ['button', 'submit', 'reset', 'image', 'text', 'email', 'tel', 'number', 'password', 'search', 'url', 'date', 'time', 'datetime-local', 'month', 'week', 'color', 'file', 'radio', 'checkbox', 'range'].includes(t);
        }
        if (tag === 'SELECT' && !el.disabled) return true;
        if (tag === 'TEXTAREA' && !el.disabled) return true;
        if (tag === 'AREA' && el.hasAttribute('href')) return true;
        return false;
      }
      function hasFocusableTabindex(el) {
        const ti = el.getAttribute('tabindex');
        if (ti === null) return false;
        const n = parseInt(ti, 10);
        return !Number.isNaN(n) && n >= 0;
      }
      function isReachable(el) {
        if (el.disabled) return false;
        // tabindex="-1" 主動排除焦點
        const ti = el.getAttribute('tabindex');
        if (ti !== null && parseInt(ti, 10) < 0) return false;
        if (hasFocusableTabindex(el)) return true;
        return isNativelyFocusable(el);
      }
      function hasFocusableAncestor(el) {
        let cur = el.parentElement;
        let depth = 0;
        while (cur && depth < 6) {
          if (isNativelyFocusable(cur) || hasFocusableTabindex(cur)) return true;
          const role = (cur.getAttribute && cur.getAttribute('role') || '').toLowerCase();
          if (['button', 'link', 'menuitem', 'tab', 'checkbox', 'switch', 'radio', 'option'].includes(role)) return true;
          cur = cur.parentElement;
          depth++;
        }
        return false;
      }
      // PrimeVue 元件內部裝飾性 class，焦點由元件根節點 (input / [tabindex=0]) 處理
      const PRIMEVUE_INTERNAL_CLASSES = [
        'p-inputswitch-slider',
        'p-checkbox-box',
        'p-checkbox-icon',
        'p-radiobutton-box',
        'p-radiobutton-icon',
        'p-dropdown-trigger',
        'p-dropdown-trigger-icon',
        'p-button-label',
        'p-button-icon',
        'p-multiselect-trigger',
        'p-multiselect-trigger-icon',
        'p-cascadeselect-trigger',
        'p-treeselect-trigger',
        'p-paginator-icon',
        'p-menu-overlay',
      ];
      function isPrimeVueInternal(el) {
        const cls = (el.className || '').toString();
        return PRIMEVUE_INTERNAL_CLASSES.some(c => cls.split(/\s+/).includes(c));
      }
      // 檢查整個元件根（自身或往上找到具備 .p-component 或可聚焦元素的容器）內是否有 focusable
      function componentRootHasFocusable(el) {
        // 先看自身：若元素自身為 .p-component（如 div.p-checkbox.p-component）→ 元件根，往內找
        const selfCls = (el.className || '').toString();
        if (selfCls.includes('p-component')) {
          const focusable = el.querySelector('input:not([type="hidden"]), select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])');
          if (focusable) return true;
        }
        let cur = el.parentElement;
        let depth = 0;
        while (cur && depth < 8) {
          const cls = (cur.className || '').toString();
          if (cls.includes('p-component') || isNativelyFocusable(cur) || hasFocusableTabindex(cur)) {
            const focusable = cur.querySelector('input:not([type="hidden"]), select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])');
            return !!focusable;
          }
          cur = cur.parentElement;
          depth++;
        }
        return false;
      }
      function hasFocusableDescendant(el) {
        return !!el.querySelector(
          'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        );
      }
      // 偵測 roving tabindex 模式：menuitem / option / tab 在 menubar / listbox / tablist 內，
      // 容器自己 focusable（tabindex=0），items 用方向鍵切換 — 不需要每個 item 都有 tabindex
      function isInRovingTabindexContainer(el) {
        const role = (el.getAttribute('role') || '').toLowerCase();
        const itemContainerMap = {
          menuitem: ['menubar', 'menu'],
          menuitemcheckbox: ['menubar', 'menu'],
          menuitemradio: ['menubar', 'menu'],
          option: ['listbox', 'combobox'],
          tab: ['tablist'],
          treeitem: ['tree'],
        };
        const expectedParentRoles = itemContainerMap[role];
        if (!expectedParentRoles) return false;
        let cur = el.parentElement;
        let depth = 0;
        while (cur && depth < 6) {
          const parentRole = (cur.getAttribute('role') || '').toLowerCase();
          if (expectedParentRoles.includes(parentRole)) {
            return isNativelyFocusable(cur) || hasFocusableTabindex(cur);
          }
          cur = cur.parentElement;
          depth++;
        }
        return false;
      }

      function looksClickable(el) {
        const tag = el.tagName;
        // PrimeVue 內部裝飾 span/div — 由元件根節點處理焦點，跳過
        if (isPrimeVueInternal(el)) return false;
        // 內建 click 語意
        if (isNativelyFocusable(el)) return true;
        // ARIA roles
        const role = (el.getAttribute('role') || '').toLowerCase();
        // roving tabindex 模式（menubar/listbox/tablist 內的 items）：跳過
        if (isInRovingTabindexContainer(el)) return false;
        if (['button', 'link', 'menuitem', 'tab', 'checkbox', 'switch', 'radio', 'option'].includes(role)) return true;
        // 對 div/span/li/i/svg 等元素：檢查 cursor:pointer 或屬性中的 @click（Vue source 已轉，但 onclick 仍可能存在）
        if (['DIV', 'SPAN', 'LI', 'I', 'SVG', 'IMG'].includes(tag)) {
          // 若已在某個 focusable 祖先內，不算獨立可互動元素
          if (hasFocusableAncestor(el)) return false;
          // 若在 PrimeVue 元件根內且該元件根內有 focusable，視為元件內部，不報
          if (componentRootHasFocusable(el)) return false;
          // 若內部已有 focusable 子節點（li 包 button、div 包 a 等），鍵盤使用者可 Tab 進到該子節點
          if (hasFocusableDescendant(el)) return false;
          const cs = window.getComputedStyle(el);
          if (cs.cursor === 'pointer') return true;
          if (el.hasAttribute('onclick')) return true;
          // 若 aria-label 或 title 存在且像動作描述，視為可能可互動
          const al = el.getAttribute('aria-label') || el.getAttribute('title') || '';
          if (/[重點選按開關下載打開關閉播放停止暫停儲存提交確認取消刪除]/.test(al)) return true;
        }
        return false;
      }

      const all = Array.from(document.querySelectorAll('*'));
      const offenders = [];
      let inspected = 0;

      for (const el of all) {
        if (!isVisible(el)) continue;
        if (!looksClickable(el)) continue;
        inspected++;
        if (!isReachable(el)) {
          offenders.push({
            selector: selectorOf(el),
            tag: el.tagName,
            role: el.getAttribute('role') || '',
            ariaLabel: el.getAttribute('aria-label') || el.getAttribute('title') || (el.textContent || '').trim().slice(0, 30),
            cursor: window.getComputedStyle(el).cursor,
            tabindex: el.getAttribute('tabindex'),
            cls: (el.className || '').toString().slice(0, 60),
          });
        }
      }

      return { inspected, offenders };
    });

    if (result.offenders.length === 0) {
      return pass(`${result.inspected} 個可互動元素全部鍵盤可達`);
    }
    return fail(
      `${result.offenders.length}/${result.inspected} 個可互動元素無法以鍵盤聚焦`,
      '為這些元素加 tabindex="0" + keydown 處理；或改用 <button> 標籤；或移除 class="hidden" 隱藏式樣',
      result.offenders.slice(0, 15).map(
        (o) => `${o.selector}「${o.ariaLabel}」tabindex=${o.tabindex ?? '(none)'} cursor=${o.cursor}`,
      ),
    );
  } catch (err) {
    return fail(`執行錯誤: ${err.message}`, '');
  }
}

export const metadata = {
  code: NAME,
  criterion: '2.1.1',
  level: 'A',
  category: 'EXTRA',
  rule: RULE,
};
