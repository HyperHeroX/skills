#!/usr/bin/env node
/**
 * scan_react.mjs — React/JSX 靜態 a11y 掃描
 * 用法：node scan_react.mjs path/to/file.tsx [--json]
 */
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
const traverse = _traverse.default;
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const RULES = {
  'img-without-alt': { guideline: '1.1.1', severity: 'critical', message: '<img> 缺 alt' },
  'div-with-button-role': {
    guideline: '4.1.2', severity: 'high',
    message: '<div role="button"> 缺鍵盤事件',
  },
  'dangerously-set-inner-html': {
    guideline: '3.1.5', severity: 'medium',
    message: 'dangerouslySetInnerHTML 注入未經驗證 HTML',
  },
  'forwardref-without-ref': {
    guideline: '4.1.2', severity: 'high',
    message: 'forwardRef 未實際 forward ref，父元件無法 focus 子',
  },
};

function findings(file) {
  const code = readFileSync(file, 'utf-8');
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });

  const out = [];
  function push(rule, loc, snippet) {
    const r = RULES[rule];
    out.push({
      rule, guideline: r.guideline, severity: r.severity, file,
      line: loc?.start?.line ?? 0, column: loc?.start?.column ?? 0,
      snippet: snippet?.slice(0, 200) ?? '', message: r.message,
    });
  }

  traverse(ast, {
    JSXElement(p) {
      const opening = p.node.openingElement;
      const name = opening.name.type === 'JSXIdentifier' ? opening.name.name : '';
      const attrs = opening.attributes;

      if (name === 'img') {
        const hasAlt = attrs.some(
          a => a.type === 'JSXAttribute' && a.name?.name === 'alt'
        );
        if (!hasAlt) push('img-without-alt', opening.loc, code.slice(opening.start, opening.end));
      }

      if (name === 'div') {
        const roleAttr = attrs.find(
          a => a.type === 'JSXAttribute' && a.name?.name === 'role'
        );
        if (roleAttr?.value?.value === 'button') {
          push('div-with-button-role', opening.loc, code.slice(opening.start, opening.end));
        }
      }

      const dsih = attrs.find(
        a => a.type === 'JSXAttribute' && a.name?.name === 'dangerouslySetInnerHTML'
      );
      if (dsih) push('dangerously-set-inner-html', opening.loc, code.slice(opening.start, opening.end));
    },
    CallExpression(p) {
      if (p.node.callee.type === 'Identifier' && p.node.callee.name === 'forwardRef') {
        const fn = p.node.arguments[0];
        if (fn && (fn.params?.length ?? 0) < 2) {
          push('forwardref-without-ref', p.node.loc, code.slice(p.node.start, p.node.end));
        }
      }
    },
  });
  return out;
}

const args = process.argv.slice(2);
const files = args.filter(a => !a.startsWith('--'));
const isJson = args.includes('--json');
const all = files.flatMap(f => findings(resolve(f)));

if (isJson) console.log(JSON.stringify(all, null, 2));
else for (const f of all) console.log(`[${f.severity}] ${f.guideline} ${f.file}:${f.line}  ${f.message}`);
