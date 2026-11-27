// Stands in for the React Server Components bundler, which this repository does not run: a module whose first
// statement is "use client" becomes a set of client references made by React's own `registerClientReference`, so
// the Flight renderer treats them as it does in an application and dotting into one throws.
import { registerClientReference } from 'react-server-dom-webpack/server';

const DIRECTIVE = /^\s*(["'])use client\1;?/;

export function clientReference(id, name) {
  return registerClientReference(
    () => {
      throw new Error(`Attempted to call ${name}() from the server but ${name} is on the client.`);
    },
    id,
    name,
  );
}

function exportedNames(source) {
  const names = new Set();
  for (const [, list] of source.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of list.split(',')) {
      const name = part
        .trim()
        .split(/\s+as\s+/)
        .pop();
      if (name) names.add(name);
    }
  }
  for (const [, name] of source.matchAll(/export\s+(?:async\s+)?(?:const|let|function|class)\s+([\w$]+)/g)) {
    names.add(name);
  }
  return [...names];
}

export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context);
  if (result.format !== 'module' || result.source == null) return result;
  const source = result.source.toString();
  if (!DIRECTIVE.test(source)) return result;
  const lines = exportedNames(source).map(
    (name) => `export const ${name} = clientReference(${JSON.stringify(url)}, ${JSON.stringify(name)});`,
  );
  return {
    format: 'module',
    shortCircuit: true,
    source: `import { clientReference } from ${JSON.stringify(import.meta.url)};\n${lines.join('\n')}\n`,
  };
}
