import { screen, waitFor } from '@testing-library/vue';
import { expect } from 'vitest';
import { selectAnatomy } from '@cocokits/machines/select';
import { defineComponent, h, type Component, type VNode } from 'vue';
import { vi } from 'vitest';
import {
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from '../index';

export { mountView, view } from '../../internal/tests/mount-helpers';

/** The element with the id; fails the test when there is none. */
export function byId(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) throw new Error(`No element has the id ${id}`);
  return element;
}

/** Returns the value, or fails the test when it is missing. */
export function must<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Expected a value.');
  return value;
}

/**
 * The browser features jsdom lacks and the overlay needs: the top layer, a modal `dialog`, `scrollIntoView` and
 * the resize observer. Call it in `beforeEach`; `vi.unstubAllGlobals()` and `vi.restoreAllMocks()` in `afterEach`.
 *
 * @returns The `scrollIntoView` spy.
 */
export function stubOverlayBrowser(): ReturnType<typeof vi.fn> {
  const matches = Reflect.get(Element.prototype, 'matches') as (this: Element, selector: string) => boolean;
  vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
    if (selector === ':modal') return this.localName === 'dialog' && this.hasAttribute('data-modal');
    return matches.call(this, selector);
  });
  HTMLElement.prototype.showPopover = function showPopover(this: HTMLElement): void {
    this.style.display = 'block';
  };
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement): void {
    this.setAttribute('open', '');
    this.setAttribute('data-modal', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement): void {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.removeAttribute('data-modal');
    this.dispatchEvent(new Event('close'));
  };
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
  const scrollIntoView = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView;
  return scrollIntoView;
}

/** Lets the portal host, the post-render effects and the animation frame settle. */
export async function settle(): Promise<void> {
  for (let round = 0; round < 3; round += 1) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}

/** Resolves after the tasks queued so far. */
export const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/** `SelectItem` for a value that is not a string: `h()` cannot infer a generic SFC, so it takes its own type. */
export const ObjectItem = SelectItem as Component;

/** `SelectRoot` for a value that is not a string, for the same reason. */
export const ObjectRoot = SelectRoot as Component;

/** An item with its indicator and its text; the text is the value unless given. */
export function item(value: unknown, text = String(value), props: Record<string, unknown> = {}): VNode {
  return h(ObjectItem, { value, ...props }, () => [h(SelectItemIndicator), h(SelectItemText, null, () => text)]);
}

/** Four dishes; the second is disabled. */
export function dishes(): VNode[] {
  return [item('Cake'), item('Pizza', 'Pizza', { disabled: true }), item('Burger'), item('Steak')];
}

/** What a view can change in the parts around the items. */
export interface ViewOptions {
  /** The items; four dishes by default. */
  readonly items?: () => VNode | VNode[];
  /** Props of the `SelectTrigger`; it is named `Dish` unless an `aria-*` is given here or in the root props. */
  readonly trigger?: Record<string, unknown>;
  /** Leaves the trigger without a name of its own (a FormField names it). */
  readonly unnamed?: boolean;
  /** Props of the `SelectValue`. */
  readonly value?: Record<string, unknown>;
  /** The default slot of the `SelectValue`. */
  readonly valueSlot?: (props: { selectedLabel: readonly string[]; modelValue: unknown }) => unknown;
  /** Props of the `SelectContent`. */
  readonly content?: Record<string, unknown>;
}

/**
 * The trigger (value and icon) and the content around the items, for a `SelectRoot` to hold. A `placeholder` in the
 * root props goes to the value, an `aria-*` to the trigger, `side` and `align` to the content.
 */
export function selectParts(rootProps: Record<string, unknown> = {}, options: ViewOptions = {}): VNode[] {
  const { placeholder, side, align } = rootProps;
  const { items = dishes, trigger = {}, unnamed = false, value = {}, valueSlot, content = {} } = options;
  const aria = Object.fromEntries(Object.entries(rootProps).filter(([name]) => name.startsWith('aria-')));
  const triggerProps = { ...aria, ...trigger };
  const named = unnamed || Object.keys(triggerProps).some((name) => name.startsWith('aria-'));
  const contentProps = {
    ...(side === undefined ? {} : { side }),
    ...(align === undefined ? {} : { align }),
    ...content,
  };
  return [
    h(SelectTrigger, named ? triggerProps : { 'aria-label': 'Dish', ...triggerProps }, () => [
      h(
        SelectValue,
        { placeholder: (placeholder as string | undefined) ?? 'Choose a dish', ...value },
        valueSlot ? { default: valueSlot } : undefined,
      ),
      h(SelectIcon),
    ]),
    h(SelectContent as Component, contentProps, () => items()),
  ];
}

/** A `SelectRoot` with the parts of {@link selectParts}; the root props keep what is not meant for a part. */
export function selectRoot(rootProps: Record<string, unknown> = {}, options: ViewOptions = {}): VNode {
  const own = Object.fromEntries(
    Object.entries(rootProps).filter(
      ([name]) => !name.startsWith('aria-') && !['placeholder', 'side', 'align'].includes(name),
    ),
  );
  return h(ObjectRoot, own, () => selectParts(rootProps, options));
}

/** A Select with four dishes, between nothing and a button and a paragraph of the page. */
export function selectView(rootProps: Record<string, unknown> = {}, options: ViewOptions = {}): () => VNode[] {
  return () => [
    selectRoot(rootProps, options),
    h('button', { id: 'after' }, 'after'),
    h('p', { id: 'empty' }, 'Empty'),
  ];
}

/** The `update:modelValue` and `update:open` events of a Select, recorded. */
export interface Recorder {
  readonly values: unknown[];
  readonly opens: boolean[];
  readonly props: Record<string, unknown>;
}

/** Listeners for `update:modelValue` and `update:open` that record what they are called with. */
export function record(): Recorder {
  const values: unknown[] = [];
  const opens: boolean[] = [];
  return {
    values,
    opens,
    props: {
      'onUpdate:modelValue': (value: unknown) => values.push(value),
      'onUpdate:open': (open: boolean) => opens.push(open),
    },
  };
}

/** A component that renders {@link selectView}. */
export function component(rootProps: Record<string, unknown> = {}): Component {
  return defineComponent({ setup: () => selectView(rootProps) });
}

/** The Select trigger: the only combobox on the page. */
export const trigger = (): HTMLButtonElement => screen.getByRole('combobox');

/** The option with the accessible name. */
export const option = (name: string): HTMLElement => screen.getByRole('option', { name });

/** Resolves once the list is out of the document. */
export const gone = (): Promise<void> =>
  waitFor(() => {
    expect(screen.queryByRole('listbox')).toBeNull();
  });

/** The text of the option the trigger points at with `aria-activedescendant`. */
export const active = (): string =>
  document.getElementById(trigger().getAttribute('aria-activedescendant') ?? '')?.textContent.trim() ?? '';

/** The text the trigger shows for the selection. */
export const valueText = (): string | undefined =>
  trigger().querySelector(`.${selectAnatomy.classes.value}`)?.textContent.trim();
