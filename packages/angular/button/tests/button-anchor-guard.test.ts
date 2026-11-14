import { Directive } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { CckButtonImports } from '../index';

const navigated = vi.fn();

/** Stands in for `RouterLink`, which also registers a host `(click)` listener on the element. */
@Directive({ selector: 'a[navigate]', host: { '(click)': 'go()' } })
class Navigate {
  go(): void {
    navigated();
  }
}

/** A host listener that tries to veto the click, as a host-listener guard would. */
@Directive({ selector: 'a[hostGuard]', host: { '(click)': 'stop($event)' } })
class HostGuard {
  stop(event: Event): void {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}

function click(link: HTMLElement): void {
  link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
}

describe('the disabled-link guard and other click listeners on the same element', () => {
  it('a host listener cannot stop a consumer (click) or another directive (why the guard is a capture-phase listener)', async () => {
    const onClick = vi.fn();
    navigated.mockClear();
    await render(`<a hostGuard navigate href="#go" (click)="onClick()">Go</a>`, {
      imports: [HostGuard, Navigate],
      componentProperties: { onClick },
    });
    click(screen.getByRole('link'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(navigated).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['before', [Navigate, ...CckButtonImports]],
    ['after', [...CckButtonImports, Navigate]],
  ])('the guard stops a consumer (click) and a host listener imported %s the Button', async (_order, imports) => {
    const onClick = vi.fn();
    navigated.mockClear();
    await render(`<a cckButton navigate href="#go" disabled (click)="onClick()">Go</a>`, {
      imports,
      componentProperties: { onClick },
    });
    click(screen.getByRole('link'));
    expect(onClick).not.toHaveBeenCalled();
    expect(navigated).not.toHaveBeenCalled();
  });

  it('an enabled link reaches both', async () => {
    const onClick = vi.fn();
    navigated.mockClear();
    await render(`<a cckButton navigate href="#go" (click)="onClick()">Go</a>`, {
      imports: [...CckButtonImports, Navigate],
      componentProperties: { onClick },
    });
    click(screen.getByRole('link'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(navigated).toHaveBeenCalledTimes(1);
  });
});
