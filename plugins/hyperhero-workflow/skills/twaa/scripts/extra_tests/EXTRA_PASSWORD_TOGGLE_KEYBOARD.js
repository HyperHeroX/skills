/**
 * EXTRA_PASSWORD_TOGGLE_KEYBOARD — 密碼顯示/隱藏 icon 必須鍵盤可達 (GN1210101E)
 *
 * 背景：稽核員 2026-05-13 退件擴充項：密碼欄位旁的眼睛 icon 必須能 Tab 聚焦
 * 並用 Enter / Space 啟動切換。PrimeVue <Password toggle-mask> 預設用
 * <svg aria-hidden="true"> + click handler，鍵盤無法操作。
 *
 * 偵測：
 *   1. 找所有 input[type=password] 或 input[type=text] 在 .p-password 容器內
 *   2. 對每個密碼容器：
 *      a) 找 toggle mask 元素（i / svg / button 含 aria-label/click 或 .p-password-toggle）
 *      b) 驗證該元素 keyboard-reachable：
 *         - 為 native focusable (button/a/input)，或
 *         - 有 tabindex >= 0
 *      c) 嘗試聚焦 + 按 Space，驗證 input.type 切換
 *   3. 若頁面沒有 password 欄位，回 N/A
 */

const NAME = 'EXTRA_PASSWORD_TOGGLE_KEYBOARD';
const RULE = '密碼顯示/隱藏 icon 必須鍵盤可達並可啟動';

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
    const probe = await page.evaluate(() => {
      // 找所有 password 容器 (PrimeVue p-password 或 原生 input[type=password])
      const containers = [
        ...document.querySelectorAll('.p-password'),
      ];
      // 也接受裸 input[type=password]，但通常本系統都包在 p-password 內
      const nativePws = [...document.querySelectorAll('input[type="password"]')]
        .filter((i) => !i.closest('.p-password'))
        .map((i) => i.parentElement)
        .filter(Boolean);
      containers.push(...nativePws);

      if (containers.length === 0) {
        return { skip: true, reason: 'no-password-field' };
      }

      function isFocusable(el) {
        if (!el || el.disabled) return false;
        const ti = el.getAttribute('tabindex');
        if (ti !== null) {
          const n = parseInt(ti, 10);
          return !isNaN(n) && n >= 0;
        }
        const tag = el.tagName;
        return tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      }

      const inspections = [];
      let probeIndex = 0;
      for (const container of containers) {
        // 找 toggle mask icon — PrimeVue 用 svg.p-icon 或 i.pi-eye/.pi-eye-slash，
        // 我們的自製 button 可能含 aria-label 為「顯示密碼/隱藏密碼/show/hide password」
        const candidates = [
          ...container.querySelectorAll('svg.p-icon, i.pi-eye, i.pi-eye-slash, [data-pc-section="hideicon"], [data-pc-section="showicon"], button, [role="button"]'),
        ].filter((el) => {
          // 排除是輸入框內 svg input checkbox 等
          if (el.tagName === 'INPUT') return false;
          // aria-label 含「密碼」「顯示」「隱藏」「password」「show」「hide」也算
          const al = (el.getAttribute('aria-label') || '').toLowerCase();
          if (/密碼|顯示|隱藏|show|hide|toggle|eye/i.test(al)) return true;
          // 含 pi-eye class 或 data-pc-section=hideicon/showicon
          const cls = (el.className || '').toString();
          if (/pi-eye|p-icon/i.test(cls)) return true;
          const sec = el.getAttribute('data-pc-section');
          if (sec === 'hideicon' || sec === 'showicon' || sec === 'maskicon') return true;
          return false;
        });

        if (candidates.length === 0) {
          inspections.push({
            container: container.tagName + '.' + (container.className || '').toString().slice(0, 40),
            verdict: 'no-toggle-found',
          });
          continue;
        }

        // 取第一個可能的 toggle
        const toggle = candidates[0];
        const focusable = isFocusable(toggle);
        toggle.setAttribute('data-pwt-probe', String(probeIndex++));

        inspections.push({
          container: container.tagName + '.' + (container.className || '').toString().slice(0, 40),
          toggleTag: toggle.tagName,
          toggleCls: (toggle.className || '').toString().slice(0, 60),
          ariaLabel: toggle.getAttribute('aria-label') || '',
          tabindex: toggle.getAttribute('tabindex'),
          role: toggle.getAttribute('role') || '',
          focusable,
          probeIdx: probeIndex - 1,
        });
      }

      return { skip: false, inspections };
    });

    if (probe.skip) {
      return pass(`頁面無密碼欄位（${probe.reason}）`);
    }

    if (probe.inspections.length === 0) {
      return pass('未偵測到密碼欄位 — 不適用');
    }

    const offenders = probe.inspections.filter((i) => i.verdict !== undefined || !i.focusable);

    // 動態驗證：對每個 focusable 的 toggle 嘗試 Space 操作
    let dynamicPass = 0;
    let dynamicFail = 0;
    const dynamicDetails = [];
    for (const insp of probe.inspections) {
      if (!insp.focusable) continue;
      try {
        // 標記同個 password container 的 input（probe 元素切換後消失，但 input 不換）
        const inputMarked = await page.evaluate((idx) => {
          const t = document.querySelector(`[data-pwt-probe="${idx}"]`);
          const container = t?.closest('.p-password');
          const input = container?.querySelector('input');
          if (!input) return null;
          input.setAttribute('data-pwt-input', String(idx));
          return input.getAttribute('type');
        }, insp.probeIdx);

        if (!inputMarked) {
          dynamicFail++;
          dynamicDetails.push(`✗ probe#${insp.probeIdx} 找不到對應 input`);
          continue;
        }

        const handle = page.locator(`[data-pwt-probe="${insp.probeIdx}"]`).first();
        if (await handle.count() === 0) continue;

        await handle.focus({ timeout: 2000 });
        await page.waitForTimeout(80);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(200);

        const afterType = await page.evaluate((idx) => {
          const input = document.querySelector(`[data-pwt-input="${idx}"]`);
          return input ? input.getAttribute('type') : null;
        }, insp.probeIdx);

        if (afterType && inputMarked !== afterType) {
          dynamicPass++;
          dynamicDetails.push(`✓ probe#${insp.probeIdx} Enter 後 type: ${inputMarked} → ${afterType}`);
        } else {
          dynamicFail++;
          dynamicDetails.push(`✗ probe#${insp.probeIdx} Enter 後 type 沒變化（${inputMarked} → ${afterType}）`);
        }
      } catch (e) {
        dynamicFail++;
        dynamicDetails.push(`✗ probe#${insp.probeIdx} 操作失敗：${e.message}`);
      }
    }

    // 清掉 probe 標記
    await page.evaluate(() => {
      document.querySelectorAll('[data-pwt-probe], [data-pwt-input]').forEach((el) => {
        el.removeAttribute('data-pwt-probe');
        el.removeAttribute('data-pwt-input');
      });
    });

    if (offenders.length > 0) {
      return fail(
        `${offenders.length}/${probe.inspections.length} 個密碼欄位的顯示/隱藏 icon 鍵盤不可達`,
        '在 PrimeVue Password 上加 :pt 將 hideIcon/showIcon 加 tabindex=0 + role=button + keydown 處理；' +
          '或在 PasswordInput.vue 改用 <button> 包裝 toggle',
        offenders.map(
          (o) => o.verdict === 'no-toggle-found'
            ? `${o.container}：找不到顯示/隱藏 toggle`
            : `${o.container}：${o.toggleTag}.${o.toggleCls} tabindex=${o.tabindex} aria-label=「${o.ariaLabel}」`,
        ),
      );
    }

    if (dynamicFail > 0) {
      return fail(
        `靜態檢查通過 (${probe.inspections.length} 個 toggle focusable)，但 Enter 啟動切換失敗 ${dynamicFail}/${dynamicPass + dynamicFail}`,
        '確認 toggle 元素有監聽 keydown.enter / keydown.space 並呼叫 click() 或切換 type',
        dynamicDetails,
      );
    }

    return pass(
      `${probe.inspections.length} 個密碼 toggle 全鍵盤可達+可啟動` +
        (dynamicPass ? `（Enter 切換 ${dynamicPass}/${dynamicPass + dynamicFail} 驗證）` : ''),
      dynamicDetails,
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
