import type ts from 'typescript';

/**
 * The text of TypeScript display parts, with each link written as `{@link name | text}`. `displayPartsToString` joins the
 * name and the text of a link without a separator (`{@link Thingnative}`), so the link is rebuilt here for
 * `withoutLinks` to read.
 */
export function displayTextOf(parts: readonly ts.SymbolDisplayPart[] | undefined = []): string {
  let text = '';
  let name = '';
  let label = '';
  let opener = '';
  for (const part of parts) {
    if (part.kind === 'link' && part.text.startsWith('{@link')) {
      opener = part.text.trimEnd();
      name = '';
      label = '';
    } else if (part.kind === 'link') {
      const inner = name === '' ? label : `${name}${label === '' ? '' : ` | ${label}`}`;
      text += `${opener} ${inner.trim()}}`;
      opener = '';
    } else if (opener !== '') {
      if (part.kind === 'linkName') name += part.text;
      else label += part.text;
    } else {
      text += part.text;
    }
  }
  return text;
}
