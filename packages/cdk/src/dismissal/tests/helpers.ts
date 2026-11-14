import { afterEach } from 'vitest';
import { createDismissLayer } from '../index';
import type { DismissIntent, DismissLayer, DismissReason } from '../index';

const created: DismissLayer[] = [];

afterEach(() => {
  created.splice(0).forEach((layer) => {
    layer.destroy();
  });
  document.body.innerHTML = '';
  document.body.style.cursor = '';
});

export function el(id: string, parent: Element = document.body): HTMLElement {
  const element = document.createElement('div');
  element.id = id;
  parent.append(element);
  return element;
}

export type Call = [DismissReason, string];

export function layerFor(
  elements: Element[],
  extra: Partial<Parameters<typeof createDismissLayer>[0]> & { refuse?: boolean } = {},
): { layer: DismissLayer; calls: Call[]; intents: DismissIntent[] } {
  const calls: Call[] = [];
  const intents: DismissIntent[] = [];
  const { refuse, ...options } = extra;
  const layer = createDismissLayer({
    getInsideElements: () => elements,
    onDismiss: (intent) => {
      calls.push([intent.reason, intent.event.type]);
      intents.push(intent);
      if (refuse) intent.preventDefault();
    },
    ...options,
  });
  created.push(layer);
  return { layer, calls, intents };
}

export function press(target: Element, init: MouseEventInit & { pointerType?: string } = {}): MouseEvent {
  const { pointerType, ...rest } = init;
  const event = new MouseEvent('pointerdown', { bubbles: true, composed: true, cancelable: true, ...rest });
  if (pointerType) Object.defineProperty(event, 'pointerType', { value: pointerType });
  target.dispatchEvent(event);
  return event;
}

export function click(target: Element): void {
  target.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
}

export function escape(
  target: Element = document.body,
  init: KeyboardEventInit & { imeKeyCode?: number } = {},
): KeyboardEvent {
  const { imeKeyCode, ...rest } = init;
  const event = new KeyboardEvent('keydown', {
    key: 'Escape',
    bubbles: true,
    cancelable: true,
    composed: true,
    ...rest,
  });
  if (imeKeyCode !== undefined) Object.defineProperty(event, 'keyCode', { value: imeKeyCode });
  target.dispatchEvent(event);
  return event;
}

export function nativeDialog(): HTMLDialogElement {
  const dialog = document.createElement('dialog');
  document.body.append(dialog);
  return dialog;
}

export const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));
