/**
 * EXTRA_FORM_ERROR_FOCUS — 表單提交錯誤時鍵盤焦點跳至錯誤欄位 (GN2330300E)
 *
 * 背景：稽核員 (2026-05-13) 對 https://dsos.wda.gov.tw/zh-tw/identity/login 抓出
 * 「表單欄位填寫錯誤或未完成時，執行「登入」功能選項後，雖提供文字告知錯誤訊息，
 * 但鍵盤焦點無法跳至錯誤欄位」。
 *
 * 偵測：
 *   1. 找頁面上的主表單（含必填欄位）
 *   2. 清空所有 input 內容
 *   3. 點「送出 / 登入 / 確認」按鈕
 *   4. 等 1.5 秒讓驗證觸發
 *   5. 檢查：
 *      a) 出現 aria-invalid="true" 欄位 ≥ 1（代表驗證已觸發）
 *      b) document.activeElement 為第一個 invalid 欄位
 *
 * 若頁面無表單則回傳 N/A (pass)。
 */

const NAME = 'EXTRA_FORM_ERROR_FOCUS';
const RULE = '表單送出錯誤時鍵盤焦點跳至第一個錯誤欄位';

function pass(message = '', details = []) {
  return { code: NAME, rule: RULE, status: 'pass', message, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: NAME, rule: RULE, status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

const SUBMIT_TEXT_PATTERN = /^(送出|提交|登入|登入系統|sign in|login|submit|確認|確定|註冊|送出表單)$/i;

/**
 * @param {import('playwright').Page} page
 */
export async function check(page) {
  try {
    // 1. 看頁面是否有必填表單欄位
    const formInfo = await page.evaluate(() => {
      const forms = Array.from(document.querySelectorAll('form'));
      const requiredInputs = Array.from(
        document.querySelectorAll(
          'input[required], input[aria-required="true"], textarea[required], select[required]',
        ),
      ).filter((el) => !el.disabled);
      return {
        formCount: forms.length,
        requiredInputCount: requiredInputs.length,
      };
    });

    if (formInfo.requiredInputCount === 0) {
      return pass('頁面無必填表單欄位（N/A）');
    }

    // 2. 清空所有 input
    await page.evaluate(() => {
      document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([disabled])').forEach((el) => {
        if (el.type === 'checkbox' || el.type === 'radio') return;
        el.value = '';
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
    await page.waitForTimeout(200);

    // 3. 找送出按鈕
    const submitBtnHandle = await page.evaluateHandle((pattern) => {
      const re = new RegExp(pattern, 'i');
      // 優先順序：type=submit → 標籤含「登入/送出」字樣的 button → 含 aria-label
      const submits = Array.from(document.querySelectorAll('button[type="submit"], input[type="submit"]'));
      const visibleSubmit = submits.find((b) => {
        const r = b.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && !b.disabled;
      });
      if (visibleSubmit) return visibleSubmit;

      const allBtns = Array.from(document.querySelectorAll('button, [role="button"]'));
      for (const b of allBtns) {
        const r = b.getBoundingClientRect();
        if (r.width === 0 || b.disabled) continue;
        const txt = (b.textContent || '').trim();
        const al = b.getAttribute('aria-label') || '';
        if (re.test(txt) || re.test(al)) return b;
      }
      return null;
    }, SUBMIT_TEXT_PATTERN.source);

    const submitExists = await submitBtnHandle.evaluate((b) => !!b);
    if (!submitExists) {
      return pass('頁面有必填欄位但找不到送出按鈕（N/A — 可能為唯讀頁面）');
    }

    // 4. 點送出
    await submitBtnHandle.click({ force: true, timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1200);

    // 4.5. 如果出現驗證錯誤對話框，按 ESC 或點「確定」關掉
    //      審查員實際操作：按下 dialog 確定後才看焦點 — 真正的 GN2330300E 要求
    const dialogClosed = await page.evaluate(() => {
      // 找 PrimeVue 對話框內的「確定 / OK / 送出」按鈕
      const dlgFooterBtns = [...document.querySelectorAll('.p-dialog .p-dialog-footer button')];
      const okBtn = dlgFooterBtns.find((b) => {
        const t = (b.textContent || '').trim();
        return /^(確定|確認|OK|是|送出)$/i.test(t);
      }) || dlgFooterBtns[dlgFooterBtns.length - 1]; // fallback: 最後一個 (通常是主動作)
      if (okBtn) {
        (okBtn).click();
        return true;
      }
      return false;
    });
    if (dialogClosed) {
      await page.waitForTimeout(500); // 等 dialog 動畫關閉 + 我們的 setTimeout 150ms 焦點還原
    }

    // 5. 檢查 invalid + focus
    //    多重錯誤情境（GN2330300E 嚴格要求）：焦點應在「由上至下、由左至右」第一個錯誤欄位
    //    錯誤指標來源：aria-invalid="true" / .p-invalid 類別 / 鄰近含 error 訊息容器
    const result = await page.evaluate(() => {
      // 收集所有可能標示錯誤的欄位元素
      function isVisible(el) {
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) return false;
        const cs = window.getComputedStyle(el);
        return cs.visibility !== 'hidden' && cs.display !== 'none';
      }

      // 步驟 A：所有 input/select/textarea 中具錯誤指標的
      const formControls = [...document.querySelectorAll('input, select, textarea')];
      const errorFields = formControls
        .filter((el) => !el.disabled && isVisible(el))
        .filter((el) => {
          if (el.getAttribute('aria-invalid') === 'true') return true;
          if ((el.className || '').toString().includes('p-invalid')) return true;
          // PrimeVue 把 .p-invalid 套在 wrapper（div.p-password、div.p-dropdown 等），
          // 順著最近祖先 .p-component 看
          const wrapper = el.closest('.p-component, .p-inputwrapper');
          if (wrapper && (wrapper.className || '').toString().includes('p-invalid')) return true;
          return false;
        });

      // 步驟 B：按 DOM 座標排序（top-to-bottom，同列 left-to-right）
      errorFields.sort((a, b) => {
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        if (Math.abs(ra.top - rb.top) > 5) return ra.top - rb.top;
        return ra.left - rb.left;
      });

      const firstInvalid = errorFields[0];
      const active = document.activeElement;
      const activeIsFirstInvalid = firstInvalid && (
        active === firstInvalid ||
        // PrimeVue Password 等元件焦點落在內部 input，外層 wrapper 才標 .p-invalid
        (firstInvalid.contains && firstInvalid.contains(active)) ||
        (active && active.closest && active.closest('.p-invalid') === firstInvalid)
      );

      function describe(el) {
        if (!el) return '(none)';
        const id = el.id || el.getAttribute('name') || '';
        const label = el.getAttribute('aria-label') || el.getAttribute('placeholder') || '';
        const r = el.getBoundingClientRect();
        return `${el.tagName}#${id}「${label}」 top=${Math.round(r.top)} left=${Math.round(r.left)}`;
      }

      return {
        invalidCount: errorFields.length,
        firstInvalid: describe(firstInvalid),
        active: describe(active),
        activeIsFirstInvalid,
      };
    });

    if (result.invalidCount === 0) {
      return fail(
        '送出空表單後沒有任何錯誤標記（aria-invalid="true" / .p-invalid）— 驗證未觸發或未綁定 :aria-invalid',
        'VeeValidate 或對應驗證函式應在送出時呼叫 validate()，並對每個未通過欄位設 :aria-invalid 與 :class="[{ p-invalid: ... }]"',
        [`active=${result.active}`],
      );
    }

    if (!result.activeIsFirstInvalid) {
      return fail(
        `驗證觸發 ${result.invalidCount} 個錯誤欄位，但鍵盤焦點未跳至「由上至下、由左至右」第一個錯誤欄位` +
          `（應為 ${result.firstInvalid}，實際 ${result.active}）`,
        '檢查 (1) 每個欄位的 :aria-invalid 是否綁對 vr.<該欄位>.errors（複製貼上時容易綁錯到別的欄位）'
          + ' (2) Dialog @hide → focusFirstInvalid() 是否觸發 (3) focusFirstInvalid 是否按 DOM 順序找',
        [
          `firstInvalid=${result.firstInvalid}`,
          `active=${result.active}`,
        ],
      );
    }

    return pass(
      `送出空表單後，${result.invalidCount} 個錯誤欄位，焦點正確在 DOM 第一個錯誤欄位（${result.firstInvalid}）`,
    );
  } catch (err) {
    return fail(`執行錯誤: ${err.message}`, '');
  }
}

export const metadata = {
  code: NAME,
  criterion: '3.3.3',
  level: 'AA',
  category: 'EXTRA',
  rule: RULE,
};
