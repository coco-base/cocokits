// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import { Comment, createSSRApp, h, ref, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BadgeContainer } from '../../badge-container';
import { Badge } from '../index';
import { mountView, pick, view } from './fixtures';

afterEach(cleanup);

describe('Badge as, asChild and the exposed element', () => {
  it('renders the tag given to as, with the class and the parts', () => {
    const { container } = mountView(() => h(Badge, { content: 120, max: 99, as: 'b' }));
    const badge = pick(container, '.cck-badge');
    expect(badge.tagName).toBe('B');
    expect(badge.hasAttribute('data-truncated')).toBe(true);
    expect(badge.textContent).toBe('99+');
  });

  it('asChild merges onto the child and renders the parts in place of its children', () => {
    const { container } = mountView(() =>
      h(Badge, { asChild: true, content: 120, max: 99, class: 'mine' }, () => h('em', { id: 'x' }, 'own')),
    );
    const badge = pick(container, '.cck-badge');
    expect(badge.tagName).toBe('EM');
    expect(badge.id).toBe('x');
    expect(badge.classList.contains('mine')).toBe(true);
    expect(badge.hasAttribute('data-truncated')).toBe(true);
    expect(badge.textContent).toBe('99+');
    expect(badge.querySelector('.cck-badge__content')?.textContent).toBe('99');
    expect(badge.querySelector('.cck-badge__max-indicator')?.textContent).toBe('+');
  });

  it('asChild renders no content while hidden', () => {
    const { container } = mountView(() => h(Badge, { asChild: true, content: 5, hide: true }, () => h('em', 'New')));
    const badge = pick(container, '.cck-badge');
    expect(badge.hasAttribute('hidden')).toBe(true);
    expect(badge.children).toHaveLength(0);
    expect(badge.textContent).toBe('');
  });

  it('asChild keeps the child ref', () => {
    const child = ref<HTMLElement | null>(null);
    const { container } = mountView(() => h(Badge, { asChild: true, content: 1 }, () => h('em', { ref: child })));
    expect(child.value).toBe(pick(container, '.cck-badge'));
  });

  it('asChild exposes the element next to a comment or text', () => {
    const badge = ref<{ element: Element | null } | null>(null);
    const { container } = mountView(() =>
      h(Badge, { ref: badge, asChild: true, content: 1 }, () => [h(Comment, 'note'), h('em')]),
    );
    expect(badge.value?.element).toBe(pick(container, '.cck-badge'));
  });

  it('exposes the root element', () => {
    const badge = ref<{ element: Element | null } | null>(null);
    const { container } = mountView(() => h(Badge, { ref: badge, content: 1 }));
    expect(badge.value?.element).toBe(pick(container, '.cck-badge'));
  });
});

describe('Badge as="template"', () => {
  it('merges onto the slot child like asChild, with the parts inside', () => {
    const { container } = mountView(() =>
      h(Badge, { as: 'template', content: 120, max: 99 }, () => h('em', { id: 'x' }, 'own')),
    );
    const badge = pick(container, '.cck-badge');
    expect(badge.tagName).toBe('EM');
    expect(badge.id).toBe('x');
    expect(badge.textContent).toBe('99+');
  });

  it('asChild hide keeps hidden over a child :hidden=false', () => {
    const { container } = mountView(() => h(Badge, { asChild: true, hide: true }, () => h('em', { hidden: false })));
    expect(pick(container, '.cck-badge').hasAttribute('hidden')).toBe(true);
  });

  it('server render and hydration agree for as="template"', async () => {
    const make = (): App => createSSRApp(view(() => h(Badge, { as: 'template', content: 5 }, () => h('em', 'own'))));
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const host = document.body.appendChild(document.createElement('div'));
    host.innerHTML = await renderToString(make());
    expect(host.innerHTML).toContain('<em class="cck-badge"');
    expect(host.innerHTML).toContain('>5</span>');
    const serverHtml = host.innerHTML;
    const app = make();
    app.mount(host);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(host.innerHTML).toBe(serverHtml);
    app.unmount();
    host.remove();
    vi.restoreAllMocks();
  });
});

describe('BadgeContainer as, asChild and the exposed element', () => {
  it('renders the tag given to as, with the position', () => {
    const { container } = mountView(() =>
      h(BadgeContainer, { as: 'section', position: 'bottom-left' }, () => h(Badge, { content: 1 })),
    );
    const root = pick(container, '.cck-badge-container');
    expect(root.tagName).toBe('SECTION');
    expect(root.getAttribute('data-position')).toBe('bottom-left');
  });

  it('asChild merges the class onto the one child', () => {
    const { container } = mountView(() =>
      h(BadgeContainer, { asChild: true }, () => h('nav', null, [h(Badge, { content: 1 })])),
    );
    const root = pick(container, '.cck-badge-container');
    expect(root.tagName).toBe('NAV');
    expect(root.getAttribute('data-position')).toBe('top-right');
  });

  it('exposes the root element', () => {
    const box = ref<{ element: Element | null } | null>(null);
    const { container } = mountView(() => h(BadgeContainer, { ref: box }));
    expect(box.value?.element).toBe(pick(container, '.cck-badge-container'));
  });
});

describe('BadgeContainer element next to a comment', () => {
  it('exposes the asChild element', () => {
    const box = ref<{ element: Element | null } | null>(null);
    const { container } = mountView(() =>
      h(BadgeContainer, { ref: box, asChild: true }, () => [h(Comment, 'note'), h('nav')]),
    );
    expect(box.value?.element).toBe(pick(container, '.cck-badge-container'));
  });
});
