import type { Icon } from '@cocokits/icons';

const SVG_NAMESPACE_ATTRIBUTE = / xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g;

function numberAttribute(root: Element, name: string): string | undefined {
  const text = root.getAttribute(name)?.trim();
  if (!text) return undefined;
  const value = Number(text);
  return Number.isFinite(value) && value > 0 ? String(value) : undefined;
}

function readViewBox(root: Element): string | undefined {
  const viewBox = root.getAttribute('viewBox')?.trim();
  if (viewBox) return viewBox;
  const width = numberAttribute(root, 'width');
  const height = numberAttribute(root, 'height');
  return width !== undefined && height !== undefined ? `0 0 ${width} ${height}` : undefined;
}

/**
 * Turns a full `<svg>` string into an {@link Icon}. Use it only in the browser: it reads the string with `DOMParser`.
 *
 * @remarks
 * The `viewBox` is the one of the `<svg>`, else `0 0 <width> <height>` when it has a numeric `width` and `height`.
 * The `body` is the markup inside the `<svg>`. Trusted content only: the markup is not sanitised.
 *
 * @param svg - A string whose root element is an `<svg>`.
 * @returns The icon, or `undefined` when the string is not an SVG element or gives no `viewBox`.
 * @example
 * const icon = parseSvg(await fetch(url).then((response) => response.text()));
 */
export function parseSvg(svg: string): Icon | undefined {
  if (typeof DOMParser === 'undefined') return undefined;
  const root = new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement;
  if (root.localName !== 'svg' || root.getElementsByTagName('parsererror').length > 0) return undefined;
  const viewBox = readViewBox(root);
  if (viewBox === undefined) return undefined;
  const serializer = new XMLSerializer();
  const body = Array.from(root.childNodes, (node) => serializer.serializeToString(node))
    .join('')
    .replace(SVG_NAMESPACE_ATTRIBUTE, '');
  return { viewBox, body };
}
