import { render } from '@testing-library/vue';
import { defineComponent, type Component, type VNode } from 'vue';

/** Wraps a render function in a root component, so a test can mount any vnode tree. */
export function view(renderFn: () => VNode | VNode[]): Component {
  return defineComponent({ setup: () => renderFn });
}

/** Mounts a render function in the DOM. */
export function mountView(renderFn: () => VNode | VNode[]): ReturnType<typeof render> {
  return render(view(renderFn));
}

/** The first element matching the selector; fails the test when there is none. */
export function pick(container: Element, selector: string): HTMLElement {
  const element = container.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`No element matches ${selector}`);
  return element;
}
