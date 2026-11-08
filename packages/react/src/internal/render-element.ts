import { cloneElement, createElement, isValidElement, type ReactElement } from 'react';
import { mergeProps } from './merge-props';

/**
 * The `render` prop: an element, or a function that receives the merged props and the part state. The element
 * form works from a Server Component. The function form does not, because a function cannot be sent from the server.
 *
 * @typeParam P - The merged props that the function receives: the native props and the props of the part.
 * @typeParam S - The state of the part that the function receives.
 */
export type RenderProp<P, S> = ReactElement | ((props: P, state: S) => ReactElement);

/**
 * Renders a part's element. Without `render` it creates `defaultTag`. The element form merges the
 * part's props under the element's own props; the function form receives all merged props
 * including `ref` and must spread them on one element. The element's own `ref` is not merged
 * here: the part puts it into `props.ref`.
 *
 * @param render - The consumer's `render` prop.
 * @param defaultTag - The element to render without `render`.
 * @param props - The part's props.
 * @param state - The part's public state.
 * @returns The element.
 */
export function renderElement<P extends object, S>(
  render: RenderProp<P, S> | undefined,
  defaultTag: string,
  props: P,
  state: S,
): ReactElement {
  if (typeof render === 'function') return render(props, state);
  if (isValidElement<Record<string, unknown>>(render)) {
    // The element's own ref is merged by the part into `props.ref`, so it must not win here.
    const own: { ref?: unknown; [name: string]: unknown } = { ...render.props };
    delete own.ref;
    return cloneElement(render, mergeProps(props as Readonly<Record<string, unknown>>, own));
  }
  return createElement(defaultTag, props as Readonly<Record<string, unknown>>);
}
