import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { insideRoot } from '../inside-root';

const SCRIPT = new RegExp('<script[^>]*>([^]*?)</script>', 'g');

/**
 * A reader of the declaration that `vue-component-meta` points to with a file and the start of the declaration (it
 * gives no node for a member of a `.vue` file). The `.vue` file is read as its `<script>` block that holds the
 * position; each text is parsed once. A file outside the workspace `root`, a position with no declaration that has a
 * doc comment, and a file that cannot be read give `undefined`.
 */
export function declarationReader(root: string): (file: string, position: number) => ts.Node | undefined {
  const parsed = new Map<string, ts.SourceFile>();
  return (file, position) => {
    let text: string;
    try {
      text = readFileSync(insideRoot(root, file, 'declaration file'), 'utf8');
    } catch {
      return undefined;
    }
    let offset = 0;
    let code = text;
    if (file.endsWith('.vue')) {
      const block = [...text.matchAll(SCRIPT)].find((match) => {
        const start = match.index + match[0].indexOf('>') + 1;
        return position >= start && position <= start + (match[1] ?? '').length;
      });
      if (block === undefined) return undefined;
      offset = block.index + block[0].indexOf('>') + 1;
      code = block[1] ?? '';
    }
    const key = `${String(offset)}:${code}`;
    let source = parsed.get(key);
    if (source === undefined) {
      source = ts.createSourceFile('declaration.ts', code, ts.ScriptTarget.Latest, true);
      parsed.set(key, source);
    }
    return declarationAt(source, position - offset);
  };
}

/** The outermost node of the file that starts at `position` and has a doc comment. */
function declarationAt(source: ts.SourceFile, position: number): ts.Node | undefined {
  let found: ts.Node | undefined;
  const visit = (node: ts.Node): void => {
    if (found !== undefined || position < node.pos || position >= node.end) return;
    const docs = (node as { jsDoc?: readonly ts.JSDoc[] }).jsDoc;
    if (docs !== undefined && docs.length > 0 && node.getStart(source) === position) found = node;
    else ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}
