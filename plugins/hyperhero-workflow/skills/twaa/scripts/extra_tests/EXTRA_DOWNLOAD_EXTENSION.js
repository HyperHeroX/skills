/**
 * EXTRA_DOWNLOAD_EXTENSION — 下載連結必須顯示「檔名.副檔名」
 *
 * 規則：所有下載連結（含 download 屬性或指向常見檔案副檔名的 a[href]），
 *      可視文字必須符合下列任一格式：
 *      - 單一檔案：     檔名.副檔名         （如「身心障礙者就業促進活動補助要點.pdf」）
 *      - 同名多格式：   檔名 ｜ .ext1 ｜ .ext2  （視覺上組合成完整檔名）
 *
 * 此非官方 WCAG / TWAA 條目。GN1320202E 只要求預告檔案格式（不限副檔名形式），
 * 但本系統採此更嚴格規則作為 FreeGo 審查保險。
 *
 * 自動化檢測：
 *   - 找所有下載連結
 *   - 每個連結的 visible text 必須含 .ext 樣式（.pdf|.docx|.odt|...）
 *   - 同 href 為「.ext only」型（純副檔名）視為多格式組件，需相鄰 sibling 出現中文檔名
 */

const NAME = 'EXTRA_DOWNLOAD_EXTENSION';
const RULE = '下載連結顯示為「檔名.副檔名」格式';

const EXT_RE = /\.(pdf|docx?|xlsx?|odt|ods|odp|zip|rar|7z|csv|txt|pptx?|rtf)\b/i;
const EXT_ONLY_RE = /^\.(pdf|docx?|xlsx?|odt|ods|odp|zip|rar|7z|csv|txt|pptx?|rtf)\s*$/i;

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
    const result = await page.evaluate((extPattern) => {
      const re = new RegExp(extPattern, 'i');
      const extOnlyRe = /^\.(pdf|docx?|xlsx?|odt|ods|odp|zip|rar|7z|csv|txt|pptx?|rtf)\s*$/i;

      // 篩選：href 指向檔案 或 有 download 屬性
      const fileExtRe = /\.(pdf|docx?|xlsx?|odt|ods|odp|zip|rar|7z|csv|txt|pptx?|rtf)(\?|$|#)/i;
      const links = [...document.querySelectorAll('a[href]')].filter((a) => {
        if (a.hasAttribute('download')) return true;
        const href = a.getAttribute('href') || '';
        return fileExtRe.test(href);
      }).filter((a) => {
        // 只算可見
        if (a.getAttribute('aria-hidden') === 'true') return false;
        const r = a.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });

      const violations = [];
      const passes = [];
      const groupedByLi = new Map();

      for (const a of links) {
        const text = (a.textContent || '').trim().replace(/\s+/g, ' ');
        const href = a.getAttribute('href') || '';

        // 同名多格式：visible text 為純 ".ext"，需驗證所在 <li> 含中文檔名
        if (extOnlyRe.test(text)) {
          // 找最近的 <li>
          const li = a.closest('li');
          if (!li) {
            violations.push({ text, href, reason: '純 .ext 連結但找不到容器 <li>' });
            continue;
          }
          // <li> textContent 移除所有 .ext 連結文字後仍有可讀檔名
          const liText = (li.textContent || '').trim();
          // 替換每個 .ext token 與分隔符 ｜|/ 後檢查殘餘文字
          const stripped = liText.replace(/[\|｜｜｜]/g, ' ').replace(/\s*\.(pdf|docx?|xlsx?|odt|ods|odp|zip|rar|7z|csv|txt|pptx?|rtf)\b/gi, ' ').trim();
          if (stripped.length < 2) {
            violations.push({ text, href, reason: '同名多格式：<li> 無檔名前綴' });
          } else {
            passes.push({ text, href, format: '同名多格式組件', filename: stripped.slice(0, 50) });
          }
          continue;
        }

        // 單一檔案：text 必須含 .ext
        if (!re.test(text)) {
          violations.push({
            text: text.slice(0, 80),
            href: href.slice(-60),
            reason: '可視文字未顯示副檔名',
          });
        } else {
          passes.push({ text: text.slice(0, 60), href: href.slice(-40), format: '單一檔案' });
        }
      }

      return {
        total_download_links: links.length,
        violations,
        passes_count: passes.length,
        passes_samples: passes.slice(0, 5),
      };
    }, EXT_RE.source);

    if (result.total_download_links === 0) {
      return pass('頁面無下載連結（不適用）');
    }

    if (result.violations.length > 0) {
      return fail(
        `${result.violations.length}/${result.total_download_links} 個下載連結未顯示副檔名`,
        '改寫連結文字為「檔名.副檔名」（如「報表.pdf」）；同名多格式採「檔名 ｜ .pdf ｜ .odt」',
        result.violations.map(v => `${v.reason}：「${v.text}」 → ${v.href}`),
      );
    }

    return pass(
      `${result.total_download_links} 個下載連結全部符合格式`,
      result.passes_samples.map(p => `${p.format}：${p.text}`),
    );
  } catch (err) {
    return fail(`執行錯誤: ${err.message}`, '確認頁面載入完成');
  }
}

export const metadata = {
  code: NAME,
  criterion: '3.2.2',
  level: 'A',
  category: 'EXTRA',
  rule: RULE,
};
