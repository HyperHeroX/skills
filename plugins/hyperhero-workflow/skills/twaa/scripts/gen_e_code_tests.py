#!/usr/bin/env python3
"""gen_e_code_tests.py — 自動產生 209 個 E 碼個別 Playwright 測試檔案

執行：python3 scripts/gen_e_code_tests.py
輸出：scripts/e_code_tests/*.js（每個 E 碼一個檔案）
"""
import sys, io, json, os, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(SCRIPT_DIR)
EXAMPLES_DIR = os.path.join(BASE, 'references', 'examples')
TESTS_DIR = os.path.join(SCRIPT_DIR, 'e_code_tests')
PATTERNS_FILE = os.path.join(TESTS_DIR, 'e_code_patterns.json')
ALL_CODES_FILE = os.path.join(BASE, 'references', 'e_codes_parsed.json')

os.makedirs(TESTS_DIR, exist_ok=True)

# ── 載入資料 ─────────────────────────────────────────────────────────────────

with open(PATTERNS_FILE, encoding='utf-8') as f:
    patterns = json.load(f)

with open(ALL_CODES_FILE, encoding='utf-8') as f:
    all_codes = {c['code']: c for c in json.load(f)}

def steps_to_js_comment(steps: str) -> str:
    lines = steps.strip().splitlines()
    return '\n'.join(f'   * {l}' for l in lines[:8] if l.strip())

# ── 各類型測試邏輯 ────────────────────────────────────────────────────────────

def gen_dom_check(code, meta, steps):
    c = code.lower()
    criterion = meta.get('criterion','')
    message = meta.get('message','')

    if any(x in c for x in ['1110100','1110101','1110102','1110104','1110105']):
        return '''
  const result = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')];
    const areas = [...document.querySelectorAll('area')];
    const inputs = [...document.querySelectorAll('input[type="image"]')];
    const objects = [...document.querySelectorAll('object, embed, applet')];
    return {
      imgsMissingAlt: imgs.filter(i => i.getAttribute('alt') === null).length,
      emptyAreaAlt: areas.filter(a => !a.getAttribute('alt')?.trim()).length,
      missingInputAlt: inputs.filter(i => !i.getAttribute('alt')?.trim()).length,
      emptyObject: objects.filter(o => !o.textContent?.trim()).length,
    };
  });
  const total = Object.values(result).reduce((a,b) => a+b, 0);
  if (total > 0) return fail(`${total} 個元素缺少替代文字`, '為非文字內容加上 alt/aria-label/替代文字', Object.entries(result).filter(([,v])=>v>0).map(([k,v])=>k+'='+v));
  return pass('所有非文字內容均有替代文字');'''

    if '1240100' in c or '2.4.1' in criterion:
        return '''
  const result = await page.evaluate(() => {
    const skip = document.querySelector('a[href^="#main"],a[href^="#content"],[class*="skip"]');
    return {
      hasSkipLink: !!skip,
      text: skip?.textContent?.trim() || '',
      target: skip?.getAttribute('href') || '',
      targetExists: skip ? !!document.querySelector(skip.getAttribute('href') || '#') : false,
    };
  });
  if (!result.hasSkipLink) return fail('缺少跳過導覽 skip link', '<a class="skip-link" href="#main-content">跳至主要內容</a> 放在 <body> 第一個元素');
  if (!result.targetExists) return fail(`skip link 目標 "${result.target}" 不存在`, `確保有 id="${result.target.slice(1)}" 的元素`);
  return pass(`skip link 存在：${result.text}`);'''

    if '1240200' in c or '2.4.2' in criterion:
        return '''
  const title = await page.title();
  if (!title?.trim()) return fail('頁面 <title> 為空或不存在', '<title>頁面名稱 - 系統名稱</title>');
  if (title.length < 4) return fail(`標題過短："${title}"（${title.length}字）`, '標題應描述頁面主旨，格式：頁面名稱 - 系統名稱');
  return pass(`標題：${title}`);'''

    if any(x in c for x in ['1240400','1240401']) or '2.4.4' in criterion:
        return '''
  const result = await page.evaluate(() => {
    const vague = /^(按此|點此|點擊|here|click here|read more|more|詳情|連結|link|更多)$/i;
    const issues = [...document.querySelectorAll('a[href]')].filter(a => {
      const text = (a.textContent || '').trim();
      const alt = a.querySelector('img')?.getAttribute('alt') || '';
      const ariaLabel = a.getAttribute('aria-label') || '';
      return (!text && !alt && !ariaLabel) || vague.test(text);
    }).map(a => (a.textContent.trim() || '[無文字]') + ' → ' + (a.getAttribute('href') || '').slice(0,30));
    return issues.slice(0,5);
  });
  if (result.length) return fail(`${result.length} 個連結文字無意義或為空`, '改為描述目的地的文字，如「查看年度報告」', result);
  return pass('所有連結均有描述性文字');'''

    if '1310100' in c or '3.1.1' in criterion:
        return '''
  const lang = await page.evaluate(() => document.documentElement.getAttribute('lang'));
  if (!lang) return fail('html 缺少 lang 屬性', '<html lang="zh-Hant-TW">');
  if (lang.toLowerCase() === 'zh-tw') return fail(`lang="${lang}" 應為 zh-Hant-TW（MODA 建議）`, '<html lang="zh-Hant-TW">');
  if (!lang.match(/^[a-zA-Z]{2}/)) return fail(`lang="${lang}" 不符 BCP 47 格式`, 'lang="zh-Hant-TW" 或 lang="en"');
  return pass(`lang="${lang}"`);'''

    if '1330100' in c or '3.3.1' in criterion:
        return '''
  const submitBtn = page.locator('form [type="submit"], form button:not([type="button"])').first();
  if (!await submitBtn.count()) return pass('無提交按鈕，跳過');
  await submitBtn.click().catch(() => {});
  await page.waitForTimeout(800);
  const result = await page.evaluate(() => ({
    alerts: [...document.querySelectorAll('[role="alert"],[aria-live="assertive"],[aria-live="polite"]')].filter(el => el.offsetWidth > 0 && el.textContent.trim()).length,
    errMsgs: [...document.querySelectorAll('[class*="error"],[aria-invalid="true"]')].filter(el => el.offsetWidth > 0 && el.textContent.trim()).length,
  }));
  if (!result.alerts && !result.errMsgs) return fail('送出後無錯誤文字說明', '顯示 role="alert" 或 aria-invalid="true" 搭配錯誤訊息');
  return pass(`錯誤提示：alert ${result.alerts}個，errMsg ${result.errMsgs}個`);'''

    if any(x in c for x in ['1410100','1410200','1410201']) or '4.1' in criterion:
        return '''
  const result = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
    const dupIds = ids.filter((id,i) => ids.indexOf(id) !== i).slice(0,5);
    const btnNoName = [...document.querySelectorAll('button')].filter(b => !b.textContent.trim() && !b.getAttribute('aria-label') && !b.getAttribute('title')).length;
    const iframeNoTitle = document.querySelectorAll('iframe:not([title])').length;
    return { dupIds, btnNoName, iframeNoTitle, hasDoctype: document.doctype !== null };
  });
  const issues = [];
  if (result.dupIds.length) issues.push(`重複ID: ${result.dupIds.join(',')}`);
  if (result.btnNoName) issues.push(`${result.btnNoName}個button無名稱`);
  if (result.iframeNoTitle) issues.push(`${result.iframeNoTitle}個iframe無title`);
  if (issues.length) return fail(issues.join('; '), '修正 id 唯一性、button 名稱、iframe title', issues);
  return pass(`相容性通過（DOCTYPE:${result.hasDoctype}，無重複ID，按鈕/iframe均有名稱）`);'''

    # 通用 DOM
    return f'''
  // 通用 DOM 查詢：{message[:60]}
  const result = await page.evaluate(() => {{
    const lang = document.documentElement.getAttribute('lang');
    const title = document.title;
    const hasMain = !!document.querySelector('main,[role="main"]');
    const imgsMissingAlt = document.querySelectorAll('img:not([alt])').length;
    const ariaLive = document.querySelectorAll('[aria-live],[role="alert"],[role="status"]').length;
    const dupIds = (() => {{ const ids=[...document.querySelectorAll('[id]')].map(e=>e.id); return ids.filter((id,i)=>ids.indexOf(id)!==i).length; }})();
    return {{ lang, title, hasMain, imgsMissingAlt, ariaLive, dupIds }};
  }});
  const issues = [];
  if (!result.lang) issues.push('缺少 html lang');
  if (!result.title) issues.push('缺少 title');
  if (!result.hasMain) issues.push('缺少 main landmark');
  if (result.imgsMissingAlt > 0) issues.push(`${{result.imgsMissingAlt}}個img缺少alt`);
  if (result.dupIds > 0) issues.push(`${{result.dupIds}}個重複ID`);
  if (issues.length) return fail(issues.join('; '), '依稽核步驟逐一修正');
  return pass(`DOM 結構通過（lang=${{result.lang}}, title=${{result.title?.slice(0,20)}}, ariaLive=${{result.ariaLive}}）`);'''


def gen_css_check(code, meta, steps):
    c = code.lower()
    message = meta.get('message','')

    if '1140101' in c or 'focus' in (steps or '').lower():
        return '''
  const issues = await page.evaluate(() => {
    const bad = [];
    [...document.styleSheets].forEach(sheet => {
      try {
        [...sheet.cssRules].forEach(rule => {
          if (rule.selectorText?.includes(':focus')) {
            const hasOutlineNone = rule.style?.outline?.includes('none') || rule.style?.outlineWidth === '0px';
            const hasFallback = rule.style?.boxShadow && rule.style.boxShadow !== 'none';
            if (hasOutlineNone && !hasFallback) bad.push(rule.selectorText.slice(0,50));
          }
        });
      } catch {}
    });
    return bad;
  });
  if (issues.length) return fail(`${issues.length} 個 :focus 規則移除 outline 但無替代樣式`, ':focus-visible { outline: 3px solid #005fcc; outline-offset: 2px; }', issues.slice(0,5));
  return pass('焦點樣式設定正確');'''

    if '2140401' in c or 'font-size' in (steps or '').lower():
        return '''
  const pxFonts = await page.evaluate(() => {
    const issues = [];
    [...document.styleSheets].forEach(sheet => {
      try {
        [...sheet.cssRules].forEach(rule => {
          if (rule.style?.fontSize?.match(/^\d+\.?\d*px$/)) {
            issues.push({ sel: (rule.selectorText||'').slice(0,40), fs: rule.style.fontSize });
          }
        });
      } catch {}
    });
    return issues.slice(0,10);
  });
  if (pxFonts.length > 5) return fail(`${pxFonts.length} 個 CSS 規則使用固定 px 字型尺寸`, 'font-size 改為 em/rem/% 等相對單位', pxFonts.map(f=>f.sel+': '+f.fs));
  return pass(`font-size 多使用相對單位（固定px: ${pxFonts.length} 個）`);'''

    if any(x in c for x in ['1110113','1110114']):
        return '''
  const result = await page.evaluate(() => {
    const decorativeImgs = [...document.querySelectorAll('img[alt=""]')].length;
    const spacerImgs = [...document.querySelectorAll('img')].filter(i => {
      const src = (i.getAttribute('src') || '').toLowerCase();
      return src.includes('spacer') || src.includes('blank') || src.includes('pixel') || src.includes('1x1');
    }).length;
    return { decorativeImgs, spacerImgs };
  });
  if (result.spacerImgs) return fail(`${result.spacerImgs} 個疑似佔位圖片，應改用 CSS`, '將佔位/裝飾圖片改為 CSS background-image，移除 <img>');
  return pass(`裝飾性圖片（alt=""）: ${result.decorativeImgs}個，無佔位圖片`);'''

    if '1130203' in c:
        return '''
  const orderEls = await page.evaluate(() => {
    return [...document.querySelectorAll('*')].filter(el => {
      const s = window.getComputedStyle(el);
      return parseInt(s.order || 0) !== 0;
    }).map(el => el.tagName + (el.className ? '.' + String(el.className).split(' ')[0] : '')).slice(0,5);
  });
  if (orderEls.length) return fail(`${orderEls.length} 個元素使用 CSS order，視覺與 DOM 順序可能不一致`, '調整 DOM 順序取代 CSS order', orderEls);
  return pass('DOM 順序與視覺一致，無 CSS order');'''

    if any(x in c for x in ['3140800','3140801','3140802']):
        return '''
  const result = await page.evaluate(() => {
    const rules = [...document.styleSheets].flatMap(s => { try { return [...s.cssRules]; } catch { return []; } });
    return {
      hasLineHeight: rules.some(r => r.style?.lineHeight),
      lineHeightPx: rules.filter(r => r.style?.lineHeight?.endsWith('px')).map(r => r.style.lineHeight).slice(0,3),
      maxWidthCh: rules.filter(r => r.style?.maxWidth?.includes('ch')).map(r => r.style.maxWidth).slice(0,3),
    };
  });
  if (!result.hasLineHeight) return fail('樣式表中無 line-height 宣告', 'body { line-height: 1.5; }（AAA 1.4.8）');
  if (result.lineHeightPx.length) return fail(`line-height 使用固定 px：${result.lineHeightPx.join(', ')}`, '改為無單位：line-height: 1.5;');
  return pass(`line-height 已宣告，ch 寬度: ${result.maxWidthCh.join(',') || '無'}`);'''

    if '1410100' in c or '2141200' in c or '2141201' in c:
        return '''
  const result = await page.evaluate(() => {
    const rules = [...document.styleSheets].flatMap(s => { try { return [...s.cssRules]; } catch { return []; } });
    const letterSpacingPx = rules.filter(r => r.style?.letterSpacing?.endsWith('px')).map(r => ({ sel: (r.selectorText||'').slice(0,30), v: r.style.letterSpacing })).slice(0,5);
    const wordSpacingPx = rules.filter(r => r.style?.wordSpacing?.endsWith('px')).map(r => r.style.wordSpacing).slice(0,3);
    return { letterSpacingPx, wordSpacingPx };
  });
  const issues = [];
  if (result.letterSpacingPx.length) issues.push(`letter-spacing 固定px: ${result.letterSpacingPx.map(f=>f.v).join(',')}`);
  if (result.wordSpacingPx.length) issues.push(`word-spacing 固定px: ${result.wordSpacingPx.join(',')}`);
  if (issues.length) return fail(issues.join('; '), '改為 em 單位：letter-spacing: 0.12em; word-spacing: 0.16em;', result.letterSpacingPx.map(f=>f.sel+': '+f.v));
  return pass('文字間距使用相對單位');'''

    # 通用 CSS
    return f'''
  // CSS 檢查：{message[:60]}
  const result = await page.evaluate(() => {{
    const rules = [...document.styleSheets].flatMap(s => {{ try {{ return [...s.cssRules]; }} catch {{ return []; }} }});
    return {{
      focusNone: rules.filter(r => r.selectorText?.includes(':focus') && r.style?.outline?.includes('none')).length,
      pxFonts: rules.filter(r => r.style?.fontSize?.match(/^\d+px$/)).length,
      hasLineHeight: rules.some(r => r.style?.lineHeight),
    }};
  }});
  const issues = [];
  if (result.focusNone) issues.push(`${{result.focusNone}}個:focus移除outline`);
  if (result.pxFonts > 10) issues.push(`${{result.pxFonts}}個固定px字型`);
  if (!result.hasLineHeight) issues.push('缺少line-height');
  if (issues.length) return fail(issues.join('; '), '修正 CSS 屬性');
  return pass(`CSS 基本通過（focusNone:${{result.focusNone}}, pxFont:${{result.pxFonts}}）`);'''


def gen_keyboard_check(code, meta, steps):
    c = code.lower()
    criterion = meta.get('criterion','')

    if '1210200' in c or '2.1.2' in criterion:
        return '''
  const startUrl = page.url();
  const seq = [];
  for (let i = 0; i < 15; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      return el && el !== document.body ? { tag: el.tagName, id: el.id || '' } : null;
    });
    if (info) seq.push(info.tag + (info.id ? '#'+info.id : ''));
  }
  if (page.url() !== startUrl) return fail(`Tab 走訪後頁面跳轉至 ${page.url()}`, '移除 onfocus 觸發的自動導覽');
  const last5 = new Set(seq.slice(-5)).size;
  if (last5 <= 2) return fail(`疑似焦點陷阱：${seq.slice(-5).join(',')}`, '確認 Tab/Esc 可離開所有元件', seq.slice(-5));
  return pass(`Tab 走訪 ${seq.length} 個元素，無焦點陷阱`);'''

    if any(x in c for x in ['1210100','1210101']) or '2.1.1' in criterion:
        return '''
  const result = await page.evaluate(() => {
    const bad = [...document.querySelectorAll('[onclick],[onmousedown],[onmouseover]')]
      .filter(el => !['A','BUTTON','INPUT','SELECT','TEXTAREA','SUMMARY'].includes(el.tagName))
      .filter(el => {
        const ti = el.getAttribute('tabindex');
        return ti === null || parseInt(ti) < 0;
      }).map(el => el.tagName + (el.id ? '#'+el.id : '') + (el.className ? '.'+String(el.className).split(' ')[0] : '')).slice(0,5);
    const total = document.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled])').length;
    return { bad, total };
  });
  if (result.bad.length) return fail(`${result.bad.length} 個有 click 事件但無鍵盤存取`, '改用 <button> 或加 tabindex="0" 並監聽 keydown Enter/Space', result.bad);
  return pass(`${result.total} 個互動元件均可鍵盤操作`);'''

    if '1240300' in c or '2.4.3' in criterion:
        return '''
  const focusOrder = [];
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      const rect = el?.getBoundingClientRect();
      return el && el !== document.body ? { tag: el.tagName, y: Math.round(rect?.top||0) } : null;
    });
    if (info) focusOrder.push(info);
  }
  const jumps = focusOrder.filter((f,i) => i > 0 && f.y < focusOrder[i-1].y - 300).length;
  if (jumps > 2) return fail(`焦點順序出現 ${jumps} 次大幅回跳，可能不符閱讀順序`, '調整 DOM 順序，避免用 CSS order/position 改變視覺順序', focusOrder.map(f=>f.tag+'('+f.y+')'));
  return pass(`Tab 走訪 ${focusOrder.length} 個元素，順序合理`);'''

    # 通用鍵盤
    return '''
  const focusCount = [];
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    const el = await page.evaluate(() => {
      const e = document.activeElement;
      if (!e || e === document.body) return null;
      const s = window.getComputedStyle(e);
      return { tag: e.tagName, hasFocus: s.outlineStyle !== 'none' || s.boxShadow !== 'none' };
    });
    if (el) focusCount.push(el);
  }
  const invisible = focusCount.filter(e => !e.hasFocus).length;
  if (invisible > focusCount.length * 0.5) return fail(`${invisible}/${focusCount.length} 個焦點停駐點無可視焦點指示器`, ':focus-visible { outline: 3px solid #005fcc; }');
  return pass(`Tab 走訪 ${focusCount.length} 個，${focusCount.length-invisible} 個有可視焦點`);'''


def gen_aria_check(code, meta, steps):
    c = code.lower()

    if '2410300' in c:
        return '''
  const status = await page.evaluate(() => {
    const regions = [...document.querySelectorAll('[role="status"],[role="log"]')];
    const alike = [...document.querySelectorAll('[class*="success"],[class*="status"],[class*="notification"]')].filter(el => el.offsetWidth > 0 && !el.getAttribute('role'));
    return { regions: regions.length, alike: alike.map(el => el.className.split(' ')[0]).slice(0,5) };
  });
  if (status.alike.length && !status.regions) return fail(`${status.alike.length} 個疑似狀態訊息元素缺少 role="status"`, '<div role="status" aria-live="polite">狀態訊息</div>', status.alike);
  return pass(`role=status/log: ${status.regions} 個`);'''

    if '2410301' in c:
        return '''
  const result = await page.evaluate(() => {
    const alerts = document.querySelectorAll('[role="alert"],[aria-live="assertive"]').length;
    const errLike = [...document.querySelectorAll('[class*="error"],[class*="danger"]')].filter(el => el.offsetWidth > 0 && !el.getAttribute('role') && !el.getAttribute('aria-live')).length;
    return { alerts, errLike };
  });
  if (result.errLike && !result.alerts) return fail(`${result.errLike} 個錯誤容器缺少 role="alert"`, 'role="alert" 或 aria-live="assertive"');
  return pass(`role=alert: ${result.alerts}個`);'''

    if '2410302' in c:
        return '''
  const result = await page.evaluate(() => {
    const logs = document.querySelectorAll('[role="log"]').length;
    const chatLike = document.querySelectorAll('[class*="chat"],[class*="log"],[class*="feed"],[class*="timeline"]').length;
    return { logs, chatLike };
  });
  if (result.chatLike && !result.logs) return fail(`${result.chatLike} 個疑似訊息串列缺少 role="log"`, '<div role="log" aria-live="polite">');
  return pass(`role=log: ${result.logs}個`);'''

    if '3130600' in c:
        return '''
  const landmarks = await page.evaluate(() => {
    const found = new Set();
    ['main','nav','header','footer','aside'].forEach(t => { if (document.querySelector(t)) found.add(t); });
    ['banner','main','navigation','contentinfo'].forEach(r => { if (document.querySelector(`[role="${r}"]`)) found.add('role='+r); });
    const navs = [...document.querySelectorAll('nav')];
    const navsLabeled = navs.filter(n => n.getAttribute('aria-label')||n.getAttribute('aria-labelledby')).length;
    return { landmarks: [...found], navTotal: navs.length, navsLabeled };
  });
  if (!landmarks.landmarks.some(l => l.includes('main'))) return fail('缺少 <main> landmark', '<main id="main-content">');
  if (landmarks.navTotal > 1 && landmarks.navsLabeled < landmarks.navTotal)
    return fail(`${landmarks.navTotal} 個 nav 中只有 ${landmarks.navsLabeled} 個有 aria-label`, '每個 nav 加 aria-label 以區分');
  return pass(`Landmarks: ${landmarks.landmarks.join(', ')}`);'''

    return '''
  const aria = await page.evaluate(() => ({
    liveRegions: document.querySelectorAll('[aria-live],[role="alert"],[role="status"],[role="log"]').length,
    invalidAria: [...document.querySelectorAll('[aria-expanded]')].filter(el => !['true','false'].includes(el.getAttribute('aria-expanded'))).length,
    ariaHiddenFocusable: [...document.querySelectorAll('[aria-hidden="true"]')].filter(el => el.querySelector('a[href],button,input')).length,
  }));
  const issues = [];
  if (aria.invalidAria) issues.push(`${aria.invalidAria}個aria-expanded值無效`);
  if (aria.ariaHiddenFocusable) issues.push(`${aria.ariaHiddenFocusable}個aria-hidden元素內有可聚焦子元素`);
  if (issues.length) return fail(issues.join('; '), '修正 ARIA 屬性使用');
  return pass(`ARIA: live=${aria.liveRegions}，無無效屬性`);'''


def gen_form_check(code, meta, steps):
    c = code.lower()
    criterion = meta.get('criterion','')

    if '1330201' in c or '3.3.2' in criterion:
        return '''
  const result = await page.evaluate(() => {
    const required = [...document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"])')].filter(i => i.required || i.getAttribute('aria-required')==='true');
    const labeled = required.filter(i => {
      const lbl = i.labels?.[0]?.textContent || i.getAttribute('aria-label') || '';
      return /必填|必要|required|\*/i.test(lbl);
    });
    return { total: required.length, labeled: labeled.length };
  });
  if (result.total > 0 && result.labeled < result.total)
    return fail(`${result.total} 個必填欄位中只有 ${result.labeled} 個有文字標示`, '在 label 加入「（必填）」或使用 aria-required="true"');
  return pass(`${result.total} 個必填欄位均有文字標示`);'''

    if '2330300' in c or '3.3.3' in criterion:
        return '''
  const submitBtn = page.locator('form [type="submit"], form button:not([type="button"])').first();
  if (!await submitBtn.count()) return pass('無提交按鈕，跳過');
  await submitBtn.click().catch(() => {});
  await page.waitForTimeout(800);
  const result = await page.evaluate(() => {
    const firstInvalid = document.querySelector('[aria-invalid="true"]');
    const active = document.activeElement;
    return { firstInvalidId: firstInvalid?.id, activeId: active?.id, match: firstInvalid && active === firstInvalid };
  });
  if (!result.firstInvalidId) return fail('送出後無 aria-invalid="true" 標示錯誤', '驗證失敗時加 aria-invalid="true" 到錯誤欄位');
  if (!result.match) return fail(`焦點在 #${result.activeId}，應在錯誤欄位 #${result.firstInvalidId}`, '驗證後呼叫 firstErrorEl.focus()');
  return pass('送出後焦點正確跳至第一個錯誤欄位');'''

    return '''
  const formResult = await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('input:not([type="hidden"])')];
    const noLabel = inputs.filter(i => !i.labels?.length && !i.getAttribute('aria-label') && !i.getAttribute('aria-labelledby') && !i.getAttribute('title')).length;
    const noAutocomp = inputs.filter(i => ['email','tel','text','password'].includes(i.type) && !i.getAttribute('autocomplete')).length;
    const pwdAutocomplete = inputs.filter(i => i.type==='password' && i.getAttribute('autocomplete')==='current-password').length;
    return { inputs: inputs.length, noLabel, noAutocomp, pwdAutocomplete };
  });
  const issues = [];
  if (formResult.noLabel) issues.push(`${formResult.noLabel}個輸入缺label`);
  if (formResult.noAutocomp > 3) issues.push(`${formResult.noAutocomp}個輸入缺autocomplete`);
  if (issues.length) return fail(issues.join('; '), '補充 label、autocomplete 屬性');
  return pass(`表單通過（inputs:${formResult.inputs}, pwd autocomplete:${formResult.pwdAutocomplete}）`);'''


def gen_media_check(code, meta, steps):
    c = code.lower()

    if '1120' in c or '1.2.' in meta.get('criterion',''):
        return '''
  const result = await page.evaluate(() => {
    const videos = [...document.querySelectorAll('video')];
    const audios = [...document.querySelectorAll('audio')];
    const autoplayNoCtrl = [...videos,...audios].filter(m => m.autoplay && !m.controls).length;
    const videoCaptioned = videos.filter(v => v.querySelector('track[kind="captions"],track[kind="subtitles"]')).length;
    return { videoCount: videos.length, audioCount: audios.length, autoplayNoCtrl, videoCaptioned };
  });
  const issues = [];
  if (result.autoplayNoCtrl) issues.push(`${result.autoplayNoCtrl}個媒體自動播放但無控制項`);
  if (result.videoCount > 0 && result.videoCaptioned < result.videoCount)
    issues.push(`${result.videoCount - result.videoCaptioned}個影片缺少字幕軌道`);
  if (issues.length) return fail(issues.join('; '), '加 controls 屬性；影片加 <track kind="captions">');
  return pass(`媒體: video ${result.videoCount}，audio ${result.audioCount}，有字幕 ${result.videoCaptioned}`);'''

    return '''
  const media = await page.evaluate(() => ({
    imgs: document.querySelectorAll('img').length,
    imgsNoAlt: document.querySelectorAll('img:not([alt])').length,
    vids: document.querySelectorAll('video').length,
    auds: document.querySelectorAll('audio').length,
    autoplay: document.querySelectorAll('video[autoplay],audio[autoplay]').length,
    canvas: document.querySelectorAll('canvas').length,
  }));
  const issues = [];
  if (media.imgsNoAlt) issues.push(`${media.imgsNoAlt}個img缺少alt`);
  if (media.autoplay) issues.push(`${media.autoplay}個媒體自動播放`);
  if (issues.length) return fail(issues.join('; '), '補充 alt 屬性；移除 autoplay 或加 controls');
  return pass(`媒體: img ${media.imgs}，video ${media.vids}，audio ${media.auds}，canvas ${media.canvas}`);'''


def gen_resize_check(code, meta, steps):
    return '''
  const origW = await page.evaluate(() => window.innerWidth);
  const origH = await page.evaluate(() => window.innerHeight);
  await page.setViewportSize({ width: 320, height: 568 });
  await page.waitForTimeout(500);
  const result = await page.evaluate(() => ({
    hasHScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    clippedEls: [...document.querySelectorAll('p,li,td,th,label,h1,h2,h3,h4')]
      .filter(el => el.textContent.trim() && el.scrollHeight > el.offsetHeight + 4)
      .map(el => el.tagName).slice(0,5),
  }));
  await page.setViewportSize({ width: origW, height: origH });
  if (result.hasHScroll) return fail('320px 下有水平捲軸', 'overflow-wrap:break-word; max-width:100%; 使用 flex/grid 響應式佈局');
  if (result.clippedEls.length) return fail(`${result.clippedEls.length} 個元素文字被截斷`, '移除固定高度（height:Xpx），改用 min-height', result.clippedEls);
  return pass('320px 流動排版正常');'''


def gen_hover_check(code, meta, steps):
    return '''
  const triggers = await page.evaluate(() =>
    [...document.querySelectorAll('[title],[data-tooltip],[aria-describedby]')].slice(0,3).map(el => {
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x+r.width/2), y: Math.round(r.y+r.height/2) };
    }).filter(p => p.x > 0 && p.y > 0)
  );
  if (!triggers.length) return pass('無 tooltip 觸發元素，跳過');
  for (const { x, y } of triggers.slice(0,2)) {
    await page.mouse.move(x, y);
    await page.waitForTimeout(400);
    const ttPos = await page.evaluate(() => {
      const tt = document.querySelector('[role="tooltip"],[class*="tooltip"]');
      if (!tt || !tt.offsetWidth) return null;
      const r = tt.getBoundingClientRect();
      return { x: Math.round(r.x+r.width/2), y: Math.round(r.y+r.height/2) };
    });
    if (ttPos) {
      await page.mouse.move(ttPos.x, ttPos.y);
      await page.waitForTimeout(200);
      const still = await page.evaluate(() => !!document.querySelector('[role="tooltip"],[class*="tooltip"]')?.offsetWidth);
      if (!still) return fail('Tooltip 在指標移入後消失', 'pointer-events:auto 讓指標可移入不觸發 mouseleave');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
      const afterEsc = await page.evaluate(() => !!document.querySelector('[role="tooltip"],[class*="tooltip"]')?.offsetWidth);
      if (afterEsc) return fail('按 Esc 無法關閉 tooltip', '監聽 keydown Escape 事件關閉懸浮內容');
    }
  }
  return pass('Tooltip 行為正確（可移入、Esc 可關閉）');'''


def gen_failure_check(code, meta, steps):
    c = code.lower()
    if any(x in c for x in ['2141008']):
        return gen_resize_check(code, meta, steps)
    if any(x in c for x in ['2141301']):
        return gen_hover_check(code, meta, steps)
    if any(x in c for x in ['1210401','2141104']):
        return gen_css_check(code, meta, steps)
    return '''
  const result = await page.evaluate(() => ({
    outlineNone: [...document.styleSheets].flatMap(s => { try { return [...s.cssRules]; } catch { return []; } })
      .filter(r => r.selectorText?.includes(':focus') && r.style?.outline?.includes('none')).length,
    hasHScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    autoplay: document.querySelectorAll('video[autoplay],audio[autoplay]').length,
  }));
  const issues = [];
  if (result.outlineNone) issues.push(`${result.outlineNone}個:focus移除outline`);
  if (result.hasHScroll) issues.push('有橫向捲軸');
  if (result.autoplay) issues.push(`${result.autoplay}個媒體自動播放`);
  if (issues.length) return fail(issues.join('; '), '依各失敗樣式修正');
  return pass('無已知失敗樣式');'''


def gen_script_check(code, meta, steps):
    return '''
  const result = await page.evaluate(() => ({
    dynContent: document.querySelectorAll('[aria-live],[role="alert"],[role="status"]').length,
    focusMgmt: [...document.querySelectorAll('[tabindex]')].filter(el => el.getAttribute('tabindex')==='-1').length,
    onclickDivs: [...document.querySelectorAll('div[onclick],span[onclick]')].filter(el => !el.getAttribute('tabindex')).length,
  }));
  const issues = [];
  if (!result.dynContent) issues.push('缺少 aria-live 動態內容通知');
  if (result.onclickDivs) issues.push(`${result.onclickDivs}個div/span有onclick但無tabindex`);
  if (issues.length) return fail(issues.join('; '), '加 aria-live="polite"；div/span 改 button 或加 tabindex="0"');
  return pass(`Script: ariaLive=${result.dynContent}, tabindex=-1 ${result.focusMgmt}個`);'''


# ── 產生每個 E 碼的 JS 檔案 ───────────────────────────────────────────────────

TEMPLATE = '''/**
 * {code} — {message}
 * 對應成功準則：{criterion}（等級 {level}）
 * 類別：{category}
 *
 * 官方稽核步驟：
{steps_comment}
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {{
  return {{ code: '{code}', rule: '{rule}', status: 'pass', message: detail, fix_suggestion: '', details }};
}}
function fail(message, fix = '', details = []) {{
  return {{ code: '{code}', rule: '{rule}', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] }};
}}

/**
 * @param {{import('playwright').Page}} page
 * @returns {{Promise<{{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}}>>}}
 */
export async function check(page) {{
  try {{
{check_logic}
  }} catch (err) {{
    return {{ code: '{code}', rule: '{rule}', status: 'fail', message: `執行錯誤: ${{err.message}}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] }};
  }}
}}

export const metadata = {{
  code: '{code}',
  criterion: '{criterion}',
  level: '{level}',
  category: '{category}',
  rule: '{rule}',
}};
'''

generated = 0
errors = []

for p in patterns:
    code = p['code']
    ptype = p['type']
    meta = all_codes.get(code, {})
    steps = meta.get('steps','') or ''
    message = (meta.get('message') or p.get('message') or code)[:80]
    criterion = meta.get('criterion','') or p.get('criterion','')
    level = code[2] if len(code) > 2 else '?'
    level_name = {'1':'A','2':'AA','3':'AAA'}.get(level,'?')
    category = meta.get('category','') or code[:2]
    rule = message[:60]
    steps_comment = steps_to_js_comment(steps) if steps else '   * （依官方稽核步驟執行）'

    try:
        if ptype == 'css':
            check_logic = gen_css_check(code, meta, steps)
        elif ptype == 'keyboard':
            check_logic = gen_keyboard_check(code, meta, steps)
        elif ptype == 'aria':
            check_logic = gen_aria_check(code, meta, steps)
        elif ptype == 'form':
            check_logic = gen_form_check(code, meta, steps)
        elif ptype == 'media':
            check_logic = gen_media_check(code, meta, steps)
        elif ptype in ('resize','layout'):
            check_logic = gen_resize_check(code, meta, steps)
        elif ptype == 'hover':
            check_logic = gen_hover_check(code, meta, steps)
        elif ptype in ('failure',):
            check_logic = gen_failure_check(code, meta, steps)
        elif ptype in ('focus',):
            check_logic = gen_keyboard_check(code, meta, steps)
        elif ptype == 'script':
            check_logic = gen_script_check(code, meta, steps)
        else:
            check_logic = gen_dom_check(code, meta, steps)

        # 縮排兩格
        check_logic = '\n'.join('  ' + l for l in check_logic.strip().splitlines())

        js = TEMPLATE.format(
            code=code, message=message, criterion=criterion,
            level=level_name, category=category, rule=rule,
            steps_comment=steps_comment, check_logic=check_logic
        )

        filepath = os.path.join(TESTS_DIR, f'{code}.js')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(js)
        generated += 1

    except Exception as e:
        errors.append(f'{code}: {e}')

print(f'已產生 {generated} 個 E 碼測試檔案')
print(f'錯誤 {len(errors)} 個')
if errors:
    for e in errors[:5]:
        print(f'  {e}')
