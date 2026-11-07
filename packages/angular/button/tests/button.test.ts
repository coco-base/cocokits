import { signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { buttonAnatomy, buttonMeta } from '@cocokits/machines/button';
import { describe, expect, it, vi } from 'vitest';
import { CckButton, CckButtonImports } from '../index';

const imports = [...CckButtonImports];

describe('CckButton', () => {
  it('renders the anatomy class and a static type="button"', async () => {
    await render(`<button cckButton>Save</button>`, { imports });
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button.className).toBe(buttonAnatomy.classes.root);
    expect(button.getAttribute('type')).toBe('button');
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.hasAttribute('data-disabled')).toBe(false);
  });

  it('keeps the consumer classes next to the anatomy class', async () => {
    await render(`<button cckButton class="extra" [class.on]="true">Save</button>`, { imports });
    const { classList } = screen.getByRole('button', { name: 'Save' });
    expect([...classList].sort()).toEqual([buttonAnatomy.classes.root, 'extra', 'on'].sort());
  });

  it('exports the directive under the exportAs name', async () => {
    const { fixture } = await render(`<button cckButton #b="cckButton">Save</button>`, { imports });
    expect(fixture.debugElement.children[0]?.references.b).toBeInstanceOf(CckButton);
  });

  it('only emits data-* declared in the meta', async () => {
    const disabled = signal(false);
    await render(
      `<button cckButton [disabled]="disabled()">A</button><a cckButton [disabled]="disabled()" href="#x">B</a>`,
      { imports, componentProperties: { disabled } },
    );
    const declared: readonly string[] = buttonMeta.dataAttrs.root;
    for (const state of [false, true]) {
      disabled.set(state);
      await screen.findByText('A');
      for (const el of document.querySelectorAll('.cck-button')) {
        const names = Array.from(el.attributes, (a) => a.name).filter((n) => n.startsWith('data-'));
        expect(names.every((n) => declared.includes(n))).toBe(true);
      }
    }
  });

  describe('type', () => {
    it('does not submit a form on click', async () => {
      const onSubmit = vi.fn((event: Event) => {
        event.preventDefault();
      });
      await render(`<form (submit)="onSubmit($event)"><button cckButton>Go</button></form>`, {
        imports,
        componentProperties: { onSubmit },
      });
      await userEvent.setup().click(screen.getByRole('button'));
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('lets a static type="submit" win and submit the form', async () => {
      const onSubmit = vi.fn((event: Event) => {
        event.preventDefault();
      });
      await render(`<form (submit)="onSubmit($event)"><button cckButton type="submit">Go</button></form>`, {
        imports,
        componentProperties: { onSubmit },
      });
      const button = screen.getByRole('button');
      expect(button.getAttribute('type')).toBe('submit');
      await userEvent.setup().click(button);
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('lets a static type="reset" win and reset the form', async () => {
      await render(`<form><input aria-label="Name" value="a"><button cckButton type="reset">Reset</button></form>`, {
        imports,
      });
      const input = screen.getByLabelText<HTMLInputElement>('Name');
      const user = userEvent.setup();
      await user.clear(input);
      await user.type(input, 'changed');
      expect(input.value).toBe('changed');
      await user.click(screen.getByRole('button'));
      expect(input.value).toBe('a');
    });
  });

  describe('keyboard', () => {
    it('Enter and Space activate an enabled button', async () => {
      const onClick = vi.fn();
      await render(`<button cckButton (click)="onClick()">Go</button>`, {
        imports,
        componentProperties: { onClick },
      });
      const user = userEvent.setup();
      screen.getByRole('button').focus();
      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(1);
      await user.keyboard(' ');
      expect(onClick).toHaveBeenCalledTimes(2);
    });

    it('Tab and Shift+Tab move focus into and out of an enabled button', async () => {
      await render(`<input aria-label="before"><button cckButton>Go</button><input aria-label="after">`, { imports });
      const user = userEvent.setup();
      screen.getByLabelText('before').focus();
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole('button'));
      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText('after'));
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(screen.getByRole('button'));
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(screen.getByLabelText('before'));
    });
  });

  describe('disabled', () => {
    it('sets disabled and data-disabled, is skipped by Tab and fires no click', async () => {
      const onClick = vi.fn();
      await render(
        `<input aria-label="before"><button cckButton disabled (click)="onClick()">Go</button><input aria-label="after">`,
        { imports, componentProperties: { onClick } },
      );
      const button = screen.getByRole('button');
      expect(button.hasAttribute('disabled')).toBe(true);
      expect(button.getAttribute('data-disabled')).toBe('');

      const user = userEvent.setup();
      screen.getByLabelText('before').focus();
      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText('after'));
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(screen.getByLabelText('before'));
      await user.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('follows the disabled input', async () => {
      const disabled = signal(true);
      await render(`<button cckButton [disabled]="disabled()">Go</button>`, {
        imports,
        componentProperties: { disabled },
      });
      const button = screen.getByRole('button');
      expect(button.hasAttribute('disabled')).toBe(true);
      disabled.set(false);
      await screen.findByRole('button');
      expect(button.hasAttribute('disabled')).toBe(false);
      expect(button.hasAttribute('data-disabled')).toBe(false);
    });
  });
});
