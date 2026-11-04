import { signal } from '@angular/core';
import { render } from '@testing-library/angular';
import { badgeAnatomy, badgeMeta } from '@cocokits/machines/badge';
import { describe, expect, it } from 'vitest';
import { CckBadge, CckBadgeImports } from '../index';

const imports = [...CckBadgeImports];

function badge(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>('.cck-badge');
  if (!el) throw new Error('no badge rendered');
  return el;
}

describe('CckBadge', () => {
  it('renders the root and content parts with the anatomy classes', async () => {
    const { container } = await render(`<span cckBadge [content]="5"></span>`, { imports });
    const root = badge(container);
    expect(root.tagName).toBe('SPAN');
    expect(root.className).toBe(badgeAnatomy.classes.root);
    expect(root.children).toHaveLength(1);
    expect(root.children[0].className).toBe(badgeAnatomy.classes.content);
    expect(root.textContent).toBe('5');
    expect(root.hasAttribute('data-empty')).toBe(false);
    expect(root.hasAttribute('role')).toBe(false);
  });

  it('keeps the consumer classes next to the anatomy class', async () => {
    const { container } = await render(`<span cckBadge class="extra" [content]="1"></span>`, {
      imports,
    });
    expect([...badge(container).classList].sort()).toEqual([badgeAnatomy.classes.root, 'extra'].sort());
  });

  it('exports the component under the exportAs name', async () => {
    const { fixture } = await render(`<span cckBadge #b="cckBadge"></span>`, { imports });
    expect(fixture.debugElement.children[0]?.injector.get(CckBadge)).toBeInstanceOf(CckBadge);
  });

  it.each([null, undefined, '', 0])('shows an empty badge for %j', async (content) => {
    const { container } = await render(`<span cckBadge [content]="content"></span>`, {
      imports,
      componentProperties: { content },
    });
    const root = badge(container);
    expect(root.hasAttribute('data-empty')).toBe(true);
    expect(root.querySelector('.cck-badge__content')?.textContent).toBe('');
  });

  it('shows the string "0" without data-empty', async () => {
    const { container } = await render(`<span cckBadge content="0" [max]="99"></span>`, { imports });
    const root = badge(container);
    expect(root.textContent).toBe('0');
    expect(root.hasAttribute('data-empty')).toBe(false);
    expect(root.hasAttribute('data-truncated')).toBe(false);
  });

  it.each([120, '120'])('truncates %j above max with the "+" indicator', async (content) => {
    const { container } = await render(`<span cckBadge [content]="content" [max]="99"></span>`, {
      imports,
      componentProperties: { content },
    });
    const root = badge(container);
    expect(root.hasAttribute('data-truncated')).toBe(true);
    expect(root.querySelector('.cck-badge__content')?.textContent).toBe('99');
    expect(root.querySelector('.cck-badge__max-indicator')?.textContent).toBe('+');
  });

  it('reads a static max attribute as a number', async () => {
    const { container } = await render(`<span cckBadge content="120" max="99"></span>`, { imports });
    const root = badge(container);
    expect(root.hasAttribute('data-truncated')).toBe(true);
    expect(root.querySelector('.cck-badge__content')?.textContent).toBe('99');
  });

  it('never truncates text or with max 0', async () => {
    const { container } = await render(
      `<span cckBadge content="New" [max]="1"></span><span cckBadge [content]="500" [max]="0"></span>`,
      { imports },
    );
    for (const el of container.querySelectorAll('.cck-badge')) {
      expect(el.hasAttribute('data-truncated')).toBe(false);
      expect(el.querySelector('.cck-badge__max-indicator')).toBeNull();
    }
  });

  it('renders the native hidden attribute and no children when hidden', async () => {
    const { container } = await render(`<span cckBadge [content]="5" hide></span>`, { imports });
    const root = badge(container);
    expect(root.hasAttribute('hidden')).toBe(true);
    expect(root.hasAttribute('data-empty')).toBe(false);
    expect(root.hasAttribute('data-truncated')).toBe(false);
    expect(root.childElementCount).toBe(0);
  });

  it('has no position attribute', async () => {
    const { container } = await render(`<span cckBadge [content]="5"></span>`, { imports });
    const root = badge(container);
    expect(root.hasAttribute('data-position')).toBe(false);
    expect(root.hasAttribute('style')).toBe(false);
  });

  it('follows its inputs', async () => {
    const content = signal<number | null>(1);
    const { container, fixture } = await render(`<span cckBadge [content]="content()" [max]="9"></span>`, {
      imports,
      componentProperties: { content },
    });
    content.set(20);
    await fixture.whenStable();
    const root = badge(container);
    expect(root.textContent).toBe('9+');
    content.set(null);
    await fixture.whenStable();
    expect(root.hasAttribute('data-empty')).toBe(true);
  });

  it('works on any element through the attribute selector', async () => {
    const { container } = await render(`<p cckBadge [content]="3"></p><strong cckBadge content="New"></strong>`, {
      imports,
    });
    const roots = [...container.querySelectorAll('.cck-badge')];
    expect(roots.map((el) => el.tagName)).toEqual(['P', 'STRONG']);
    expect(roots.map((el) => el.textContent)).toEqual(['3', 'New']);
  });

  it('renders the meta default element for the root and its parts', async () => {
    const { container } = await render(`<span cckBadge [content]="120" [max]="99"></span>`, { imports });
    const root = badge(container);
    const defaults = badgeMeta.defaultElements;
    expect(root.tagName.toLowerCase()).toBe(defaults?.root);
    expect(root.querySelector('.cck-badge__content')?.tagName.toLowerCase()).toBe(defaults?.content);
    expect(root.querySelector('.cck-badge__max-indicator')?.tagName.toLowerCase()).toBe(defaults?.maxIndicator);
  });

  it('writes no inline style', async () => {
    const { container } = await render(`<span cckBadge [content]="1"></span><span cckBadge hide></span>`, { imports });
    for (const el of container.querySelectorAll('.cck-badge')) {
      expect(el.hasAttribute('style')).toBe(false);
    }
  });

  it('only emits data-* declared in the meta', async () => {
    const { container } = await render(
      `<span cckBadge [content]="500" [max]="99"></span><span cckBadge></span><span cckBadge hide></span>`,
      { imports },
    );
    const declared: readonly string[] = badgeMeta.dataAttrs.root;
    for (const el of container.querySelectorAll('.cck-badge')) {
      const names = Array.from(el.attributes, (a) => a.name).filter((n) => n.startsWith('data-'));
      expect(names.every((n) => declared.includes(n))).toBe(true);
    }
  });
});
