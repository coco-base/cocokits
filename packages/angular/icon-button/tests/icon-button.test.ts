import { Directive, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { iconButtonAnatomy, iconButtonMeta } from '@cocokits/machines/icon-button';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CckIconButton, CckIconButtonAnchor, CckIconButtonImports } from '../index';

const imports = [...CckIconButtonImports];
const { classes } = iconButtonAnatomy;

const navigated = vi.fn();

/** Stands in for `RouterLink`, which also registers a host `(click)` listener on the element. */
@Directive({ selector: 'a[navigate]', host: { '(click)': 'go()' } })
class Navigate {
  go(): void {
    navigated();
  }
}

function click(element: HTMLElement): MouseEvent {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true });
  element.dispatchEvent(event);
  return event;
}

describe('CckIconButton on a button', () => {
  it('renders the icon button class and a static type="button"', async () => {
    await render(`<button cckIconButton aria-label="Add"></button>`, { imports });
    const button = screen.getByRole('button', { name: 'Add' });
    expect(button.className).toBe(classes.root);
    expect(button.className).toBe('cck-icon-button');
    expect(button.getAttribute('type')).toBe('button');
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.hasAttribute('data-disabled')).toBe(false);
  });

  it('keeps the consumer classes next to the class', async () => {
    await render(`<button cckIconButton aria-label="Add" class="extra"></button>`, { imports });
    expect([...screen.getByRole('button').classList].sort()).toEqual([classes.root, 'extra'].sort());
  });

  it('exports the directive under the exportAs name', async () => {
    const { fixture } = await render(`<button cckIconButton aria-label="Add" #b="cckIconButton"></button>`, {
      imports,
    });
    expect(fixture.debugElement.children[0]?.references.b).toBeInstanceOf(CckIconButton);
  });

  it('lets type="submit" win and submit the form', async () => {
    const onSubmit = vi.fn((event: Event) => {
      event.preventDefault();
    });
    await render(
      `<form (submit)="onSubmit($event)"><button cckIconButton aria-label="Go" type="submit"></button></form>`,
      {
        imports,
        componentProperties: { onSubmit },
      },
    );
    const button = screen.getByRole('button');
    expect(button.getAttribute('type')).toBe('submit');
    await userEvent.setup().click(button);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not submit a form by default', async () => {
    const onSubmit = vi.fn((event: Event) => {
      event.preventDefault();
    });
    await render(`<form (submit)="onSubmit($event)"><button cckIconButton aria-label="Go"></button></form>`, {
      imports,
      componentProperties: { onSubmit },
    });
    await userEvent.setup().click(screen.getByRole('button'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('is disabled natively, with data-disabled, and the same markers as the Button', async () => {
    const disabled = signal(true);
    const onClick = vi.fn();
    await render(`<button cckIconButton aria-label="Add" [disabled]="disabled()" (click)="onClick()"></button>`, {
      imports,
      componentProperties: { disabled, onClick },
    });
    const button = screen.getByRole<HTMLButtonElement>('button');
    expect(button.disabled).toBe(true);
    expect(button.hasAttribute('data-disabled')).toBe(true);
    await userEvent.setup().click(button);
    expect(onClick).not.toHaveBeenCalled();
    disabled.set(false);
    await screen.findByRole('button');
    await vi.waitFor(() => {
      expect(button.disabled).toBe(false);
    });
    expect(button.hasAttribute('data-disabled')).toBe(false);
  });

  it('activates with Enter and Space', async () => {
    const onClick = vi.fn();
    await render(`<button cckIconButton aria-label="Add" (click)="onClick()"></button>`, {
      imports,
      componentProperties: { onClick },
    });
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button'));
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('only emits data-* declared in the meta', async () => {
    await render(`<button cckIconButton aria-label="Add" disabled></button>`, { imports });
    const declared: readonly string[] = iconButtonMeta.dataAttrs.root;
    const names = [...screen.getByRole('button').attributes]
      .map((attribute) => attribute.name)
      .filter((name) => name.startsWith('data-'));
    expect(names).toEqual(['data-disabled']);
    expect(names.every((name) => declared.includes(name))).toBe(true);
  });
});

describe('CckIconButtonAnchor on a link', () => {
  beforeEach(() => {
    navigated.mockClear();
    window.location.hash = '';
  });

  it('renders the class and no type, and stays a link', async () => {
    const { fixture } = await render(`<a cckIconButton href="#go" aria-label="Go" #l="cckIconButton"></a>`, {
      imports,
    });
    const link = screen.getByRole('link', { name: 'Go' });
    expect(link.className).toBe(classes.root);
    expect(link.hasAttribute('type')).toBe(false);
    expect(link.hasAttribute('aria-disabled')).toBe(false);
    expect(link.hasAttribute('tabindex')).toBe(false);
    expect(fixture.debugElement.children[0]?.references.l).toBeInstanceOf(CckIconButtonAnchor);
  });

  it('a disabled link has aria-disabled, tabindex -1 and data-disabled, keeps its href and blocks the click', async () => {
    const onClick = vi.fn();
    await render(`<a cckIconButton navigate href="#go" aria-label="Go" disabled (click)="onClick()"></a>`, {
      imports: [...imports, Navigate],
      componentProperties: { onClick },
    });
    const link = screen.getByRole('link', { name: 'Go' });
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.getAttribute('tabindex')).toBe('-1');
    expect(link.hasAttribute('data-disabled')).toBe(true);
    expect(link.getAttribute('href')).toBe('#go');
    expect(click(link).defaultPrevented).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
    expect(navigated).not.toHaveBeenCalled();
  });

  it('an enabled link reaches the consumer and the other directive, and a consumer veto holds', async () => {
    const onClick = vi.fn((event: Event) => {
      event.preventDefault();
    });
    await render(`<a cckIconButton navigate href="#go" aria-label="Go" (click)="onClick($event)"></a>`, {
      imports: [...imports, Navigate],
      componentProperties: { onClick },
    });
    const event = click(screen.getByRole('link'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(navigated).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it('Enter follows the link and Space does nothing', async () => {
    const onClick = vi.fn();
    await render(`<a cckIconButton href="#go" aria-label="Go" (click)="onClick()"></a>`, {
      imports,
      componentProperties: { onClick },
    });
    const user = userEvent.setup();
    screen.getByRole('link').focus();
    await user.keyboard(' ');
    expect(onClick).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('a disabled link is skipped by Tab', async () => {
    await render(
      `<input aria-label="before" /><a cckIconButton href="#go" aria-label="Go" disabled></a><input aria-label="after" />`,
      {
        imports,
      },
    );
    const user = userEvent.setup();
    screen.getByLabelText('before').focus();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByLabelText('after'));
  });
});
