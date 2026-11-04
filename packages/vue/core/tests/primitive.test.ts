// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/vue';
import { renderToString } from 'vue/server-renderer';
import { Comment, createSSRApp, ref, Teleport, defineComponent, h, type Component, type VNode } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Primitive } from '../src/index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

function mount(props: Record<string, unknown>, children?: () => unknown, attrs: Record<string, unknown> = {}) {
  const root = defineComponent({ setup: () => () => h(Primitive, { ...props, ...attrs }, children) });
  return render(root);
}

describe('Primitive', () => {
  it('renders a div by default, with the attrs and the slot', () => {
    const { container } = mount({}, () => 'text', { id: 'a', class: 'x' });
    expect(container.innerHTML).toBe('<div id="a" class="x">text</div>');
  });

  it('renders the given tag or component', () => {
    const Link = defineComponent({
      setup:
        (_p, { slots }) =>
        () =>
          h('a', { href: '#' }, slots['default']?.()),
    });
    expect(mount({ as: 'span' }, () => 'x').container.innerHTML).toBe('<span>x</span>');
    cleanup();
    expect(mount({ as: Link }, () => 'x', { class: 'c' }).container.innerHTML).toBe('<a href="#" class="c">x</a>');
  });

  it('reads as at render time, so it can change at runtime', async () => {
    const view = render(Primitive, { props: { as: 'span' }, slots: { default: 'x' } });
    await view.rerender({ as: 'p' });
    expect(view.container.innerHTML).toBe('<p>x</p>');
  });

  it('renders no default slot for self-closing tags', () => {
    const { container } = mount({ as: 'input' }, () => 'ignored', { type: 'text' });
    expect(container.innerHTML).toBe('<input type="text">');
  });

  it('merges onto the first non-comment child with asChild: child props win, class and listeners merge', () => {
    const calls: string[] = [];
    const { container } = mount(
      { asChild: true },
      () => [h('a', { href: '#child', class: 'child', id: 'child', onClick: () => calls.push('child') })],
      { href: '#ours', class: 'ours', 'data-x': '1', onClick: () => calls.push('ours') },
    );
    const link = container.querySelector('a');
    expect(link?.getAttribute('href')).toBe('#child');
    expect(link?.getAttribute('data-x')).toBe('1');
    expect(link?.className.split(' ').sort()).toEqual(['child', 'ours']);
    link?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(calls).toEqual(['child', 'ours']);
  });

  it('skips comments and keeps the other children', () => {
    const { container } = mount({ asChild: true }, () => [h(Comment), h('b', 'x')], { id: 'a' });
    expect(container.querySelector('b')?.id).toBe('a');
  });

  it('warns in development unless there is exactly one element child', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mount({ asChild: true }, () => [h('a', 'one')]);
    expect(warn).not.toHaveBeenCalled();
    cleanup();
    mount({ asChild: true }, () => [h('a', 'one'), h('a', 'two')]);
    expect(warn).toHaveBeenCalledOnce();
    expect(String(warn.mock.calls[0]?.[0])).toContain('CocoKits:');
  });

  it('warns for an empty slot and a text-only slot, and not for a comment next to one element', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const warned = (): number => warn.mock.calls.filter((call) => String(call[0]).startsWith('CocoKits:')).length;
    mount({ asChild: true }, () => []);
    expect(warned()).toBe(1);
    cleanup();
    mount({ asChild: true }, () => 'just text');
    expect(warned()).toBe(2);
    cleanup();
    mount({ asChild: true }, () => [h(Comment), h('a', 'one')]);
    expect(warned()).toBe(2);
  });

  it('lets the priority attrs win over the child props, and the child win over the other attrs', () => {
    const { container } = mount(
      { asChild: true, priorityAttrs: ['tabindex'] },
      () => h('a', { tabindex: '0', 'aria-label': 'child' }),
      { tabindex: '-1', 'aria-label': 'ours' },
    );
    const anchor = container.querySelector('a');
    expect(anchor?.getAttribute('tabindex')).toBe('-1');
    expect(anchor?.getAttribute('aria-label')).toBe('child');
  });

  it('gives every HTML void element no default slot', () => {
    for (const tag of ['br', 'hr', 'img', 'input', 'meta', 'wbr']) {
      const { container } = mount({ as: tag }, () => 'x');
      expect(container.innerHTML).not.toContain('x');
      cleanup();
    }
  });

  it('does not warn in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mount({ asChild: true }, () => [h('a', 'one'), h('a', 'two')]);
    expect(warn).not.toHaveBeenCalled();
  });

  it('renders on the server', async () => {
    const root: Component = defineComponent({
      setup: () => () => h(Primitive, { asChild: true, class: 'ours' }, () => h('a', { href: '#' }, 'go')),
    });
    expect(await renderToString(createSSRApp(root))).toBe('<a href="#" class="ours">go</a>');
  });

  it('asChildContent replaces the children of the child and keeps the child vnode', () => {
    const { container } = mount(
      { asChild: true, asChildContent: () => [h('b', 'part')] },
      () => [h(Comment, 'note'), h('em', { id: 'own' }, 'old')],
      { id: 'outer', class: 'x' },
    );
    expect(container.innerHTML).toContain('<em id="own" class="x"><b>part</b></em>');
    expect(container.innerHTML).not.toContain('old');
  });

  it('asChildContent receives the own children of the child: an array, a string or a component slot', () => {
    const wrap = (hostChildren: VNode[]): VNode[] => [h('i', hostChildren)];
    const Card = defineComponent({
      setup:
        (_p, { slots }) =>
        () =>
          h('section', slots['default']?.()),
    });
    const array = mount({ asChild: true, asChildContent: wrap }, () => h('em', null, [h('u', 'a'), 'b']));
    expect(array.container.innerHTML).toBe('<em><i><u>a</u>b</i></em>');
    cleanup();
    const text = mount({ asChild: true, asChildContent: wrap }, () => h('em', null, 'plain'));
    expect(text.container.innerHTML).toBe('<em><i>plain</i></em>');
    cleanup();
    const component = mount({ asChild: true, asChildContent: wrap }, () => h(Card, null, () => 'own'));
    expect(component.container.innerHTML).toBe('<section><i>own</i></section>');
  });

  it('asChildContent is ignored without asChild', () => {
    const { container } = mount({ asChildContent: () => [h('b', 'part')] }, () => 'text');
    expect(container.innerHTML).toBe('<div>text</div>');
  });

  it('asChildContent gives a component child its default slot', () => {
    const Card = defineComponent({
      setup:
        (_p, { slots }) =>
        () =>
          h('section', { class: 'card' }, slots['default']?.()),
    });
    const { container } = mount({ asChild: true, asChildContent: () => [h('b', 'part')] }, () =>
      h(Card, null, () => 'old'),
    );
    expect(container.innerHTML).toBe('<section class="card"><b>part</b></section>');
  });

  it('asChildContent gives a Teleport child array children', () => {
    const target = document.body.appendChild(document.createElement('div'));
    mount({ asChild: true, asChildContent: () => [h('b', 'part')] }, () => h(Teleport, { to: target }, 'old'));
    expect(target.innerHTML).toBe('<b>part</b>');
    target.remove();
  });

  it('asChildContent keeps the scope ids of the child', () => {
    const scoped = ref<{ $: { subTree: VNode & { slotScopeIds?: string[] | null } } } | null>(null);
    const root = defineComponent({
      setup: () => () =>
        h(Primitive, { ref: scoped, asChild: true, asChildContent: () => [h('b', 'part')] }, () => {
          const child: VNode & { slotScopeIds?: string[] } = h('em', null, 'old');
          child.slotScopeIds = ['data-s-x'];
          return child;
        }),
    });
    render(root);
    expect(scoped.value?.$.subTree.slotScopeIds).toEqual(['data-s-x']);
  });
});
