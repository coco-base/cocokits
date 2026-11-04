import { signal } from '@angular/core';
import { render } from '@testing-library/angular';
import { badgeContainerAnatomy, badgeContainerMeta } from '@cocokits/machines/badge-container';
import { describe, expect, it } from 'vitest';
import { CckBadgeImports } from '../../badge';
import { CckButtonImports } from '../../button';
import { CckBadgeContainer, CckBadgeContainerImports } from '../index';

// Only the two bundles and the Button bundle.
const imports = [...CckBadgeContainerImports, ...CckBadgeImports, ...CckButtonImports];

function root(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>('.cck-badge-container');
  if (!el) throw new Error('no container rendered');
  return el;
}

function badge(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>('.cck-badge');
  if (!el) throw new Error('no badge rendered');
  return el;
}

describe('CckBadgeContainer', () => {
  it('renders the anatomy class and no inline style', async () => {
    const { container } = await render(`<div cckBadgeContainer><button cckButton>A</button></div>`, { imports });
    const root = container.querySelector<HTMLElement>('.cck-badge-container');
    expect(root?.tagName).toBe('DIV');
    expect(root?.className).toBe(badgeContainerAnatomy.classes.root);
    expect(root?.hasAttribute('style')).toBe(false);
  });

  it('exports the directive under the exportAs name', async () => {
    const { fixture } = await render(`<div cckBadgeContainer #c="cckBadgeContainer"></div>`, {
      imports,
    });
    expect(fixture.debugElement.children[0]?.injector.get(CckBadgeContainer)).toBeInstanceOf(CckBadgeContainer);
  });

  it('sets data-position top-right on its root by default', async () => {
    const { container } = await render(
      `<div cckBadgeContainer><button cckButton>Inbox</button><span cckBadge [content]="2"></span></div>`,
      { imports },
    );
    expect(root(container).getAttribute('data-position')).toBe('top-right');
    expect(badge(container).hasAttribute('data-position')).toBe(false);
  });

  it.each(['top-left', 'bottom-left', 'bottom-right'] as const)('sets data-position %s', async (position) => {
    const { container } = await render(
      `<div cckBadgeContainer [position]="position"><span cckBadge [content]="2"></span></div>`,
      { imports, componentProperties: { position } },
    );
    expect(root(container).getAttribute('data-position')).toBe(position);
  });

  it('keeps author order and gives each container its own position', async () => {
    const { container } = await render(
      `<div cckBadgeContainer id="a"><span cckBadge [content]="1"></span><button cckButton>A</button></div>
       <div cckBadgeContainer id="b" position="bottom-left"><button cckButton>B</button><span cckBadge [content]="1"></span></div>`,
      { imports },
    );
    const a = container.querySelector('#a');
    const b = container.querySelector('#b');
    expect(Array.from(a?.children ?? [], (c) => c.tagName)).toEqual(['SPAN', 'BUTTON']);
    expect(Array.from(b?.children ?? [], (c) => c.tagName)).toEqual(['BUTTON', 'SPAN']);
    expect(a?.getAttribute('data-position')).toBe('top-right');
    expect(b?.getAttribute('data-position')).toBe('bottom-left');
  });

  it('reacts to position changes', async () => {
    const position = signal<'top-left' | 'bottom-right'>('top-left');
    const { container, fixture } = await render(
      `<div cckBadgeContainer [position]="position()"><span cckBadge [content]="1"></span></div>`,
      { imports, componentProperties: { position } },
    );
    expect(root(container).getAttribute('data-position')).toBe('top-left');
    position.set('bottom-right');
    await fixture.whenStable();
    expect(root(container).getAttribute('data-position')).toBe('bottom-right');
  });

  it('keeps a hidden badge hidden inside the container', async () => {
    const { container } = await render(`<div cckBadgeContainer><span cckBadge hide></span></div>`, {
      imports,
    });
    expect(badge(container).hasAttribute('hidden')).toBe(true);
  });

  it('works on any element through the attribute selector', async () => {
    const { container } = await render(
      `<section cckBadgeContainer position="top-left"><b cckBadge [content]="1"></b></section>`,
      { imports },
    );
    expect(root(container).tagName).toBe('SECTION');
    expect(root(container).getAttribute('data-position')).toBe('top-left');
    expect(badge(container).tagName).toBe('B');
  });

  it('renders the meta default element', async () => {
    const { container } = await render(`<div cckBadgeContainer></div>`, { imports });
    expect(container.querySelector('.cck-badge-container')?.tagName.toLowerCase()).toBe(
      badgeContainerMeta.defaultElements?.root,
    );
  });

  it('renders a Badge inside a BadgeContainer with the bundles alone', async () => {
    const { container } = await render(
      `<div cckBadgeContainer><button cckButton>Inbox</button><span cckBadge [content]="2"></span></div>`,
      { imports },
    );
    expect(container.querySelector('.cck-badge-container > .cck-badge')).not.toBeNull();
    expect(container.querySelector('.cck-button')).not.toBeNull();
  });
});
