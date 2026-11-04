// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, fireEvent, screen } from '@testing-library/vue';
import { defineComponent, h, nextTick } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { provideDirection, useDirection } from '@cocokits/vue-core';
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '../index';
import { mountView } from './fixtures';

const veto = (event: Event): void => {
  event.preventDefault();
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const Section = defineComponent({
  inheritAttrs: false,
  setup:
    (_props, { attrs, slots }) =>
    () =>
      h('section', attrs, slots.default?.()),
});

describe('Tabs as', () => {
  it('renders the default element of every part', async () => {
    const { container } = mountView(() =>
      h(TabsRoot, null, () => [
        h(TabsList, { 'aria-label': 'x' }, () => h(TabsTrigger, { value: 'a' }, () => 'A')),
        h(TabsContent, { value: 'a' }, () => 'a'),
      ]),
    );
    await nextTick();
    expect(container.querySelector('.cck-tabs')?.localName).toBe('div');
    expect(screen.getByRole('tablist').localName).toBe('div');
    expect(screen.getByRole('tab').localName).toBe('button');
    expect(screen.getByRole('tab').getAttribute('type')).toBe('button');
    expect(screen.getByRole('tabpanel').localName).toBe('div');
  });

  it('renders another tag or a component given to as, keeping roles, state and ids', async () => {
    const { container } = mountView(() =>
      h(TabsRoot, { as: 'section' }, () => [
        h(TabsList, { as: 'ul', 'aria-label': 'x' }, () => h(TabsTrigger, { value: 'a', as: 'li' }, () => 'A')),
        h(TabsContent, { value: 'a', as: Section }, () => 'a'),
      ]),
    );
    await nextTick();
    expect(container.querySelector('.cck-tabs')?.localName).toBe('section');
    expect(screen.getByRole('tablist').localName).toBe('ul');
    const tab = screen.getByRole('tab');
    expect(tab.localName).toBe('li');
    expect(tab.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tabpanel').localName).toBe('section');
    expect(screen.getByRole('tabpanel').id).toBe(tab.getAttribute('aria-controls'));
  });

  it('adds no type to an asChild link', async () => {
    mountView(() =>
      h(TabsRoot, null, () => [
        h(TabsList, { 'aria-label': 'x' }, () =>
          h(TabsTrigger, { value: 'a', asChild: true }, () => h('a', { href: '#a' }, 'A')),
        ),
        h(TabsContent, { value: 'a' }, () => 'a'),
      ]),
    );
    await nextTick();
    expect(screen.getByRole('tab').hasAttribute('type')).toBe(false);
  });
});

describe('Tabs trigger on a tag other than button', () => {
  const view = (triggerProps: Record<string, unknown> = {}, root: Record<string, unknown> = {}) => {
    const onValueChange = vi.fn();
    mountView(() =>
      h(TabsRoot, { 'onUpdate:modelValue': onValueChange, ...root }, () => [
        h(TabsList, { 'aria-label': 'x' }, () => [
          h(TabsTrigger, { value: 'a', as: 'div' }, () => 'A'),
          h(TabsTrigger, { value: 'b', as: 'div', ...triggerProps }, () => 'B'),
          h(TabsTrigger, { value: 'c', as: 'div' }, () => 'C'),
        ]),
        h(TabsContent, { value: 'a' }, () => 'a'),
        h(TabsContent, { value: 'b' }, () => 'b'),
        h(TabsContent, { value: 'c' }, () => 'c'),
      ]),
    );
    return onValueChange;
  };
  const tab = (name: string): HTMLElement => screen.getByRole('tab', { name });

  it('keeps role="tab" and the roving tabindex, and has no type', async () => {
    view();
    await nextTick();
    expect(tab('B').hasAttribute('type')).toBe(false);
    expect([tab('A'), tab('B'), tab('C')].map((element) => element.getAttribute('tabindex'))).toEqual([
      '0',
      '-1',
      '-1',
    ]);
  });

  it.each(['Enter', ' '])('selects the tab on %j at keydown', async (key) => {
    const onValueChange = view();
    await nextTick();
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    tab('B').dispatchEvent(event);
    await nextTick();
    expect(event.defaultPrevented).toBe(true);
    expect(tab('B').getAttribute('aria-selected')).toBe('true');
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('keeps the selection when a consumer keydown listener prevents the default', async () => {
    const onValueChange = view({ onKeydown: veto });
    await nextTick();
    await fireEvent.keyDown(tab('B'), { key: 'Enter' });
    expect(tab('A').getAttribute('aria-selected')).toBe('true');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('marks a disabled tab with aria-disabled instead of disabled and ignores activation', async () => {
    const onValueChange = view({ disabled: true });
    await nextTick();
    expect(tab('B').getAttribute('aria-disabled')).toBe('true');
    expect(tab('B').hasAttribute('disabled')).toBe(false);
    expect(tab('B').hasAttribute('data-disabled')).toBe(true);
    await fireEvent.click(tab('B'));
    await fireEvent.keyDown(tab('B'), { key: 'Enter' });
    await fireEvent.keyDown(tab('B'), { key: ' ' });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(tab('A').getAttribute('aria-selected')).toBe('true');
  });

  it('stops the page scrolling on Space on a disabled tab', async () => {
    view({ disabled: true });
    await nextTick();
    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    tab('B').dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('still moves with the arrow keys', async () => {
    view();
    await nextTick();
    tab('A').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(tab('B').getAttribute('aria-selected')).toBe('true');
  });
});

describe('Tabs dir', () => {
  const view = (root: Record<string, unknown>, provided?: 'ltr' | 'rtl') => {
    const Provide = defineComponent({
      setup(_props, { slots }) {
        if (provided) provideDirection(provided);
        return () => slots.default?.();
      },
    });
    return mountView(() =>
      h(Provide, null, () =>
        h(TabsRoot, root, () => [
          h(TabsList, { 'aria-label': 'x' }, () => [
            h(TabsTrigger, { value: 'a' }, () => 'A'),
            h(TabsTrigger, { value: 'b' }, () => 'B'),
          ]),
          h(TabsContent, { value: 'a' }, () => 'a'),
          h(TabsContent, { value: 'b' }, () => 'b'),
        ]),
      ),
    );
  };

  it('flips ArrowLeft and ArrowRight with dir="rtl" inside an ltr provider, and renders the own dir', async () => {
    const { container } = view({ dir: 'rtl' }, 'ltr');
    await nextTick();
    expect(container.querySelector('.cck-tabs')?.getAttribute('dir')).toBe('rtl');
    screen.getByRole('tab', { name: 'A' }).focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'B' }).getAttribute('aria-selected')).toBe('true');
  });

  it('follows the provider without dir, and renders no dir attribute', async () => {
    const { container } = view({}, 'rtl');
    await nextTick();
    expect(container.querySelector('.cck-tabs')?.hasAttribute('dir')).toBe(false);
    screen.getByRole('tab', { name: 'A' }).focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'B' }).getAttribute('aria-selected')).toBe('true');
  });

  it('is ltr without a dir and a provider, and renders no dir attribute', async () => {
    const { container } = view({});
    await nextTick();
    expect(container.querySelector('.cck-tabs')?.hasAttribute('dir')).toBe(false);
    screen.getByRole('tab', { name: 'A' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'B' }).getAttribute('aria-selected')).toBe('true');
  });

  it('gives the own dir to the components inside it', async () => {
    const Probe = defineComponent({
      setup() {
        const direction = useDirection();
        return () => h('span', { 'data-testid': 'probe' }, direction.value);
      },
    });
    mountView(() =>
      h(TabsRoot, { dir: 'rtl' }, () => [
        h(TabsList, { 'aria-label': 'x' }, () => h(TabsTrigger, { value: 'a' }, () => 'A')),
        h(TabsContent, { value: 'a' }, () => h(Probe)),
      ]),
    );
    await nextTick();
    expect(screen.getByTestId('probe').textContent).toBe('rtl');
  });
});

describe('Tabs aria-* fall-through', () => {
  it('renders aria-label, aria-labelledby and aria-describedby written on the list', async () => {
    mountView(() => [
      h('h2', { id: 'title' }, 'Settings'),
      h(TabsRoot, null, () => [
        h(TabsList, { 'aria-labelledby': 'title', 'aria-describedby': 'hint', 'aria-label': 'Named' }, () =>
          h(TabsTrigger, { value: 'a' }, () => 'A'),
        ),
        h(TabsContent, { value: 'a' }, () => 'a'),
      ]),
    ]);
    await nextTick();
    const list = screen.getByRole('tablist');
    expect(list.getAttribute('aria-label')).toBe('Named');
    expect(list.getAttribute('aria-labelledby')).toBe('title');
    expect(list.getAttribute('aria-describedby')).toBe('hint');
  });

  it('declares no ariaLabel or ariaLabelledby prop on the list', () => {
    const props = Object.keys((TabsList as unknown as { props: object }).props);
    expect(props).not.toContain('ariaLabel');
    expect(props).not.toContain('ariaLabelledby');
  });
});
