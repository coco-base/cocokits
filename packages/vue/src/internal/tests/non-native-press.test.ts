// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, fireEvent, screen } from '@testing-library/vue';
import { defineComponent, h, type Component, type VNode } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DialogClose, DialogContent, DialogRoot, DialogTrigger } from '../../dialog';
import { stubOverlayBrowser as stubDialogBrowser } from '../../dialog/tests/fixtures';
import { PopoverClose, PopoverContent, PopoverRoot, PopoverTrigger } from '../../popover';
import { settle, stubOverlayBrowser as stubPopoverBrowser } from '../../popover/tests/fixtures';
import { mountView } from './mount-helpers';

/** The four button-default parts that carry the Base UI `useButton` policy on a non-native element. */
interface PartCase {
  readonly name: string;
  readonly Root: Component;
  readonly Content: Component;
  readonly Part: Component;
  readonly Trigger: Component;
  readonly closing: boolean;
  readonly stub: () => void;
}
const cases: readonly PartCase[] = [
  {
    name: 'DialogTrigger',
    Root: DialogRoot as Component,
    Content: DialogContent as Component,
    Part: DialogTrigger as Component,
    Trigger: DialogTrigger as Component,
    closing: false,
    stub: stubDialogBrowser,
  },
  {
    name: 'DialogClose',
    Root: DialogRoot as Component,
    Content: DialogContent as Component,
    Part: DialogClose as Component,
    Trigger: DialogTrigger as Component,
    closing: true,
    stub: stubDialogBrowser,
  },
  {
    name: 'PopoverTrigger',
    Root: PopoverRoot as Component,
    Content: PopoverContent as Component,
    Part: PopoverTrigger as Component,
    Trigger: PopoverTrigger as Component,
    closing: false,
    stub: stubPopoverBrowser,
  },
  {
    name: 'PopoverClose',
    Root: PopoverRoot as Component,
    Content: PopoverContent as Component,
    Part: PopoverClose as Component,
    Trigger: PopoverTrigger as Component,
    closing: true,
    stub: stubPopoverBrowser,
  },
];

const veto = (event: Event): void => {
  event.preventDefault();
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

/** Mounts the part with the given props; a Close sits in an open content, a trigger beside a closed one. */
async function mountPart(
  { Root, Content, Part, Trigger, closing }: PartCase,
  partProps: Record<string, unknown>,
  as: unknown,
  child?: () => VNode,
): Promise<{ update: ReturnType<typeof vi.fn>; part: () => HTMLElement }> {
  const update = vi.fn();
  const props = { 'data-testid': 'part', as, ...partProps };
  const node = (): VNode => h(Part, props, child ?? (() => 'Go'));
  const content = (inner: VNode[]): VNode => h(Content, { 'aria-label': 'Panel' }, () => inner);
  mountView(() => [
    h(Root, { open: closing, 'onUpdate:open': update }, () =>
      closing ? [h(Trigger, null, () => 'Open'), content([node()])] : [node(), content([])],
    ),
  ]);
  await settle();
  return { update, part: () => screen.getByTestId('part') };
}

describe.each(cases)('$name on a tag other than button', (partCase) => {
  beforeEach(partCase.stub);
  const open = !partCase.closing;

  it('renders the button role and a tab stop, and no type', async () => {
    const { part } = await mountPart(partCase, {}, 'span');
    expect(part().localName).toBe('span');
    expect(part().getAttribute('role')).toBe('button');
    expect(part().getAttribute('tabindex')).toBe('0');
    expect(part().hasAttribute('type')).toBe(false);
  });

  it('lets an author role and tabindex win over the defaults', async () => {
    const { part } = await mountPart(partCase, { role: 'link', tabindex: '-1' }, 'span');
    expect(part().getAttribute('role')).toBe('link');
    expect(part().getAttribute('tabindex')).toBe('-1');
  });

  it('activates on Enter at keydown, through a click the consumer also sees', async () => {
    const onClick = vi.fn();
    const { part, update } = await mountPart(partCase, { onClick }, 'span');
    await fireEvent.keyDown(part(), { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(open);
  });

  it('keeps the part as it is when a consumer keydown listener prevents the default', async () => {
    const { part, update } = await mountPart(partCase, { onKeydown: veto }, 'span');
    await fireEvent.keyDown(part(), { key: 'Enter' });
    expect(update).not.toHaveBeenCalled();
  });

  it('stops the page scrolling on Space at keydown and activates at keyup', async () => {
    const { part, update } = await mountPart(partCase, {}, 'span');
    const keydown = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    part().dispatchEvent(keydown);
    expect(keydown.defaultPrevented).toBe(true);
    expect(update).not.toHaveBeenCalled();
    await fireEvent.keyUp(part(), { key: ' ' });
    expect(update).toHaveBeenCalledWith(open);
  });

  it('ignores Enter and Space while an IME composes', async () => {
    const { part, update } = await mountPart(partCase, {}, 'span');
    const enter = new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true, cancelable: true });
    part().dispatchEvent(enter);
    const space = new KeyboardEvent('keydown', { key: ' ', isComposing: true, bubbles: true, cancelable: true });
    part().dispatchEvent(space);
    await fireEvent.keyUp(part(), { key: ' ', isComposing: true });
    expect(enter.defaultPrevented).toBe(false);
    expect(space.defaultPrevented).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });

  it('keeps the part as it is when a consumer keyup listener prevents the default', async () => {
    const { part, update } = await mountPart(partCase, { onKeyup: veto }, 'span');
    await fireEvent.keyDown(part(), { key: ' ' });
    await fireEvent.keyUp(part(), { key: ' ' });
    expect(update).not.toHaveBeenCalled();
  });

  it('ignores a key that bubbles from inside the part', async () => {
    const { update } = await mountPart(partCase, {}, 'span', () => h('i', { 'data-testid': 'inner' }, 'x'));
    await fireEvent.keyDown(screen.getByTestId('inner'), { key: 'Enter' });
    await fireEvent.keyUp(screen.getByTestId('inner'), { key: ' ' });
    expect(update).not.toHaveBeenCalled();
  });

  it('leaves Enter on a link to the browser, so it activates once, and activates Space at keyup', async () => {
    const onClick = vi.fn();
    const { part, update } = await mountPart(partCase, { onClick, href: '#target' }, 'a');
    part().focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('renders the component it is given and keeps the machine attributes', async () => {
    const Section = defineComponent({
      inheritAttrs: false,
      setup:
        (_props, { attrs, slots }) =>
        () =>
          h('section', attrs, slots.default?.()),
    });
    const { part, update } = await mountPart(partCase, {}, Section);
    expect(part().localName).toBe('section');
    expect(part().getAttribute('role')).toBe('button');
    await fireEvent.click(part());
    expect(update).toHaveBeenCalledWith(open);
  });
});

describe.each(cases)('$name on a native button or a composed child', (partCase) => {
  beforeEach(partCase.stub);

  it('renders a button with type="button" by default and with as="button"', async () => {
    const first = await mountPart(partCase, {}, undefined);
    expect(first.part().localName).toBe('button');
    expect(first.part().getAttribute('type')).toBe('button');
    expect(first.part().hasAttribute('role')).toBe(false);
    cleanup();
    const second = await mountPart(partCase, {}, 'button');
    expect(second.part().getAttribute('type')).toBe('button');
  });

  it('adds no type and no policy to an asChild link', async () => {
    const { part } = await mountPart(partCase, { asChild: true }, undefined, () => h('a', { href: '#x' }, 'Go'));
    expect(part().localName).toBe('a');
    expect(part().hasAttribute('type')).toBe(false);
    expect(part().hasAttribute('role')).toBe(false);
    expect(part().hasAttribute('tabindex')).toBe(false);
  });

  it('adds no type to an asChild button, which keeps its own', async () => {
    const { part } = await mountPart(partCase, { asChild: true }, undefined, () =>
      h('button', { type: 'submit' }, 'Go'),
    );
    expect(part().getAttribute('type')).toBe('submit');
  });
});
