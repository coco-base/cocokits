import { signal } from '@angular/core';
import { render } from '@testing-library/angular';
import { badgeContainerAnatomy } from '@cocokits/machines/badge-container';
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
    const { container } = await render(`<cck-badge-container><button cckButton>A</button></cck-badge-container>`, {
      imports,
    });
    const root = container.querySelector<HTMLElement>('.cck-badge-container');
    expect(root?.tagName).toBe('CCK-BADGE-CONTAINER');
    expect(root?.className).toBe(badgeContainerAnatomy.classes.root);
    expect(root?.hasAttribute('style')).toBe(false);
  });

  it('exports the directive under the exportAs name', async () => {
    const { fixture } = await render(`<cck-badge-container #c="cckBadgeContainer"></cck-badge-container>`, {
      imports,
    });
    expect(fixture.debugElement.children[0]?.injector.get(CckBadgeContainer)).toBeInstanceOf(CckBadgeContainer);
  });

  it('sets data-position top-right on its root by default', async () => {
    const { container } = await render(
      `<cck-badge-container><button cckButton>Inbox</button><cck-badge [content]="2"></cck-badge></cck-badge-container>`,
      { imports },
    );
    expect(root(container).getAttribute('data-position')).toBe('top-right');
    expect(badge(container).hasAttribute('data-position')).toBe(false);
  });

  it.each(['top-left', 'bottom-left', 'bottom-right'] as const)('sets data-position %s', async (position) => {
    const { container } = await render(
      `<cck-badge-container [position]="position"><cck-badge [content]="2"></cck-badge></cck-badge-container>`,
      { imports, componentProperties: { position } },
    );
    expect(root(container).getAttribute('data-position')).toBe(position);
  });

  it('keeps author order and gives each container its own position', async () => {
    const { container } = await render(
      `<cck-badge-container id="a"><cck-badge [content]="1"></cck-badge><button cckButton>A</button></cck-badge-container>
       <cck-badge-container id="b" position="bottom-left"><button cckButton>B</button><cck-badge [content]="1"></cck-badge></cck-badge-container>`,
      { imports },
    );
    const a = container.querySelector('#a');
    const b = container.querySelector('#b');
    expect(Array.from(a?.children ?? [], (c) => c.tagName)).toEqual(['CCK-BADGE', 'BUTTON']);
    expect(Array.from(b?.children ?? [], (c) => c.tagName)).toEqual(['BUTTON', 'CCK-BADGE']);
    expect(a?.getAttribute('data-position')).toBe('top-right');
    expect(b?.getAttribute('data-position')).toBe('bottom-left');
  });

  it('reacts to position changes', async () => {
    const position = signal<'top-left' | 'bottom-right'>('top-left');
    const { container, fixture } = await render(
      `<cck-badge-container [position]="position()"><cck-badge [content]="1"></cck-badge></cck-badge-container>`,
      { imports, componentProperties: { position } },
    );
    expect(root(container).getAttribute('data-position')).toBe('top-left');
    position.set('bottom-right');
    await fixture.whenStable();
    expect(root(container).getAttribute('data-position')).toBe('bottom-right');
  });

  it('keeps a hidden badge hidden inside the container', async () => {
    const { container } = await render(`<cck-badge-container><cck-badge hide></cck-badge></cck-badge-container>`, {
      imports,
    });
    expect(badge(container).hasAttribute('hidden')).toBe(true);
  });

  it('renders on the cck-badge-container and cck-badge tags', async () => {
    const { container } = await render(
      `<cck-badge-container position="top-left"><cck-badge [content]="1"></cck-badge></cck-badge-container>`,
      { imports },
    );
    expect(root(container).tagName).toBe('CCK-BADGE-CONTAINER');
    expect(root(container).getAttribute('data-position')).toBe('top-left');
    expect(badge(container).tagName).toBe('CCK-BADGE');
  });

  it('renders the meta default element', async () => {
    const { container } = await render(`<cck-badge-container></cck-badge-container>`, { imports });
    expect(container.querySelector('.cck-badge-container')?.tagName.toLowerCase()).toBe('cck-badge-container');
  });

  it('renders a Badge inside a BadgeContainer with the bundles alone', async () => {
    const { container } = await render(
      `<cck-badge-container><button cckButton>Inbox</button><cck-badge [content]="2"></cck-badge></cck-badge-container>`,
      { imports },
    );
    expect(container.querySelector('.cck-badge-container > .cck-badge')).not.toBeNull();
    expect(container.querySelector('.cck-button')).not.toBeNull();
  });
});
