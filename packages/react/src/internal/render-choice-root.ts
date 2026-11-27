import type { ReactElement } from 'react';
import type { ChoiceRootProps } from './choice-control.types';
import { renderContainerRoot } from './render-container-root';
import type { RenderProp } from './render-element';

/**
 * Renders the root of a choice control (a `div` by default). The parts in `props.children` win over the
 * children of an element given through `render`.
 *
 * @param render - The author's `render` prop.
 * @param props - The root props, with the parts as `children`.
 * @param state - The state for the function form of `render`.
 * @returns The root element.
 */
export function renderChoiceRoot<S>(
  render: RenderProp<ChoiceRootProps, S> | undefined,
  props: ChoiceRootProps,
  state: S,
): ReactElement {
  return renderContainerRoot(render, props, state);
}
