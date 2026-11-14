import { cloneElement, isValidElement, type ReactElement } from 'react';
import { renderElement, type RenderProp } from './render-element';

/**
 * Renders the root of a component whose parts are internal markup (a `div` by default). The parts in
 * `props.children` win over the children of an element given through `render`.
 *
 * @typeParam P - The root props, with the parts as `children`.
 * @typeParam S - The state for the function form of `render`.
 * @param render - The author's `render` prop.
 * @param props - The root props, with the parts as `children`.
 * @param state - The state for the function form of `render`.
 * @returns The root element.
 */
export function renderContainerRoot<P extends object, S>(
  render: RenderProp<P, S> | undefined,
  props: P,
  state: S,
): ReactElement {
  const element = isValidElement<{ children?: undefined }>(render)
    ? cloneElement(render, { children: undefined })
    : render;
  return renderElement<P, S>(element, 'div', props, state);
}
