import type { CSSProperties } from 'react';
import { composeEventHandlers, type EventHandler } from './compose-event-handlers';

type Props = Readonly<Record<string, unknown>>;

const isHandlerName = (name: string): boolean => /^on[A-Z]/.test(name);

/**
 * Merges the part's props with the consumer's: the consumer wins, handlers are composed
 * (the consumer's first), `className` is joined, `style` is merged and an `undefined`
 * consumer value never overrides. `ref` is not merged here.
 *
 * @param ours - The part's props.
 * @param theirs - The consumer's props, or the props of the element given through `render`.
 * @returns A new record.
 */
export function mergeProps(ours: Props, theirs: Props): Record<string, unknown> {
  const result: Record<string, unknown> = { ...ours };
  for (const [name, value] of Object.entries(theirs)) {
    if (value === undefined) continue;
    if (name === 'className') {
      result[name] = [ours[name], value].filter(Boolean).join(' ');
    } else if (name === 'style') {
      result[name] = { ...(ours[name] as CSSProperties | undefined), ...(value as CSSProperties) };
    } else if (isHandlerName(name) && typeof value === 'function') {
      result[name] = composeEventHandlers(
        value as EventHandler<unknown>,
        ours[name] as EventHandler<unknown> | undefined,
      );
    } else {
      result[name] = value;
    }
  }
  return result;
}

/**
 * The consumer's props without the attributes the machine owns, so a consumer value can never replace a state fact.
 *
 * @param props - The consumer's props.
 * @param reserved - The attribute names the machine renders.
 * @returns A new record.
 */
export function withoutReserved(props: Props, reserved: readonly string[]): Record<string, unknown> {
  return Object.fromEntries(Object.entries(props).filter(([name]) => !reserved.includes(name)));
}
