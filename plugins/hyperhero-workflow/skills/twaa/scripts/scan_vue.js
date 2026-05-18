#!/usr/bin/env node
/**
 * scan_vue.js — Vue SFC 靜態 a11y 掃描
 *
 * 用法：
 *   node scan_vue.js path/to/file.vue [--json]
 *   node scan_vue.js path/to/file.vue path/to/another.vue --json
 *
 * 輸出（--json 模式）：
 *   [{rule, guideline, severity, file, line, column, snippet, message}, ...]
 */
import { parse } from '@vue/compiler-sfc';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const RULES = {
  'img-without-alt': {
    guideline: '1.1.1',
    severity: 'critical',
    message: '<img> 缺少 alt 屬性',
  },
  'dialog-disable-esc': {
    guideline: '2.1.2',
    severity: 'critical',
    message: 'Dialog 顯式關閉 ESC（closeOnEscape="false"）會造成鍵盤陷阱',
  },
  'teleport-focus-risk': {
    guideline: '2.4.3',
    severity: 'high',
    message: '<Teleport> 會把元素抽出 DOM，需確認 focus trap 是否正確設置',
  },
  'div-with-button-role': {
    guideline: '4.1.2',
    severity: 'high',
    message: '<div role="button"> 缺鍵盤事件，請改用 <button>',
  },
  'v-html-usage': {
    guideline: '3.1.5',
    severity: 'medium',
    message: 'v-html 渲染未驗證 HTML，可能引入未經 a11y 驗證的 markup',
  },
};

function scanTemplate(ast, file, source) {
  const findings = [];
  if (!ast) return findings;

  function walk(node) {
    if (!node) return;
    if (node.type === 1 /* Element */) {
      const tag = node.tag;
      const props = node.props || [];

      // img 無 alt
      if (tag === 'img') {
        const hasAlt = props.some(p => p.name === 'alt' || (p.name === 'bind' && p.arg?.content === 'alt'));
        if (!hasAlt) {
          findings.push(makeFinding('img-without-alt', file, node, source));
        }
      }

      // Dialog closeOnEscape=false
      if (tag === 'Dialog') {
        const closeProp = props.find(
          p => (p.name === 'closeOnEscape' || (p.name === 'bind' && p.arg?.content === 'closeOnEscape'))
        );
        if (closeProp) {
          const isFalse = closeProp.value?.content === 'false' || closeProp.exp?.content === 'false';
          if (isFalse) findings.push(makeFinding('dialog-disable-esc', file, node, source));
        }
      }

      // Teleport
      if (tag === 'Teleport') {
        findings.push(makeFinding('teleport-focus-risk', file, node, source));
      }

      // div role=button
      if (tag === 'div') {
        const role = props.find(p => p.name === 'role');
        if (role?.value?.content === 'button') {
          findings.push(makeFinding('div-with-button-role', file, node, source));
        }
      }

      // v-html
      const vHtml = props.find(p => p.name === 'html');
      if (vHtml) {
        findings.push(makeFinding('v-html-usage', file, node, source));
      }
    }
    if (node.children) node.children.forEach(walk);
  }
  walk(ast);
  return findings;
}

function makeFinding(rule, file, node, source) {
  const r = RULES[rule];
  const loc = node.loc || {};
  return {
    rule,
    guideline: r.guideline,
    severity: r.severity,
    file,
    line: loc.start?.line ?? 0,
    column: loc.start?.column ?? 0,
    snippet: source.slice(loc.start?.offset ?? 0, loc.end?.offset ?? 0).slice(0, 200),
    message: r.message,
  };
}

function scanFile(filePath) {
  const source = readFileSync(filePath, 'utf-8');
  const { descriptor } = parse(source, { filename: filePath });
  const templateAst = descriptor.template?.ast;
  return scanTemplate(templateAst, filePath, source);
}

const args = process.argv.slice(2);
const files = args.filter(a => !a.startsWith('--'));
const isJson = args.includes('--json');

const all = files.flatMap(f => scanFile(resolve(f)));

if (isJson) {
  console.log(JSON.stringify(all, null, 2));
} else {
  for (const f of all) {
    console.log(`[${f.severity}] ${f.guideline} ${f.file}:${f.line}  ${f.message}`);
  }
}
