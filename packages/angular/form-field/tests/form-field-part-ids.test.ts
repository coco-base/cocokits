import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { CckFieldErrorImports } from '../../field-error';
import { CckHintImports } from '../../hint';
import { CckLabelImports } from '../../label';
import { CckTextareaImports } from '../../textarea';
import { CckFormFieldImports } from '../index';

const imports = [
  ...CckFormFieldImports,
  ...CckLabelImports,
  ...CckHintImports,
  ...CckFieldErrorImports,
  ...CckTextareaImports,
];

const describedBy = (): string | null => screen.getByRole('textbox').getAttribute('aria-describedby');

@Component({
  imports,
  template: `
    <cck-hint [id]="outsideHint()">Outside hint</cck-hint>
    <cck-field-error [id]="outsideError()">Outside error</cck-field-error>
    <cck-form-field id="msg">
      <label cckLabel>Message</label>
      <textarea cckTextarea></textarea>
      <cck-hint [id]="hintId()">Help</cck-hint>
      <cck-field-error force [id]="errorId()">Enter a message.</cck-field-error>
    </cck-form-field>
  `,
})
class BoundIds {
  readonly outsideHint = signal<string | undefined>('out-hint');
  readonly outsideError = signal<string | undefined>('out-error');
  readonly hintId = signal<string | undefined>('my-hint');
  readonly errorId = signal<string | undefined>('my-error');
}

@Component({
  imports,
  template: `
    <cck-form-field id="msg">
      <label cckLabel>Message</label>
      <textarea cckTextarea></textarea>
      @if (extra()) {
        <cck-hint>First</cck-hint>
      }
      <cck-hint>Second</cck-hint>
      @if (extra()) {
        <cck-field-error force>Error one.</cck-field-error>
      }
      <cck-field-error force>Error two.</cck-field-error>
    </cck-form-field>
  `,
})
class AddedParts {
  readonly extra = signal(false);
}

@Component({
  imports,
  template: `
    <cck-form-field id="msg">
      <label cckLabel>Message</label>
      <textarea cckTextarea></textarea>
      @for (hint of hints(); track hint) {
        <cck-hint [id]="hint">{{ hint }}</cck-hint>
      }
    </cck-form-field>
  `,
})
class MovedParts {
  readonly hints = signal(['a', 'b', 'c']);
}

/** Runs change detection and waits until the renders it scheduled are done. */
const stable = async (fixture: ComponentFixture<unknown>): Promise<void> => {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
};

describe('Hint and FieldError id input', () => {
  it('renders a bound id outside a field and follows its changes', async () => {
    const { fixture, container } = await render(BoundIds);
    expect(container.querySelector('#out-hint')?.textContent).toBe('Outside hint');
    expect(container.querySelector('#out-error')?.textContent.trim()).toBe('Outside error');
    fixture.componentInstance.outsideHint.set('out-hint-2');
    fixture.componentInstance.outsideError.set('out-error-2');
    await stable(fixture);
    expect(container.querySelector('#out-hint-2')?.textContent).toBe('Outside hint');
    expect(container.querySelector('#out-error-2')?.textContent.trim()).toBe('Outside error');
  });

  it('renders a bound id inside a field and lists it in the description, also after it changes', async () => {
    const { fixture, container } = await render(BoundIds);
    expect(container.querySelector('#my-hint')?.textContent).toBe('Help');
    expect(container.querySelector('#my-error')?.textContent.trim()).toBe('Enter a message.');
    expect(describedBy()).toBe('my-hint my-error');
    fixture.componentInstance.hintId.set('new-hint');
    fixture.componentInstance.errorId.set('new-error');
    await stable(fixture);
    expect(container.querySelector('#new-hint')?.textContent).toBe('Help');
    expect(container.querySelector('#new-error')?.textContent.trim()).toBe('Enter a message.');
    expect(describedBy()).toBe('new-hint new-error');
  });

  it('falls back to the generated id when the bound id is cleared', async () => {
    const { fixture } = await render(BoundIds);
    fixture.componentInstance.hintId.set(undefined);
    await stable(fixture);
    expect(describedBy()).toBe('msg-hint-1 my-error');
  });
});

describe('Hints and errors added after the first render', () => {
  it('lists them in document order and drops them again when they are removed', async () => {
    const { fixture } = await render(AddedParts);
    expect(describedBy()).toBe('msg-hint-1 msg-error-1');
    fixture.componentInstance.extra.set(true);
    await stable(fixture);
    expect(screen.getByRole('textbox', { description: /^First Second Error one\. Error two\.$/ })).toBeTruthy();
    expect(describedBy()).toBe('msg-hint-1 msg-hint-2 msg-error-1 msg-error-2');
    expect(screen.getByText('First').id).toBe('msg-hint-1');
    expect(screen.getByText('Second').id).toBe('msg-hint-2');
    fixture.componentInstance.extra.set(false);
    await stable(fixture);
    expect(describedBy()).toBe('msg-hint-1 msg-error-1');
    expect(screen.getByText('Second').id).toBe('msg-hint-1');
  });
});

describe('Hints that a render moves', () => {
  it('lists them in their new document order after a reversed @for', async () => {
    const { fixture } = await render(MovedParts);
    expect(describedBy()).toBe('a b c');
    fixture.componentInstance.hints.update((hints) => [...hints].reverse());
    await stable(fixture);
    expect(describedBy()).toBe('c b a');
    expect(screen.getByRole('textbox', { description: 'c b a' })).toBeTruthy();
  });
});
