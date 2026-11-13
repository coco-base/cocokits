import { parseSvg } from '@cocokits/cdk/icon-registry';
import type { Icon } from '@cocokits/icons';

/** The most strings kept at once; a full cache starts again, so a stream of different strings cannot grow it. */
const LIMIT = 200;

/** Results of {@link parseSvg} by string. A parse result depends on the string only, so sharing it is safe. */
const parsed = new Map<string, Icon | undefined>();

/**
 * Parses an `<svg>` string once per value. Client only: it uses `DOMParser`, so a component calls it from a
 * `useSyncExternalStore` snapshot, never from a server snapshot.
 *
 * @param svg - The full SVG string.
 * @returns The icon, or `undefined` when the string is not an `<svg>`.
 */
export function parsedSvg(svg: string): Icon | undefined {
  if (!parsed.has(svg)) {
    if (parsed.size >= LIMIT) parsed.clear();
    parsed.set(svg, parseSvg(svg));
  }
  return parsed.get(svg);
}
