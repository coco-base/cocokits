import { screen, waitFor } from '@testing-library/react';
import { expect } from 'vitest';
import { selectAnatomy } from '@cocokits/machines/select';
import { StrictMode, type ReactElement, type ReactNode } from 'react';
import { vi } from 'vitest';
import { Select } from '../index';
import type { SelectRootProps, SelectTriggerProps } from '../select.types';
import type { SelectContentProps, SelectItemProps } from '../select-parts.types';

/**
 * jsdom has no top layer, no modal `dialog` and no `scrollIntoView`: emulate `:modal` (a dialog with
 * `data-modal`), `showPopover` (the portal host), `showModal` and `close` of a dialog, and `scrollIntoView`.
 * Call it in `beforeEach`; `vi.restoreAllMocks()` in `afterEach` undoes the spy.
 *
 * @returns The `scrollIntoView` spy.
 */
export function stubTopLayer(): ReturnType<typeof vi.fn> {
  const matches = Reflect.get(Element.prototype, 'matches') as (this: Element, selector: string) => boolean;
  vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
    if (selector === ':modal') return this.localName === 'dialog' && this.hasAttribute('data-modal');
    return matches.call(this, selector);
  });
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    this.style.display = 'block';
  };
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
    this.setAttribute('data-modal', '');
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.removeAttribute('data-modal');
    this.dispatchEvent(new Event('close'));
  };
  const scrollIntoView = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView;
  return scrollIntoView;
}

/** The box `stubLayout` gives the anchor; the overlay content is 50 by 40 px. */
export const ANCHOR_BOX = { left: 300, top: 100, width: 100, height: 20 } as const;

/**
 * jsdom has no layout: give `anchor` a box (`ANCHOR_BOX`) and every other element 50 by 40 px in a 1000 by 800 px
 * viewport, so the position Floating UI writes can be read from the `left` of the content. Call it in `beforeEach`;
 * `vi.restoreAllMocks()` in `afterEach` undoes the spies.
 *
 * @param anchor - Returns the element the content is placed against.
 */
export function stubLayout(anchor: () => Element | null): void {
  const box = (element: Element): { left: number; top: number; width: number; height: number } =>
    element === anchor() ? ANCHOR_BOX : { left: 0, top: 0, width: 50, height: 40 };
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const { left, top, width, height } = box(this);
    return new DOMRect(left, top, width, height);
  });
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return box(this).width;
  });
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return box(this).height;
  });
  vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(1000);
  vi.spyOn(Element.prototype, 'clientHeight', 'get').mockReturnValue(800);
}

/** Props of {@link Dishes}: the Root props, the trigger's name and the text of the placeholder. */
export type DishesProps<T, M extends boolean> = SelectRootProps<T, M> & {
  /** The `aria-label` of the trigger; `null` leaves the trigger unnamed. @defaultValue 'Dish' */
  readonly label?: string | null;
  /** The placeholder of the value part. @defaultValue '' */
  readonly placeholder?: string;
  /** More props for the trigger. */
  readonly triggerProps?: SelectTriggerProps;
  /** More props for the list. */
  readonly contentProps?: SelectContentProps;
};

/** A Select made of the usual parts: a trigger with a value and an icon, and a list of the children. */
export function Dishes<T = string, M extends boolean = false>({
  label = 'Dish',
  placeholder = '',
  triggerProps,
  contentProps,
  children,
  ...root
}: DishesProps<T, M>): ReactElement {
  return (
    <Select.Root<T, M> {...root}>
      <Select.Trigger {...(label === null ? {} : { 'aria-label': label })} {...triggerProps}>
        <Select.Value placeholder={placeholder} />
        <Select.Icon />
      </Select.Trigger>
      <Select.Content {...contentProps}>{children}</Select.Content>
    </Select.Root>
  );
}

/** An item with its indicator and text. */
export function Opt<T = string>({
  children,
  ...props
}: SelectItemProps<T> & { readonly children?: ReactNode }): ReactElement {
  return (
    <Select.Item<T> {...props}>
      <Select.ItemIndicator />
      <Select.ItemText>{children}</Select.ItemText>
    </Select.Item>
  );
}

/** A Select with four dishes (the second is disabled), between a button and a paragraph of the page. */
export function Example(
  props: Partial<SelectRootProps<string, boolean>> & { readonly placeholder?: string },
): ReactElement {
  const { placeholder = 'Choose a dish', ...root } = props;
  return (
    <StrictMode>
      <Dishes placeholder={placeholder} {...(root as SelectRootProps)}>
        <Opt value="Cake">Cake</Opt>
        <Opt value="Pizza" disabled>
          Pizza
        </Opt>
        <Opt value="Burger">Burger</Opt>
        <Opt value="Steak">Steak</Opt>
      </Dishes>
      <button id="after">After</button>
      <p id="empty">Empty</p>
    </StrictMode>
  );
}

/** The arguments of a change callback: the new value and the details. */
type ChangeCall = [unknown, { reason: string; event: Event | null }];

/** The `[value, reason]` pairs a change callback was called with. */
export const reasonsOf = (callback: ReturnType<typeof vi.fn>): [unknown, string][] =>
  (callback.mock.calls as ChangeCall[]).map(([value, details]) => [value, details.reason]);

/** The reason of the last call of a change callback. */
export const lastReason = (callback: ReturnType<typeof vi.fn>): string | undefined =>
  (callback.mock.calls as ChangeCall[]).at(-1)?.[1].reason;

/** The details of the first call of a change callback. */
export const firstDetails = (callback: ReturnType<typeof vi.fn>): ChangeCall[1] | undefined =>
  (callback.mock.calls as ChangeCall[])[0]?.[1];

/** Returns the value, or fails the test when it is missing. */
export function must<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Expected a value.');
  return value;
}

/** Resolves after the next animation frame. */
export const nextFrame = (): Promise<void> =>
  new Promise((resolve) =>
    requestAnimationFrame(() => {
      resolve();
    }),
  );

/** Resolves after the tasks queued so far. */
export const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/** The Select trigger: the only combobox on the page. */
export const trigger = (): HTMLElement => screen.getByRole('combobox');

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
