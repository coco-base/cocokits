import { h, type VNode } from 'vue';
import { expect } from 'vitest';
import { FormField } from '../../form-field';
import { Hint } from '../../hint';
import { Label } from '../../label';

/** Resolves after the next task, where the cdk reports a reset. */
export const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/** Resolves after the next animation frame, where the accessible-name check runs. */
export const nextFrame = (): Promise<void> =>
  new Promise((resolve) =>
    requestAnimationFrame(() => {
      resolve();
    }),
  );

/** The value, or a failed test when it is missing. */
export function must<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Expected the element to exist.');
  return value;
}

const kebab = (name: string): string => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/** The root's attribute names that start with `data-`, sorted. */
export function dataNames(root: Element): string[] {
  return root
    .getAttributeNames()
    .filter((name) => name.startsWith('data-'))
    .sort();
}

/** Asserts that every part of the meta renders its default element below the block root, with its class. */
export function expectDefaultElements(
  root: Element,
  block: string,
  defaultElements: Readonly<Partial<Record<string, string>>> | undefined,
): void {
  if (!defaultElements) throw new Error(`The ${block} meta has no default elements.`);
  for (const [part, tag] of Object.entries(defaultElements)) {
    const element = part === 'root' ? root : root.querySelector(`.cck-${block}__${kebab(part)}`);
    if (!element) throw new Error(`The ${block} renders no ${part} part.`);
    expect(element.localName, `${block} ${part}`).toBe(tag);
  }
}

/** A field with a Label, a control and a Hint; `fieldProps` go on the FormField. */
export function field(control: () => VNode | VNode[], fieldProps: Record<string, unknown> = {}): VNode {
  return h(
    FormField,
    { id: 'f', ...fieldProps },
    {
      label: () => h(Label, null, () => 'Notifications'),
      default: control,
      hint: () => h(Hint, null, () => 'Weekly only.'),
    },
  );
}
