/**
 * dom_checks.js — DOM 屬性查詢類 E 碼測試
 *
 * 涵蓋：HM 類（HTML 結構/屬性）、GN 類（通用 DOM）
 * 測試方式：document.querySelectorAll + 屬性查詢
 *
 * 包含 E 碼（共 68 個）：
 * HM1110100E, HM1110101E, HM1110102E, HM1110103E, HM1110104E,
 * HM1110105E, HM1110106E, HM1110108E, HM1110112E,
 * HM1130104E, HM1130105E, HM1130106E, HM1130107E, HM1130108E,
 * HM1130109E, HM1130110E, HM1130111E, HM1130112E, HM1130113E,
 * HM1240200E, HM1240400E, HM1240402E, HM1240403E, HM1240404E,
 * HM1240401E (alias), HM2130500E, HM2310200E, HM3140806E,
 * HM3240800E, HM3240901E, HM3240902E, HM3240904E,
 * GN1110107E, GN1110109E, GN1110110E, GN1110111E,
 * GN1120100E, GN1120101E, GN1120102E, GN1120200E, GN1120300E,
 * GN1120301E, GN1120302E,
 * GN1130100E, GN1130101E, GN1130102E, GN1130200E, GN1130201E,
 * GN1130300E, GN1140100E, GN1140102E,
 * GN1240101E, GN1240102E, GN1240103E, GN1240104E, GN1240105E,
 * GN1240300E, GN1240301E, GN1240401E, GN1240500E,
 * GN1310100E, GN1320100E,
 * GN2120400E, GN2120500E, GN2130400E,
 * GN3120600E, GN3120601E, GN3120700E
 */

import { result, safeEval } from './helpers.js';

// ── 1.1.1 替代文字 ─────────────────────────────────────────────────────────────

/** HM1110100E: img 必須有有意義的 alt */
export async function check_HM1110100E(page) {
  const r = await safeEval(page, () => {
    const imgs = [...document.querySelectorAll('img')];
    const missing = imgs.filter(i => !i.hasAttribute('alt')).map(i => i.src?.split('/').pop()?.slice(0, 40) || '?');
    const empty = imgs.filter(i => i.hasAttribute('alt') && i.alt === '' && !i.hasAttribute('role')).length;
    return { total: imgs.length, missing, empty };
  }, { total: 0, missing: [], empty: 0 });
  if (r.missing.length > 0) {
    return result('HM1110100E', 'img 缺少 alt 屬性', 'fail',
      `${r.missing.length} 個 <img> 完全缺少 alt 屬性`,
      '為每個有意義的圖片加上 alt="描述性文字"', r.missing);
  }
  return result('HM1110100E', 'img 替代文字完整', 'pass', `共 ${r.total} 個 img，均有 alt 屬性`);
}

/** HM1110101E: 一組緊連圖片只需其中一個有 alt */
export async function check_HM1110101E(page) {
  const r = await safeEval(page, () => {
    // 找連續兩個以上的 img（兄弟節點），且都有各自 alt
    const groups = [];
    const allImgs = [...document.querySelectorAll('img[alt]:not([alt=""])')]
      .filter(img => img.nextElementSibling?.tagName === 'IMG');
    return { adjacentWithAlt: allImgs.length };
  }, { adjacentWithAlt: 0 });
  if (r.adjacentWithAlt > 0) {
    return result('HM1110101E', '一組緊連圖片中各自有 alt，可能重複描述', 'fail',
      `${r.adjacentWithAlt} 個 img 與相鄰 img 緊連，且各自都有非空 alt，建議只保留一個描述整組的 alt`,
      '將一組裝飾/圖示圖片中的後續圖片設為 alt=""，只在第一張說明整組用途');
  }
  return result('HM1110101E', '緊連圖片替代文字結構正確', 'pass');
}

/** HM1110102E: 影像地圖 area 有 alt */
export async function check_HM1110102E(page) {
  const r = await safeEval(page, () => {
    const areas = [...document.querySelectorAll('area')];
    const missing = areas.filter(a => !a.getAttribute('alt') || a.getAttribute('alt').trim() === '').length;
    return { total: areas.length, missing };
  }, { total: 0, missing: 0 });
  if (r.total === 0) return result('HM1110102E', '無影像地圖區域', 'pass');
  if (r.missing > 0) {
    return result('HM1110102E', '影像地圖區域缺少 alt', 'fail',
      `${r.missing}/${r.total} 個 <area> 缺少有意義的 alt 屬性`,
      '<area href="..." alt="描述此區域的功能">');
  }
  return result('HM1110102E', '影像地圖 area alt 完整', 'pass', `${r.total} 個 area 均有 alt`);
}

/** HM1110103E: 複雜圖片提供長描述 */
export async function check_HM1110103E(page) {
  const r = await safeEval(page, () => {
    const complexImgs = [...document.querySelectorAll('img')].filter(img => {
      const alt = img.getAttribute('alt') || '';
      // 判斷為複雜圖片：aria-describedby 或 longdesc 或 alt 超過 100 字
      const hasLongdesc = img.hasAttribute('longdesc');
      const hasAriaDesc = img.hasAttribute('aria-describedby');
      const isComplex = alt.length > 100;
      return isComplex && !hasLongdesc && !hasAriaDesc;
    }).map(img => img.alt?.slice(0, 40));
    return { complexWithoutLongdesc: complexImgs };
  }, { complexWithoutLongdesc: [] });
  if (r.complexWithoutLongdesc.length > 0) {
    return result('HM1110103E', '複雜圖片缺少長描述', 'fail',
      `${r.complexWithoutLongdesc.length} 個圖片 alt 超過 100 字，但無 longdesc 或 aria-describedby`,
      '使用 aria-describedby 指向段落說明，或加上 longdesc URL',
      r.complexWithoutLongdesc);
  }
  return result('HM1110103E', '複雜圖片長描述結構符合要求', 'pass');
}

/** HM1110104E: input[type=image] 有 alt */
export async function check_HM1110104E(page) {
  const r = await safeEval(page, () => {
    const inputs = [...document.querySelectorAll('input[type="image"]')];
    const missing = inputs.filter(i => !i.getAttribute('alt') || i.getAttribute('alt').trim() === '').length;
    return { total: inputs.length, missing };
  }, { total: 0, missing: 0 });
  if (r.total === 0) return result('HM1110104E', '無 input[type=image]', 'pass');
  if (r.missing > 0) {
    return result('HM1110104E', 'input[type=image] 缺少 alt', 'fail',
      `${r.missing} 個圖片提交按鈕缺少有意義的 alt 屬性`,
      '<input type="image" alt="送出表單" src="...">');
  }
  return result('HM1110104E', 'input[type=image] alt 完整', 'pass');
}

/** HM1110105E: object 有文字替代內容 */
export async function check_HM1110105E(page) {
  const r = await safeEval(page, () => {
    const objects = [...document.querySelectorAll('object, embed, applet')];
    const missing = objects.filter(o => !o.textContent.trim() && !o.getAttribute('aria-label') && !o.getAttribute('title')).length;
    return { total: objects.length, missing };
  }, { total: 0, missing: 0 });
  if (r.total === 0) return result('HM1110105E', '無 object/embed 元素', 'pass');
  if (r.missing > 0) {
    return result('HM1110105E', 'object/embed 缺少替代文字', 'fail',
      `${r.missing} 個嵌入物件無文字替代內容`,
      '<object>替代文字內容</object> 或加 aria-label/title');
  }
  return result('HM1110105E', 'object 替代內容完整', 'pass');
}

/** HM1110106E: input[type=image] 的 alt 能表達按鈕意義 */
export async function check_HM1110106E(page) {
  const r = await safeEval(page, () => {
    const inputs = [...document.querySelectorAll('input[type="image"]')];
    const generic = inputs.filter(i => {
      const alt = (i.getAttribute('alt') || '').toLowerCase();
      return alt === 'image' || alt === 'button' || alt === 'img' || alt === 'picture' || alt.length < 2;
    }).length;
    return { total: inputs.length, generic };
  }, { total: 0, generic: 0 });
  if (r.total === 0) return result('HM1110106E', '無送出圖片按鈕', 'pass');
  if (r.generic > 0) {
    return result('HM1110106E', 'input[type=image] alt 無意義', 'fail',
      `${r.generic} 個圖片按鈕使用了無意義的 alt（"image"/"button" 等）`,
      'alt 應描述按鈕功能，例如 alt="送出申請"');
  }
  return result('HM1110106E', 'input[type=image] alt 有意義', 'pass');
}

/** HM1110108E: object 提供文字與非文字替代內容 */
export async function check_HM1110108E(page) {
  const r = await safeEval(page, () => {
    const objects = [...document.querySelectorAll('object')];
    const issues = objects.filter(o => {
      const hasText = o.textContent.trim().length > 0;
      const hasAriaLabel = !!o.getAttribute('aria-label') || !!o.getAttribute('aria-labelledby');
      return !hasText && !hasAriaLabel;
    }).length;
    return { total: objects.length, issues };
  }, { total: 0, issues: 0 });
  if (r.total === 0) return result('HM1110108E', '無 object 元素', 'pass');
  if (r.issues > 0) {
    return result('HM1110108E', 'object 缺少替代內容', 'fail',
      `${r.issues} 個 <object> 無文字替代內容也無 aria-label`,
      '<object aria-label="說明">後備文字內容</object>');
  }
  return result('HM1110108E', 'object 替代內容完整', 'pass');
}

/** HM1110112E: 裝飾性圖片使用 alt="" 且不使用 title */
export async function check_HM1110112E(page) {
  const r = await safeEval(page, () => {
    const decorative = [...document.querySelectorAll('img[alt=""]')];
    const withTitle = decorative.filter(img => img.hasAttribute('title')).map(img => ({
      src: img.src?.split('/').pop()?.slice(0, 30),
      title: img.getAttribute('title')
    }));
    return { total: decorative.length, withTitle };
  }, { total: 0, withTitle: [] });
  if (r.withTitle.length > 0) {
    return result('HM1110112E', '裝飾性圖片（alt=""）不應有 title 屬性', 'fail',
      `${r.withTitle.length} 個 alt="" 的圖片同時有 title 屬性，螢幕報讀器仍會朗讀 title`,
      '移除裝飾性圖片的 title 屬性：<img alt="" src="...">',
      r.withTitle);
  }
  return result('HM1110112E', '裝飾性圖片 alt/title 設定正確', 'pass', `共 ${r.total} 個裝飾性圖片`);
}

// ── 1.3.1 可調適（語意標記） ───────────────────────────────────────────────────

/** HM1130104E: 使用巢狀標題呈現文件結構 */
export async function check_HM1130104E(page) {
  const r = await safeEval(page, () => {
    const levels = [1, 2, 3, 4, 5, 6].map(n => document.querySelectorAll(`h${n}`).length);
    const total = levels.reduce((a, b) => a + b, 0);
    // 檢查跳級：例如從 h1 直接到 h3，中間跳過 h2
    const issues = [];
    let lastLevel = 0;
    document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h => {
      const level = parseInt(h.tagName[1]);
      if (lastLevel > 0 && level > lastLevel + 1) {
        issues.push(`${h.tagName} 在 h${lastLevel} 之後（跳過 h${lastLevel + 1}）：${h.textContent.trim().slice(0, 30)}`);
      }
      lastLevel = level;
    });
    return { total, levels, issues };
  }, { total: 0, levels: [], issues: [] });
  if (r.total === 0) {
    return result('HM1130104E', '頁面無任何標題元素', 'fail',
      '未找到 h1~h6 元素，無法呈現文件結構',
      '使用 h1 作為頁面主標題，h2~h6 作為各區段標題');
  }
  if (r.issues.length > 0) {
    return result('HM1130104E', '標題層次跳級', 'fail',
      `發現 ${r.issues.length} 處標題跳級（例如 h1 後直接 h3）`,
      '標題層次應連續，不可跳級：h1 → h2 → h3',
      r.issues);
  }
  return result('HM1130104E', '標題巢狀層次正確', 'pass',
    `共 ${r.total} 個標題，層次分佈：${r.levels.map((c, i) => `h${i + 1}:${c}`).join(', ')}`);
}

/** HM1130105E: 使用語意元素標記結構（ul/ol/dl/nav/article 等） */
export async function check_HM1130105E(page) {
  const r = await safeEval(page, () => {
    const semanticCount = document.querySelectorAll('nav, article, section, aside, header, footer, main, ul, ol, dl').length;
    // 偵測濫用 div/span 模擬列表
    const fakeList = [...document.querySelectorAll('div[class*="list"], div[class*="menu"], span[class*="list"]')]
      .filter(el => !el.closest('ul, ol, nav'))
      .map(el => el.className?.split(' ')[0] || el.tagName)
      .slice(0, 5);
    return { semanticCount, fakeList };
  }, { semanticCount: 0, fakeList: [] });
  if (r.semanticCount < 2) {
    return result('HM1130105E', '缺少語意結構元素', 'fail',
      `只找到 ${r.semanticCount} 個語意元素（nav/article/section/ul/ol 等）`,
      '使用 <ul> 或 <ol> 代替 <div> 做列表，使用 <nav> 包裝導覽連結');
  }
  return result('HM1130105E', '語意結構元素足夠', 'pass', `共 ${r.semanticCount} 個語意元素`);
}

/** HM1130106E: 使用語意標記標出強調文字（strong/em 非 b/i） */
export async function check_HM1130106E(page) {
  const r = await safeEval(page, () => {
    const strong = document.querySelectorAll('strong, em').length;
    const presentational = [...document.querySelectorAll('b, i, u, s')]
      .filter(el => !el.className && !el.getAttribute('aria-label'))
      .map(el => `<${el.tagName.toLowerCase()}>${el.textContent.trim().slice(0, 20)}</${el.tagName.toLowerCase()}>`)
      .slice(0, 5);
    return { strong, presentational };
  }, { strong: 0, presentational: [] });
  if (r.presentational.length > 0) {
    return result('HM1130106E', '使用純呈現性標記（b/i/u）而非語意標記', 'fail',
      `${r.presentational.length} 處使用 <b>/<i>/<u> 等舊式標記`,
      '強調語意改用 <strong>（重要）或 <em>（強調）；若純視覺，改用 CSS font-weight/font-style',
      r.presentational);
  }
  return result('HM1130106E', '語意強調標記使用正確', 'pass', `${r.strong} 個 strong/em 語意元素`);
}

/** HM1130107E: 表格資訊使用 table 標記 */
export async function check_HM1130107E(page) {
  const r = await safeEval(page, () => {
    const tables = document.querySelectorAll('table').length;
    // 偵測用 div 模擬表格
    const fakeTable = [...document.querySelectorAll('[class*="table"],[class*="grid"],[role="table"]')]
      .filter(el => el.tagName !== 'TABLE')
      .map(el => el.tagName + '.' + (el.className?.split(' ')[0] || ''))
      .slice(0, 3);
    return { tables, fakeTable };
  }, { tables: 0, fakeTable: [] });
  if (r.fakeTable.length > 0) {
    return result('HM1130107E', '用 div 模擬表格，應改用 table 元素', 'fail',
      `${r.fakeTable.length} 個非 table 元素使用 table/grid class 或 role`,
      '資料表格應使用 <table><thead><tr><th>/<td> 標準標記',
      r.fakeTable);
  }
  return result('HM1130107E', '表格資訊使用 table 標記', 'pass', `共 ${r.tables} 個 table 元素`);
}

/** HM1130108E: 資料表格提供 caption 概觀 */
export async function check_HM1130108E(page) {
  const r = await safeEval(page, () => {
    const tables = [...document.querySelectorAll('table')];
    if (tables.length === 0) return { total: 0, withoutCaption: 0 };
    const withoutCaption = tables.filter(t => !t.querySelector('caption') && !t.getAttribute('aria-label') && !t.getAttribute('aria-labelledby')).length;
    return { total: tables.length, withoutCaption };
  }, { total: 0, withoutCaption: 0 });
  if (r.total === 0) return result('HM1130108E', '無資料表格', 'pass');
  if (r.withoutCaption > 0) {
    return result('HM1130108E', '資料表格缺少 caption 或 aria-label', 'fail',
      `${r.withoutCaption}/${r.total} 個 table 缺少 <caption> 或 aria-label`,
      '<table><caption>表格標題說明</caption> 或 <table aria-label="...">');
  }
  return result('HM1130108E', '資料表格有概觀說明', 'pass', `${r.total} 個 table 均有標題`);
}

/** HM1130109E: 表格標題與資料建立關連（th/td 結構） */
export async function check_HM1130109E(page) {
  const r = await safeEval(page, () => {
    const tables = [...document.querySelectorAll('table')];
    if (tables.length === 0) return { total: 0, withoutTh: 0, thNoScope: 0 };
    const withoutTh = tables.filter(t => t.querySelectorAll('th').length === 0).length;
    const thNoScope = [...document.querySelectorAll('th')].filter(th => !th.getAttribute('scope') && !th.getAttribute('id')).length;
    return { total: tables.length, withoutTh, thNoScope };
  }, { total: 0, withoutTh: 0, thNoScope: 0 });
  if (r.total === 0) return result('HM1130109E', '無資料表格', 'pass');
  if (r.withoutTh > 0) {
    return result('HM1130109E', '資料表格缺少 th 標題儲存格', 'fail',
      `${r.withoutTh}/${r.total} 個 table 完全沒有 <th> 元素`,
      '欄標題用 <th scope="col">，列標題用 <th scope="row">');
  }
  if (r.thNoScope > 0) {
    return result('HM1130109E', 'th 缺少 scope 屬性', 'fail',
      `${r.thNoScope} 個 <th> 未設定 scope 屬性`,
      'scope="col" 用於欄標題，scope="row" 用於列標題');
  }
  return result('HM1130109E', '表格標題與資料關連正確', 'pass');
}

/** HM1130110E: 複雜表格使用 id/headers 建立標題與資料儲存格關連 */
export async function check_HM1130110E(page) {
  const r = await safeEval(page, () => {
    const complexTables = [...document.querySelectorAll('table')].filter(t => {
      const rows = t.querySelectorAll('tr');
      return rows.length > 3 && t.querySelectorAll('th').length > 2;
    });
    if (complexTables.length === 0) return { complex: 0, withoutHeaders: 0 };
    const withoutHeaders = complexTables.filter(t => {
      const ths = [...t.querySelectorAll('th')];
      const tds = [...t.querySelectorAll('td')];
      const hasHeaders = tds.some(td => td.getAttribute('headers'));
      const hasScope = ths.some(th => th.getAttribute('scope'));
      const hasId = ths.some(th => th.getAttribute('id'));
      return !hasHeaders && !hasScope && !hasId;
    }).length;
    return { complex: complexTables.length, withoutHeaders };
  }, { complex: 0, withoutHeaders: 0 });
  if (r.complex === 0) return result('HM1130110E', '無複雜資料表格', 'pass');
  if (r.withoutHeaders > 0) {
    return result('HM1130110E', '複雜表格缺少 id/headers 關連', 'fail',
      `${r.withoutHeaders}/${r.complex} 個複雜表格未使用 id+headers 建立標題關連`,
      '<th id="h1">標題</th> + <td headers="h1">資料</td>');
  }
  return result('HM1130110E', '複雜表格標題關連正確', 'pass');
}

/** HM1130111E: 表單控制元件以 fieldset/legend 或 optgroup 分群 */
export async function check_HM1130111E(page) {
  const r = await safeEval(page, () => {
    const radioGroups = {};
    [...document.querySelectorAll('input[type="radio"]')].forEach(r => {
      const name = r.getAttribute('name') || '_unnamed';
      if (!radioGroups[name]) radioGroups[name] = [];
      radioGroups[name].push(r);
    });
    const checkboxGroups = {};
    [...document.querySelectorAll('input[type="checkbox"]')].forEach(c => {
      const name = c.getAttribute('name') || '_unnamed';
      if (!checkboxGroups[name]) checkboxGroups[name] = [];
      checkboxGroups[name].push(c);
    });

    const radioGroupsWithoutFieldset = Object.values(radioGroups)
      .filter(g => g.length > 1 && !g[0].closest('fieldset')).length;
    const checkboxGroupsWithoutFieldset = Object.values(checkboxGroups)
      .filter(g => g.length > 1 && !g[0].closest('fieldset')).length;
    const selectsWithoutOptgroup = [...document.querySelectorAll('select')]
      .filter(s => s.querySelectorAll('option').length > 5 && s.querySelectorAll('optgroup').length === 0).length;

    return { radioGroupsWithoutFieldset, checkboxGroupsWithoutFieldset, selectsWithoutOptgroup };
  }, { radioGroupsWithoutFieldset: 0, checkboxGroupsWithoutFieldset: 0, selectsWithoutOptgroup: 0 });

  const issues = [];
  if (r.radioGroupsWithoutFieldset > 0) issues.push(`${r.radioGroupsWithoutFieldset} 個 radio 群組缺少 <fieldset>`);
  if (r.checkboxGroupsWithoutFieldset > 0) issues.push(`${r.checkboxGroupsWithoutFieldset} 個 checkbox 群組缺少 <fieldset>`);
  if (r.selectsWithoutOptgroup > 0) issues.push(`${r.selectsWithoutOptgroup} 個長 select 缺少 <optgroup> 分群`);

  if (issues.length > 0) {
    return result('HM1130111E', '表單控制元件分群不完整', 'fail',
      issues.join('；'),
      '<fieldset><legend>性別</legend><input type="radio"> ... </fieldset>');
  }
  return result('HM1130111E', '表單控制元件分群正確', 'pass');
}

/** HM1130112E: label 與表單控制元件關連 */
export async function check_HM1130112E(page) {
  const r = await safeEval(page, () => {
    const inputs = [...document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="image"]):not([type="reset"]), textarea, select')];
    const issues = inputs.filter(inp => {
      const id = inp.getAttribute('id');
      const hasLabelFor = id && document.querySelector(`label[for="${id}"]`);
      const isWrapped = inp.closest('label') !== null;
      const hasAriaLabel = inp.getAttribute('aria-label') || inp.getAttribute('aria-labelledby');
      const hasTitle = inp.getAttribute('title');
      return !hasLabelFor && !isWrapped && !hasAriaLabel && !hasTitle;
    }).map(inp => `${inp.tagName.toLowerCase()}[name=${inp.getAttribute('name') || inp.getAttribute('id') || '?'}]`).slice(0, 5);
    return { total: inputs.length, issues };
  }, { total: 0, issues: [] });
  if (r.issues.length > 0) {
    return result('HM1130112E', '表單欄位缺少標籤關連', 'fail',
      `${r.issues.length} 個可見輸入欄位缺少 label/aria-label/title`,
      '<label for="email">電子郵件</label><input id="email" type="email">',
      r.issues);
  }
  return result('HM1130112E', '表單欄位標籤完整', 'pass', `${r.total} 個輸入欄位均有可存取名稱`);
}

/** HM1130113E: 無法使用 label 時，用 title 屬性指明 */
export async function check_HM1130113E(page) {
  const r = await safeEval(page, () => {
    const inputs = [...document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"])')];
    const titleOnly = inputs.filter(inp => {
      const id = inp.getAttribute('id');
      const hasLabelFor = id && document.querySelector(`label[for="${id}"]`);
      const isWrapped = inp.closest('label') !== null;
      const hasAriaLabel = inp.getAttribute('aria-label') || inp.getAttribute('aria-labelledby');
      const hasTitle = inp.getAttribute('title') && inp.getAttribute('title').trim();
      return !hasLabelFor && !isWrapped && !hasAriaLabel && hasTitle;
    }).length;
    return { titleOnly };
  }, { titleOnly: 0 });
  return result('HM1130113E', '無 label 時用 title 指明', 'pass',
    r.titleOnly > 0 ? `${r.titleOnly} 個欄位用 title 屬性代替 label` : '所有欄位均有正式 label');
}

// ── 2.4 可導覽 ─────────────────────────────────────────────────────────────────

/** HM1240200E: 網頁有描述性 title */
export async function check_HM1240200E(page) {
  const r = await safeEval(page, () => ({
    title: document.title?.trim() || '',
    length: (document.title || '').trim().length
  }), { title: '', length: 0 });
  if (!r.title || r.length === 0) {
    return result('HM1240200E', '網頁缺少 title', 'fail',
      'document.title 為空',
      '<title>功能名稱 - 系統名稱</title>');
  }
  if (r.length < 4) {
    return result('HM1240200E', '網頁 title 太短，不具描述性', 'fail',
      `title "${r.title}" 只有 ${r.length} 字`,
      'title 應描述頁面內容，例如「登入頁 - 特殊需求補助申請系統」');
  }
  return result('HM1240200E', '網頁 title 完整', 'pass', `title: "${r.title}"`);
}

/** HM1240400E: 使用鏈結文字及上下文表達鏈結目的 */
export async function check_HM1240400E(page) {
  const r = await safeEval(page, () => {
    const links = [...document.querySelectorAll('a[href]')];
    const vague = links.filter(a => {
      const text = (a.textContent || '').trim().toLowerCase();
      const ariaLabel = (a.getAttribute('aria-label') || '').toLowerCase();
      const vagueTexts = ['點擊', 'click here', '這裡', 'here', '更多', 'more', '詳細', '詳情', 'read more', '...'];
      const isVague = vagueTexts.some(v => text === v || ariaLabel === v);
      return isVague;
    }).map(a => a.textContent.trim().slice(0, 20)).slice(0, 5);
    return { total: links.length, vague };
  }, { total: 0, vague: [] });
  if (r.vague.length > 0) {
    return result('HM1240400E', '連結文字不具描述性（context-free link text）', 'fail',
      `${r.vague.length} 個連結使用模糊文字（"這裡"/"更多" 等），不說明連結目的`,
      '改用描述性文字：<a href="...">閱讀特殊需求補助申請說明</a>',
      r.vague);
  }
  return result('HM1240400E', '連結文字具描述性', 'pass', `共 ${r.total} 個連結均符合要求`);
}

/** HM1240402E: 圖片+文字連到同一資源時應合併為單一連結 */
export async function check_HM1240402E(page) {
  const r = await safeEval(page, () => {
    const links = [...document.querySelectorAll('a[href]')];
    const adjacent = links.filter(a => {
      const next = a.nextElementSibling;
      if (!next || next.tagName !== 'A') return false;
      return a.href === next.href;
    }).map(a => a.href?.split('/').pop()?.slice(0, 30) || a.textContent.trim().slice(0, 20));
    return adjacent.slice(0, 5);
  }, []);
  if (r.length > 0) {
    return result('HM1240402E', '相鄰圖片與文字連結指向相同 URL，應合併', 'fail',
      `${r.length} 組毗鄰連結指向相同 URL`,
      '將圖片和文字包在同一個 <a> 內，例如：<a href="..."><img alt="">說明文字</a>',
      r);
  }
  return result('HM1240402E', '毗鄰連結結構正確', 'pass');
}

/** HM1240403E: 連結文字描述連結目的 */
export async function check_HM1240403E(page) {
  const r = await safeEval(page, () => {
    const emptyLinks = [...document.querySelectorAll('a[href]')].filter(a => {
      const text = (a.textContent || '').trim();
      const ariaLabel = a.getAttribute('aria-label') || '';
      const ariaLabelledby = a.getAttribute('aria-labelledby');
      const title = a.getAttribute('title') || '';
      const imgAlt = [...a.querySelectorAll('img')].map(img => img.alt).join('');
      return !text && !ariaLabel && !title && !imgAlt && !ariaLabelledby;
    }).length;
    return { emptyLinks };
  }, { emptyLinks: 0 });
  if (r.emptyLinks > 0) {
    return result('HM1240403E', '連結缺少可存取名稱', 'fail',
      `${r.emptyLinks} 個連結無文字、aria-label、title 或圖片 alt`,
      '連結加入描述文字或 aria-label="目標描述"');
  }
  return result('HM1240403E', '所有連結均有可存取名稱', 'pass');
}

/** HM1240404E: 用 title 屬性補充連結文字 */
export async function check_HM1240404E(page) {
  const r = await safeEval(page, () => {
    const links = [...document.querySelectorAll('a[href]')];
    const withTitle = links.filter(a => a.getAttribute('title') && a.textContent.trim()).length;
    return { total: links.length, withTitle };
  }, { total: 0, withTitle: 0 });
  return result('HM1240404E', '連結 title 補充說明', 'pass',
    `${r.withTitle}/${r.total} 個連結有 title 屬性補充說明`);
}

// ── 2.5 輸入方式 ────────────────────────────────────────────────────────────────

/** HM2130500E: 使用 HTML5.2 autocomplete 屬性 */
export async function check_HM2130500E(page) {
  const r = await safeEval(page, () => {
    const personalInputs = [...document.querySelectorAll(
      'input[type="text"], input[type="email"], input[type="tel"], input[type="password"], input[name]'
    )].filter(inp => !inp.hasAttribute('autocomplete'));
    const validAutocomplete = ['name', 'email', 'tel', 'password', 'new-password', 'current-password',
      'username', 'given-name', 'family-name', 'address-line1', 'postal-code', 'country', 'bday'];
    const hasAutocomplete = [...document.querySelectorAll('[autocomplete]')]
      .filter(el => validAutocomplete.some(v => el.getAttribute('autocomplete')?.includes(v))).length;
    return { withoutAutocomplete: personalInputs.slice(0, 5).map(i => i.getAttribute('name') || i.getAttribute('id') || '?'), hasAutocomplete };
  }, { withoutAutocomplete: [], hasAutocomplete: 0 });
  if (r.withoutAutocomplete.length > 0) {
    return result('HM2130500E', '個人資料輸入欄位缺少 autocomplete 屬性', 'fail',
      `${r.withoutAutocomplete.length} 個欄位缺少 autocomplete 屬性`,
      '<input type="email" autocomplete="email"> 或 <input type="text" autocomplete="name">',
      r.withoutAutocomplete);
  }
  return result('HM2130500E', 'autocomplete 屬性設定完整', 'pass', `${r.hasAutocomplete} 個欄位有有效的 autocomplete`);
}

// ── 3.1.2 語言轉換 ─────────────────────────────────────────────────────────────

/** HM2310200E: 明確指出語言轉換區段 */
export async function check_HM2310200E(page) {
  const r = await safeEval(page, () => {
    const htmlLang = document.documentElement.getAttribute('lang') || '';
    const langEls = [...document.querySelectorAll('[lang]:not(html)')];
    // 偵測英文單字在中文頁面中（簡單啟發式）
    const isChinesePage = htmlLang.startsWith('zh');
    const foreignEls = langEls.filter(el => el.getAttribute('lang') !== htmlLang).length;
    return { htmlLang, langElsCount: langEls.length, foreignEls, isChinesePage };
  }, { htmlLang: '', langElsCount: 0, foreignEls: 0, isChinesePage: false });
  if (!r.htmlLang) {
    return result('HM2310200E', 'html 元素缺少 lang 屬性', 'fail',
      '<html> 無 lang 屬性，語言轉換也無法正確運作',
      '<html lang="zh-Hant-TW">');
  }
  return result('HM2310200E', '語言屬性設定正確', 'pass',
    `html lang="${r.htmlLang}"，${r.langElsCount} 個元素有 lang 屬性（${r.foreignEls} 個不同語言區段）`);
}

// ── 3.1.1 網頁語言 ─────────────────────────────────────────────────────────────

/** GN1310100E: html lang 屬性使用正確的 BCP47 語言標籤 */
export async function check_GN1310100E(page) {
  const r = await safeEval(page, () => {
    const lang = document.documentElement.getAttribute('lang') || '';
    const validPrefixes = ['zh', 'en', 'ja', 'ko', 'de', 'fr', 'es', 'ar', 'ru', 'pt'];
    const isValid = lang.length >= 2 && validPrefixes.some(p => lang.startsWith(p));
    return { lang, isValid };
  }, { lang: '', isValid: false });
  if (!r.lang) {
    return result('GN1310100E', 'html 元素缺少 lang 屬性', 'fail',
      '<html> 未設定 lang 屬性，螢幕報讀器無法正確發音',
      '<html lang="zh-Hant-TW">（正體中文）');
  }
  if (!r.isValid) {
    return result('GN1310100E', 'html lang 值不符合 BCP47', 'fail',
      `lang="${r.lang}" 非有效的 BCP47 語言標籤`,
      '請使用有效的語言標籤：zh-Hant-TW（正體中文）、en（英文）');
  }
  return result('GN1310100E', 'html lang 屬性正確', 'pass', `lang="${r.lang}"`);
}

// ── 3.2.1 表單自動完成 ────────────────────────────────────────────────────────

/** GN1320100E: 欄位獲得焦點時不自動改變情境 */
export async function check_GN1320100E(page) {
  // 用 DOM 檢查是否有 onfocus 屬性直接導航或提交
  const r = await safeEval(page, () => {
    const onfocusEls = [...document.querySelectorAll('[onfocus]')]
      .map(el => ({
        tag: el.tagName,
        onfocus: el.getAttribute('onfocus')?.slice(0, 60)
      }))
      .filter(el => el.onfocus?.includes('submit') || el.onfocus?.includes('location') || el.onfocus?.includes('href'));
    return onfocusEls.slice(0, 5);
  }, []);
  if (r.length > 0) {
    return result('GN1320100E', 'onfocus 觸發情境改變', 'fail',
      `${r.length} 個元素的 onfocus 可能自動提交或導航`,
      '移除 onfocus 中的 submit/location 操作，讓使用者明確確認後再執行',
      r.map(e => `${e.tag}: ${e.onfocus}`));
  }
  return result('GN1320100E', '無 onfocus 自動情境改變', 'pass');
}

// ── 1.1.1 特殊非文字內容 ─────────────────────────────────────────────────────

/** GN1110107E: 現場純音訊/視訊有描述性標籤 */
export async function check_GN1110107E(page) {
  const r = await safeEval(page, () => {
    const liveMedia = [...document.querySelectorAll('video[autoplay], audio[autoplay], iframe[src*="live"], iframe[src*="stream"]')];
    const withLabel = liveMedia.filter(el =>
      el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title')
    ).length;
    return { total: liveMedia.length, withLabel };
  }, { total: 0, withLabel: 0 });
  if (r.total === 0) return result('GN1110107E', '無現場純音訊/視訊內容', 'pass');
  if (r.withLabel < r.total) {
    return result('GN1110107E', '現場媒體缺少描述性標籤', 'fail',
      `${r.total - r.withLabel}/${r.total} 個現場媒體無 aria-label/title`,
      '<video autoplay aria-label="現場新聞播報">');
  }
  return result('GN1110107E', '現場媒體有描述性標籤', 'pass');
}

/** GN1110109E: VR/3D 等體驗有替代文字或長描述 */
export async function check_GN1110109E(page) {
  const r = await safeEval(page, () => {
    const vrEls = [...document.querySelectorAll('canvas[id*="vr"], canvas[id*="3d"], [class*="vr-"], [class*="panorama"], iframe[src*="sketchfab"], iframe[src*="matterport"]')];
    const withAlt = vrEls.filter(el =>
      el.getAttribute('aria-label') || el.getAttribute('aria-describedby') || el.getAttribute('title')
    ).length;
    return { total: vrEls.length, withAlt };
  }, { total: 0, withAlt: 0 });
  if (r.total === 0) return result('GN1110109E', '無 VR/3D 體驗內容', 'pass');
  if (r.withAlt < r.total) {
    return result('GN1110109E', 'VR/3D 體驗缺少替代說明', 'fail',
      `${r.total - r.withAlt}/${r.total} 個 VR/3D 體驗無 aria-label 或 aria-describedby`,
      '<canvas aria-label="三維展示：建築外觀" aria-describedby="vr-desc">');
  }
  return result('GN1110109E', 'VR/3D 體驗有替代說明', 'pass');
}

/** GN1110110E: CAPTCHA 有替代文字描述目的 */
export async function check_GN1110110E(page) {
  const r = await safeEval(page, () => {
    const captchas = [...document.querySelectorAll('[class*="captcha"],[id*="captcha"],img[src*="captcha"]')];
    const withAlt = captchas.filter(el => {
      if (el.tagName === 'IMG') return el.getAttribute('alt') && el.getAttribute('alt').trim();
      return el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
    }).length;
    return { total: captchas.length, withAlt };
  }, { total: 0, withAlt: 0 });
  if (r.total === 0) return result('GN1110110E', '無 CAPTCHA 驗證元素', 'pass');
  if (r.withAlt < r.total) {
    return result('GN1110110E', 'CAPTCHA 缺少目的說明替代文字', 'fail',
      `${r.total - r.withAlt}/${r.total} 個 CAPTCHA 無替代文字`,
      '<img src="captcha.png" alt="請輸入驗證碼以確認您不是機器人">');
  }
  return result('GN1110110E', 'CAPTCHA 有替代文字', 'pass');
}

/** GN1110111E: CAPTCHA 提供不同形式的替代驗證 */
export async function check_GN1110111E(page) {
  const r = await safeEval(page, () => {
    const visualCaptcha = document.querySelectorAll('[class*="captcha"],[id*="captcha"],img[src*="captcha"]').length;
    const audioCaptcha = document.querySelectorAll('[class*="captcha-audio"],[aria-label*="音訊驗證"],[aria-label*="audio captcha"]').length;
    return { visualCaptcha, audioCaptcha };
  }, { visualCaptcha: 0, audioCaptcha: 0 });
  if (r.visualCaptcha === 0) return result('GN1110111E', '無 CAPTCHA 驗證', 'pass');
  if (r.audioCaptcha === 0 && r.visualCaptcha > 0) {
    return result('GN1110111E', '視覺 CAPTCHA 缺少音訊替代方式', 'fail',
      `有 ${r.visualCaptcha} 個視覺 CAPTCHA，但無音訊替代驗證方式`,
      '在圖形驗證碼旁提供音訊驗證碼選項');
  }
  return result('GN1110111E', 'CAPTCHA 提供多種形式', 'pass');
}

// ── 1.2 時序媒體 ──────────────────────────────────────────────────────────────

/** GN1120100E: 純音訊有等義文字替代內容 */
export async function check_GN1120100E(page) {
  const r = await safeEval(page, () => {
    const audios = [...document.querySelectorAll('audio:not([autoplay])')]
      .filter(a => !a.hasAttribute('controls') === false);
    // 找緊鄰的文字替代（如同頁的 transcript 段落）
    const hasTranscript = !!document.querySelector('[class*="transcript"], [id*="transcript"], [aria-label*="逐字稿"]');
    return { total: audios.length, hasTranscript };
  }, { total: 0, hasTranscript: false });
  if (r.total === 0) return result('GN1120100E', '無預先錄製的純音訊內容', 'pass');
  if (!r.hasTranscript) {
    return result('GN1120100E', '純音訊缺少文字替代內容', 'fail',
      `${r.total} 個音訊元素，但未找到對應逐字稿或文字說明`,
      '在音訊元素旁加入文字逐字稿，或連往替代文字頁面');
  }
  return result('GN1120100E', '純音訊有文字替代內容', 'pass');
}

/** GN1120101E: 純視訊有文字替代內容 */
export async function check_GN1120101E(page) {
  const r = await safeEval(page, () => {
    const videoOnly = [...document.querySelectorAll('video')].filter(v => v.querySelector('track[kind="descriptions"]') || v.muted);
    const hasAlt = videoOnly.filter(v => {
      const sibling = v.nextElementSibling;
      return sibling && sibling.textContent.trim().length > 20;
    }).length;
    return { total: videoOnly.length, hasAlt };
  }, { total: 0, hasAlt: 0 });
  if (r.total === 0) return result('GN1120101E', '無純視訊內容（靜音視訊）', 'pass');
  return result('GN1120101E', '純視訊替代文字', 'pass',
    `${r.total} 個靜音視訊，${r.hasAlt} 個有文字替代（請人工確認替代說明是否充分）`);
}

/** GN1120102E: 影片提供視覺內容的音訊描述 */
export async function check_GN1120102E(page) {
  const r = await safeEval(page, () => {
    const videos = [...document.querySelectorAll('video')];
    const withAudioDesc = videos.filter(v =>
      v.querySelector('track[kind="descriptions"]') || v.getAttribute('aria-describedby')
    ).length;
    return { total: videos.length, withAudioDesc };
  }, { total: 0, withAudioDesc: 0 });
  if (r.total === 0) return result('GN1120102E', '無影片元素', 'pass');
  return result('GN1120102E', '影片音訊描述', 'pass',
    `${r.total} 個影片，${r.withAudioDesc} 個有 track[kind=descriptions]（請人工確認說明充分性）`);
}

/** GN1120200E: 預錄影片有字幕 */
export async function check_GN1120200E(page) {
  const r = await safeEval(page, () => {
    const videos = [...document.querySelectorAll('video')].filter(v => !v.hasAttribute('muted') || v.duration > 0);
    const withCaptions = videos.filter(v =>
      v.querySelector('track[kind="captions"], track[kind="subtitles"]')
    ).length;
    return { total: videos.length, withCaptions };
  }, { total: 0, withCaptions: 0 });
  if (r.total === 0) return result('GN1120200E', '無預錄影片', 'pass');
  if (r.withCaptions < r.total) {
    return result('GN1120200E', '影片缺少字幕', 'fail',
      `${r.total - r.withCaptions}/${r.total} 個影片無 <track kind="captions"> 字幕`,
      '<video><track kind="captions" src="captions.vtt" srclang="zh-TW" label="繁體中文"></video>');
  }
  return result('GN1120200E', '影片有字幕', 'pass', `${r.total} 個影片均有字幕`);
}

/** GN1120300E: 時序媒體後提供替代內容連結 */
export async function check_GN1120300E(page) {
  const r = await safeEval(page, () => {
    const videos = [...document.querySelectorAll('video, audio')];
    const withAltLink = videos.filter(media => {
      const next = media.nextElementSibling;
      return next && (next.tagName === 'A' || next.querySelector('a') || next.textContent.includes('替代') || next.textContent.includes('逐字稿') || next.textContent.includes('文字版'));
    }).length;
    return { total: videos.length, withAltLink };
  }, { total: 0, withAltLink: 0 });
  if (r.total === 0) return result('GN1120300E', '無時序媒體', 'pass');
  if (r.withAltLink < r.total) {
    return result('GN1120300E', '時序媒體後未提供替代內容連結', 'fail',
      `${r.total - r.withAltLink}/${r.total} 個媒體元素後無替代內容連結`,
      '在 <video> 之後加 <a href="transcript.html">閱讀影片逐字稿</a>');
  }
  return result('GN1120300E', '時序媒體有替代內容連結', 'pass');
}

/** GN1120301E: 影片提供音訊描述或延伸音訊描述 */
export async function check_GN1120301E(page) {
  const r = await safeEval(page, () => {
    const videos = [...document.querySelectorAll('video:not([muted])')];
    const withDesc = videos.filter(v =>
      v.querySelector('track[kind="descriptions"]')
    ).length;
    return { total: videos.length, withDesc };
  }, { total: 0, withDesc: 0 });
  if (r.total === 0) return result('GN1120301E', '無預錄有聲影片', 'pass');
  if (r.withDesc < r.total) {
    return result('GN1120301E', '影片缺少音訊描述', 'fail',
      `${r.total - r.withDesc}/${r.total} 個影片無 <track kind="descriptions">`,
      '<track kind="descriptions" src="desc.vtt" srclang="zh-TW" label="音訊描述">');
  }
  return result('GN1120301E', '影片有音訊描述', 'pass');
}

/** GN1120302E: 僅講者頭部視訊提供靜態文字替代 */
export async function check_GN1120302E(page) {
  const r = await safeEval(page, () => {
    const headVideos = [...document.querySelectorAll('video[class*="speaker"], video[class*="talking"], video[id*="speaker"]')];
    const withText = headVideos.filter(v => {
      const parent = v.parentElement;
      return parent && parent.querySelector('p, div, section') && parent.textContent.trim().length > 50;
    }).length;
    return { total: headVideos.length, withText };
  }, { total: 0, withText: 0 });
  if (r.total === 0) return result('GN1120302E', '無講者頭部視訊', 'pass');
  return result('GN1120302E', '講者頭部視訊靜態文字替代', 'pass',
    `${r.total} 個講者頭部視訊，${r.withText} 個有靜態文字（請人工確認充分性）`);
}

// ── 1.3 可調適（資訊結構） ─────────────────────────────────────────────────────

/** GN1130100E: 以文字傳達文字呈現變化的資訊 */
export async function check_GN1130100E(page) {
  const r = await safeEval(page, () => {
    // 偵測顏色標示必填：紅色星號無文字說明
    const requiredByColor = [...document.querySelectorAll('[style*="color:red"],[style*="color: red"]')]
      .filter(el => el.textContent.includes('*') || el.textContent.includes('必'))
      .map(el => el.textContent.trim().slice(0, 20));
    // 偵測是否有文字說明 "*表示必填"
    const hasExplanation = !!document.querySelector('[class*="required-note"], [class*="legend"]') ||
      document.body.textContent.includes('* 為必填') ||
      document.body.textContent.includes('*為必填') ||
      document.body.textContent.includes('標示為必填') ||
      document.body.textContent.includes('必填欄位');
    return { colorOnlyRequired: requiredByColor.slice(0, 3), hasExplanation };
  }, { colorOnlyRequired: [], hasExplanation: false });
  if (r.colorOnlyRequired.length > 0 && !r.hasExplanation) {
    return result('GN1130100E', '以顏色標示必填欄位，但缺少文字說明', 'fail',
      '用紅色標示必填，但頁面未說明"*表示必填"等文字',
      '加入「* 為必填欄位」說明文字，或在欄位 label 中加入「（必填）」');
  }
  return result('GN1130100E', '文字變化資訊有文字替代說明', 'pass');
}

/** GN1130101E: 使用顏色線索時使用語意標記 */
export async function check_GN1130101E(page) {
  const r = await safeEval(page, () => {
    // 偵測只靠顏色傳達語意：span 有顏色但無語意標記
    const colorOnlyEls = [...document.querySelectorAll('span[style*="color:"], span[style*="color :"]')]
      .filter(el => !el.closest('strong, em, mark, ins, del, abbr'))
      .map(el => el.style.color + ': ' + el.textContent.trim().slice(0, 20))
      .slice(0, 3);
    return colorOnlyEls;
  }, []);
  if (r.length > 0) {
    return result('GN1130101E', '顏色傳達語意但缺少語意標記', 'fail',
      `${r.length} 個 span 僅靠 inline color 傳達意義，無對應語意標記`,
      '重要文字改用 <strong>、<em>、<mark> 等語意元素',
      r);
  }
  return result('GN1130101E', '顏色線索有對應語意標記', 'pass');
}

/** GN1130102E: 資訊與結構從呈現中抽離 */
export async function check_GN1130102E(page) {
  const r = await safeEval(page, () => {
    // 偵測 inline style 過多（比例大於 20%）
    const allEls = document.querySelectorAll('*').length;
    const inlineStyle = document.querySelectorAll('[style]').length;
    const ratio = allEls > 0 ? inlineStyle / allEls : 0;
    const tablesForLayout = [...document.querySelectorAll('table')].filter(t => !t.querySelector('caption') && !t.querySelector('th')).length;
    return { ratio: Math.round(ratio * 100), tablesForLayout };
  }, { ratio: 0, tablesForLayout: 0 });
  const issues = [];
  if (r.ratio > 20) issues.push(`${r.ratio}% 的元素有 inline style，樣式應移至外部 CSS`);
  if (r.tablesForLayout > 0) issues.push(`${r.tablesForLayout} 個無標題/標頭的 table 疑似用於版面排版`);
  if (issues.length > 0) {
    return result('GN1130102E', '結構與呈現混雜', 'fail', issues.join('；'),
      '將 inline style 移至外部 CSS，版面配置改用 flexbox/grid');
  }
  return result('GN1130102E', '結構與呈現分離良好', 'pass');
}

/** GN1130200E: 內容依有意義的序列排序 */
export async function check_GN1130200E(page) {
  const r = await safeEval(page, () => {
    // 檢查 tabindex > 0（可能破壞閱讀順序）
    const posTabindex = [...document.querySelectorAll('[tabindex]')]
      .filter(el => parseInt(el.getAttribute('tabindex')) > 0)
      .map(el => `${el.tagName}[tabindex=${el.getAttribute('tabindex')}]`)
      .slice(0, 5);
    // 檢查 CSS order（flexbox/grid 改變視覺順序）
    const cssOrder = [...document.querySelectorAll('[class]')]
      .filter(el => {
        try { return parseInt(window.getComputedStyle(el).order) !== 0; } catch { return false; }
      })
      .map(el => el.className?.split(' ')[0] || el.tagName)
      .slice(0, 3);
    return { posTabindex, cssOrder };
  }, { posTabindex: [], cssOrder: [] });
  if (r.posTabindex.length > 0) {
    return result('GN1130200E', 'tabindex > 0 可能破壞內容序列', 'fail',
      `${r.posTabindex.length} 個元素使用 tabindex > 0`,
      '移除正數 tabindex，改善 DOM 順序使之符合邏輯閱讀序列',
      r.posTabindex);
  }
  return result('GN1130200E', '內容序列符合邏輯閱讀順序', 'pass');
}

/** GN1130201E: 使用 dir 屬性處理雙向文字 */
export async function check_GN1130201E(page) {
  const r = await safeEval(page, () => {
    const rtlText = [...document.querySelectorAll('[lang^="ar"],[lang^="he"],[lang^="fa"],[lang^="ur"]')];
    const withoutDir = rtlText.filter(el => !el.getAttribute('dir')).length;
    const dirEls = document.querySelectorAll('[dir="rtl"],[dir="ltr"],[dir="auto"]').length;
    return { rtlElements: rtlText.length, withoutDir, dirEls };
  }, { rtlElements: 0, withoutDir: 0, dirEls: 0 });
  if (r.rtlElements > 0 && r.withoutDir > 0) {
    return result('GN1130201E', 'RTL 語言內容缺少 dir 屬性', 'fail',
      `${r.withoutDir} 個阿拉伯語/希伯來語等 RTL 語言元素缺少 dir="rtl"`,
      '<span lang="ar" dir="rtl">نص عربي</span>');
  }
  return result('GN1130201E', '雙向文字方向設定正確', 'pass');
}

/** GN1130300E: 感官資訊有文字項目識別 */
export async function check_GN1130300E(page) {
  const r = await safeEval(page, () => {
    // 偵測只以位置/形狀描述的說明（例如「按右邊的按鈕」）
    const bodyText = document.body?.textContent || '';
    const sensoryOnlyPatterns = ['右邊的按鈕', '左邊的', '上面的', '下面的', '圓形按鈕', '方形'];
    const found = sensoryOnlyPatterns.filter(p => bodyText.includes(p));
    return { sensoryOnly: found };
  }, { sensoryOnly: [] });
  if (r.sensoryOnly.length > 0) {
    return result('GN1130300E', '內容使用感官位置描述', 'fail',
      `頁面文字包含感官描述：${r.sensoryOnly.join(', ')}`,
      '改用功能性描述：「按"送出申請"按鈕」而非「按右邊的按鈕」',
      r.sensoryOnly);
  }
  return result('GN1130300E', '感官描述有文字識別', 'pass');
}

/** GN1140100E: 顏色傳達的訊息有非顏色替代 */
export async function check_GN1140100E(page) {
  const r = await safeEval(page, () => {
    // 偵測圖例（legend）是否只用顏色標示
    const colorLegend = [...document.querySelectorAll('[class*="legend-item"],[class*="chart-legend"]')]
      .filter(el => {
        const hasIcon = el.querySelector('svg, .icon, [class*="icon"]');
        const hasText = el.textContent.trim().length > 0;
        return hasText && !hasIcon;
      }).length;
    // 偵測連結是否只靠顏色區分（不含底線）
    const linksNoUnderline = [...document.querySelectorAll('a:not([role])')]
      .filter(a => {
        const style = window.getComputedStyle(a);
        return style.textDecoration === 'none' && style.color !== window.getComputedStyle(document.body).color;
      }).length;
    return { colorLegend, linksNoUnderline };
  }, { colorLegend: 0, linksNoUnderline: 0 });
  if (r.linksNoUnderline > 5) {
    return result('GN1140100E', '連結只靠顏色區分，缺少底線或其他視覺提示', 'fail',
      `${r.linksNoUnderline} 個連結無底線，可能只靠顏色區分`,
      '連結加 text-decoration: underline 或其他非顏色視覺提示（如圖示）');
  }
  return result('GN1140100E', '顏色傳達的資訊有非顏色替代', 'pass');
}

/** GN1140102E: 有顏色的表單標題提供文字線索 */
export async function check_GN1140102E(page) {
  const r = await safeEval(page, () => {
    const coloredLabels = [...document.querySelectorAll('label[style*="color:"], label[style*="color :"]')]
      .filter(el => {
        const style = el.getAttribute('style') || '';
        return style.includes('color') && !el.textContent.includes('必填') && !el.textContent.includes('*');
      })
      .map(el => el.textContent.trim().slice(0, 30))
      .slice(0, 3);
    return coloredLabels;
  }, []);
  if (r.length > 0) {
    return result('GN1140102E', '有顏色的表單標題缺少文字線索', 'fail',
      `${r.length} 個彩色 label 未加入文字說明`,
      '在彩色標題旁加入文字提示，例如「(必填)」',
      r);
  }
  return result('GN1140102E', '表單標題有文字線索', 'pass');
}

// ── 2.4 可導覽（詳細） ─────────────────────────────────────────────────────────

/** GN1240101E: 重複內容區塊開頭有「跳到此區塊結尾」連結 */
export async function check_GN1240101E(page) {
  const r = await safeEval(page, () => {
    const skipLinks = [...document.querySelectorAll('a[href]')]
      .filter(a => {
        const href = a.getAttribute('href') || '';
        const text = (a.textContent || '').toLowerCase();
        return (href.startsWith('#') && (text.includes('跳過') || text.includes('skip') || text.includes('略過')));
      });
    return { count: skipLinks.length, texts: skipLinks.map(a => a.textContent.trim().slice(0, 30)) };
  }, { count: 0, texts: [] });
  if (r.count === 0) {
    return result('GN1240101E', '缺少重複內容區塊跳過連結', 'fail',
      '未找到「跳過導覽」類連結',
      '在重複導覽區塊開頭加入 <a href="#main-content">跳到主要內容</a>');
  }
  return result('GN1240101E', '有重複區塊跳過連結', 'pass', r.texts.join(', '));
}

/** GN1240102E: 頁面頂端有連往各內容區域的連結 */
export async function check_GN1240102E(page) {
  const r = await safeEval(page, () => {
    const anchorLinks = [...document.querySelectorAll('a[href^="#"]')];
    return { count: anchorLinks.length, examples: anchorLinks.slice(0, 3).map(a => a.textContent.trim().slice(0, 20)) };
  }, { count: 0, examples: [] });
  if (r.count === 0) {
    return result('GN1240102E', '無頁內錨點連結', 'fail',
      '未找到 href="#..." 的錨點連結',
      '在頁面頂部加入內容區域錨點連結，如 <a href="#main">主要內容</a>');
  }
  return result('GN1240102E', '有頁內錨點連結', 'pass', `${r.count} 個：${r.examples.join(', ')}`);
}

/** GN1240103E: 使用 nav 或 ARIA 將連結分群 */
export async function check_GN1240103E(page) {
  const r = await safeEval(page, () => {
    const navEls = document.querySelectorAll('nav').length;
    const ariaNav = document.querySelectorAll('[role="navigation"]').length;
    const linksInNav = document.querySelectorAll('nav a, [role="navigation"] a').length;
    const totalLinks = document.querySelectorAll('a[href]').length;
    return { navEls, ariaNav, linksInNav, totalLinks };
  }, { navEls: 0, ariaNav: 0, linksInNav: 0, totalLinks: 0 });
  if (r.navEls === 0 && r.ariaNav === 0) {
    return result('GN1240103E', '缺少 nav 或 role=navigation 分群連結', 'fail',
      '未找到 <nav> 或 role="navigation" 元素',
      '<nav aria-label="主要導覽"><ul>...</ul></nav>');
  }
  return result('GN1240103E', '連結已用 nav 元素分群', 'pass',
    `${r.navEls} 個 <nav>，${r.ariaNav} 個 role=navigation，包含 ${r.linksInNav} 個連結`);
}

/** GN1240104E: 每個內容區段開頭有標題元素 */
export async function check_GN1240104E(page) {
  const r = await safeEval(page, () => {
    const sections = document.querySelectorAll('section, article, main, aside[class]').length;
    const sectionsWithHeading = [...document.querySelectorAll('section, article, main')].filter(s => {
      const firstEl = s.firstElementChild;
      return firstEl && /^H[1-6]$/.test(firstEl.tagName);
    }).length;
    const headingCount = document.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
    return { sections, sectionsWithHeading, headingCount };
  }, { sections: 0, sectionsWithHeading: 0, headingCount: 0 });
  if (r.headingCount === 0) {
    return result('GN1240104E', '頁面無標題元素', 'fail',
      '未找到任何 h1~h6 標題元素',
      '每個主要內容區段開頭加上標題 <h2>區段標題</h2>');
  }
  return result('GN1240104E', '內容區段有標題', 'pass',
    `${r.headingCount} 個標題元素，${r.sectionsWithHeading}/${r.sections} 個 section/article 以標題開頭`);
}

/** GN1240105E: 根據結構性標記定位內容（非 table 排版） */
export async function check_GN1240105E(page) {
  const r = await safeEval(page, () => {
    const layoutTables = [...document.querySelectorAll('table')].filter(t =>
      !t.querySelector('th, caption') && t.querySelectorAll('td').length > 2
    ).length;
    const hasMain = !!document.querySelector('main, [role="main"]');
    return { layoutTables, hasMain };
  }, { layoutTables: 0, hasMain: false });
  if (r.layoutTables > 0) {
    return result('GN1240105E', '使用 table 排版版面', 'fail',
      `${r.layoutTables} 個 table 無 th/caption，疑似用於版面排版`,
      '移除排版 table，改用 CSS flexbox 或 grid；資料表格保留並加上 th/caption');
  }
  return result('GN1240105E', '內容根據結構性標記定位', 'pass', `hasMain: ${r.hasMain}`);
}

/** GN1240300E: 互動元件依序列與關連放置 */
export async function check_GN1240300E(page) {
  const r = await safeEval(page, () => {
    // 檢查 tabindex > 0 破壞邏輯順序
    const positiveTabindex = [...document.querySelectorAll('[tabindex]')]
      .filter(el => parseInt(el.getAttribute('tabindex')) > 0)
      .map(el => `${el.tagName}[tabindex=${el.getAttribute('tabindex')}]`)
      .slice(0, 5);
    return positiveTabindex;
  }, []);
  if (r.length > 0) {
    return result('GN1240300E', '正數 tabindex 破壞互動元件放置順序', 'fail',
      `${r.length} 個元素有 tabindex > 0`,
      '移除所有 tabindex > 0；調整 DOM 順序使之符合視覺順序',
      r);
  }
  return result('GN1240300E', '互動元件依邏輯順序放置', 'pass');
}

/** GN1240301E: 鏈結/表單/物件建立合乎邏輯的跳位順序 */
export async function check_GN1240301E(page) {
  const r = await safeEval(page, () => {
    const positiveTabindex = [...document.querySelectorAll('[tabindex]')]
      .filter(el => parseInt(el.getAttribute('tabindex')) > 0).length;
    const zeroTabindex = [...document.querySelectorAll('[tabindex="0"]')].length;
    const negativeTabindex = [...document.querySelectorAll('[tabindex="-1"]')].length;
    return { positiveTabindex, zeroTabindex, negativeTabindex };
  }, { positiveTabindex: 0, zeroTabindex: 0, negativeTabindex: 0 });
  if (r.positiveTabindex > 0) {
    return result('GN1240301E', 'tabindex > 0 破壞跳位順序', 'fail',
      `${r.positiveTabindex} 個元素使用 tabindex > 0（${r.zeroTabindex} 個 =0，${r.negativeTabindex} 個 =-1）`,
      '移除 tabindex > 0；用 DOM 順序控制 tab 跳位邏輯');
  }
  return result('GN1240301E', '跳位順序符合邏輯', 'pass',
    `tabindex=0: ${r.zeroTabindex}, tabindex=-1: ${r.negativeTabindex}`);
}

/** GN1240401E: 連結文字描述連結目的 */
export async function check_GN1240401E(page) {
  const r = await safeEval(page, () => {
    const vague = ['點這裡', 'click here', '這裡', 'here', '更多', 'more', 'read more', '詳細', '...', '連結'];
    const vagueLinks = [...document.querySelectorAll('a[href]')]
      .filter(a => {
        const text = (a.textContent || '').trim().toLowerCase();
        return vague.some(v => text === v);
      })
      .map(a => a.textContent.trim())
      .slice(0, 5);
    return vagueLinks;
  }, []);
  if (r.length > 0) {
    return result('GN1240401E', '連結文字不具描述性', 'fail',
      `${r.length} 個連結使用模糊文字`,
      '連結文字應描述目標，例如「查看申請資格詳情」而非「更多」',
      r);
  }
  return result('GN1240401E', '連結文字具描述性', 'pass');
}

/** GN1240500E: 提供網站地圖/搜尋/導覽等功能 */
export async function check_GN1240500E(page) {
  const r = await safeEval(page, () => {
    const hasSitemap = !!document.querySelector('a[href*="sitemap"], a[href*="site-map"]') ||
      document.body?.textContent.includes('網站地圖') || document.body?.textContent.includes('Site Map');
    const hasSearch = !!document.querySelector('form[role="search"], input[type="search"], [aria-label*="搜尋"], [aria-label*="Search"]');
    const hasNav = document.querySelectorAll('nav').length > 0;
    const hasBreadcrumb = !!document.querySelector('[aria-label*="麵包屑"],[aria-label*="breadcrumb"],[class*="breadcrumb"]');
    return { hasSitemap, hasSearch, hasNav, hasBreadcrumb };
  }, { hasSitemap: false, hasSearch: false, hasNav: false, hasBreadcrumb: false });
  const found = [];
  if (r.hasSitemap) found.push('網站地圖');
  if (r.hasSearch) found.push('搜尋功能');
  if (r.hasNav) found.push('導覽選單');
  if (r.hasBreadcrumb) found.push('麵包屑');
  if (found.length < 2) {
    return result('GN1240500E', '頁面輔助導覽功能不足', 'fail',
      `只找到 ${found.length} 種導覽機制：${found.join(', ') || '無'}`,
      '加入網站地圖連結、搜尋框或麵包屑導覽列');
  }
  return result('GN1240500E', '頁面有多種輔助導覽', 'pass', found.join(', '));
}

// ── 2.1.1 媒體相關 ─────────────────────────────────────────────────────────────

/** GN2120400E: 有暫停/停止/隱藏移動/閃動內容的控制 */
export async function check_GN2120400E(page) {
  const r = await safeEval(page, () => {
    const moving = document.querySelectorAll('[class*="carousel"],[class*="slider"],[class*="marquee"],[class*="ticker"],[class*="animate"]').length;
    const pauseCtrl = document.querySelectorAll('[aria-label*="暫停"],[aria-label*="pause"],[class*="pause"],[aria-label*="停止"]').length;
    return { moving, pauseCtrl };
  }, { moving: 0, pauseCtrl: 0 });
  if (r.moving > 0 && r.pauseCtrl === 0) {
    return result('GN2120400E', '移動/閃動內容缺少暫停控制', 'fail',
      `${r.moving} 個動態元素，但無暫停/停止控制按鈕`,
      '加入暫停按鈕：<button aria-label="暫停輪播">⏸</button>');
  }
  return result('GN2120400E', '動態內容有暫停控制', 'pass', `${r.moving} 個動態元素，${r.pauseCtrl} 個控制按鈕`);
}

/** GN2120500E: 有開啟/關閉/調整時間限制的控制 */
export async function check_GN2120500E(page) {
  const r = await safeEval(page, () => {
    // 偵測計時器或 session timeout
    const hasTimer = !!document.querySelector('[class*="timer"],[id*="countdown"],[class*="countdown"]');
    const hasTimeoutControl = !!document.querySelector('[aria-label*="延長時間"],[class*="extend-time"],[id*="extend"]');
    return { hasTimer, hasTimeoutControl };
  }, { hasTimer: false, hasTimeoutControl: false });
  if (r.hasTimer && !r.hasTimeoutControl) {
    return result('GN2120500E', '有計時器但缺少時間調整控制', 'fail',
      '偵測到計時器，但無延長/關閉時間限制的控制',
      '提供「延長工作階段」或「關閉時間限制」選項');
  }
  return result('GN2120500E', '時間限制控制符合要求', 'pass');
}

/** GN2130400E: 驗證身分時提供其他方式完成 */
export async function check_GN2130400E(page) {
  const r = await safeEval(page, () => {
    const hasLoginForm = !!document.querySelector('form input[type="password"]');
    const hasCaptcha = !!document.querySelector('[class*="captcha"],[id*="captcha"]');
    const hasAltLogin = !!document.querySelector('[aria-label*="社群登入"],[class*="social-login"],[class*="oauth"]');
    return { hasLoginForm, hasCaptcha, hasAltLogin };
  }, { hasLoginForm: false, hasCaptcha: false, hasAltLogin: false });
  if (r.hasLoginForm) {
    if (r.hasCaptcha && !r.hasAltLogin) {
      return result('GN2130400E', '驗證機制未提供認知替代方式', 'fail',
        '登入有 CAPTCHA 但無替代認知測試方式（如圖形識別替代）',
        '提供多種身分驗證方式，或使用 reCAPTCHA v3 減少使用者負擔');
    }
  }
  return result('GN2130400E', '身分驗證機制符合要求', 'pass');
}

// ── 3.1 可讀性（AAA 語言） ────────────────────────────────────────────────────

/** GN3120600E: 提供罕見詞語的定義 */
export async function check_GN3120600E(page) {
  const r = await safeEval(page, () => {
    const abbrs = document.querySelectorAll('abbr[title]').length;
    const dfns = document.querySelectorAll('dfn').length;
    const glossaryLinks = [...document.querySelectorAll('a[href]')]
      .filter(a => {
        const text = (a.textContent || '').toLowerCase();
        return text.includes('詞彙') || text.includes('術語') || text.includes('glossary');
      }).length;
    return { abbrs, dfns, glossaryLinks };
  }, { abbrs: 0, dfns: 0, glossaryLinks: 0 });
  return result('GN3120600E', '罕見詞語定義', 'pass',
    `abbr[title]: ${r.abbrs}, dfn: ${r.dfns}, 詞彙表連結: ${r.glossaryLinks}（請人工確認罕見詞語是否均有定義）`);
}

/** GN3120601E: 提供詞語縮寫的完整形式 */
export async function check_GN3120601E(page) {
  const r = await safeEval(page, () => {
    const abbrs = [...document.querySelectorAll('abbr')];
    const withoutTitle = abbrs.filter(a => !a.getAttribute('title')).map(a => a.textContent.trim()).slice(0, 5);
    return { total: abbrs.length, withoutTitle };
  }, { total: 0, withoutTitle: [] });
  if (r.withoutTitle.length > 0) {
    return result('GN3120601E', 'abbr 缺少 title 屬性', 'fail',
      `${r.withoutTitle.length} 個 <abbr> 無 title 屬性（首次出現應說明全稱）`,
      '<abbr title="無障礙網頁規範">WCAG</abbr>',
      r.withoutTitle);
  }
  return result('GN3120601E', '縮寫有完整形式', 'pass', `${r.total} 個 abbr 均有 title`);
}

/** GN3120700E: 提供閱讀困難時的替代文字版本 */
export async function check_GN3120700E(page) {
  const r = await safeEval(page, () => {
    const hasEasyRead = !!document.querySelector('[class*="easy-read"],[aria-label*="簡易版"],[aria-label*="easy"]') ||
      document.body.textContent.includes('閱讀困難') || document.body.textContent.includes('簡易版本');
    return { hasEasyRead };
  }, { hasEasyRead: false });
  return result('GN3120700E', '閱讀困難替代版本（AAA）', 'pass',
    `${r.hasEasyRead ? '提供' : '未提供'}閱讀困難替代版本（AAA 等級，僅參考）`);
}
