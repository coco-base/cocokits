import { Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormField, form, required as requiredRule } from '@angular/forms/signals';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckDir } from '@cocokits/angular-core';
import { CckRadioImports } from '@cocokits/angular/radio';
import { radioGroupMeta } from '@cocokits/machines/radio-group';
import { CckRadioGroupImports, type RadioGroupChangeDetails } from '../index';
import { must } from './queries';

const radio = (name: string): HTMLInputElement => screen.getByRole<HTMLInputElement>('radio', { name });
const imports = [...CckRadioGroupImports, ...CckRadioImports];

@Component({
  imports: [...imports, FormsModule],
  template: `
    <span id="plan-label">Plan</span>
    <div
      cckRadioGroup
      aria-labelledby="plan-label"
      [(value)]="plan"
      [orientation]="orientation()"
      [loop]="loop()"
      [disabled]="disabled()"
      [required]="required()"
      (valueChangeDetails)="events.push($event)"
    >
      <div cckRadio submitValue="free">Free</div>
      <div cckRadio submitValue="pro" [disabled]="proDisabled()">Pro</div>
      <div cckRadio submitValue="team">Team</div>
    </div>
  `,
})
class Host {
  readonly plan = signal<string | null>('free');
  readonly orientation = signal<'horizontal' | 'vertical' | undefined>(undefined);
  readonly loop = signal(true);
  readonly disabled = signal(false);
  readonly required = signal(false);
  readonly proDisabled = signal(false);
  readonly events: RadioGroupChangeDetails[] = [];
}

describe('Radio group', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the root contract and gives the radios one name', async () => {
    const { container } = await render(Host);
    const root = must(container.querySelector('.cck-radio-group'));
    expect(root.getAttribute('role')).toBe('radiogroup');
    expect(root.getAttribute('aria-labelledby')).toBe('plan-label');
    expect(
      [...root.attributes].map((a) => a.name).filter((n) => n.startsWith('data-') || n.startsWith('aria-')),
    ).toEqual(['aria-labelledby']);
    const names = new Set(['Free', 'Pro', 'Team'].map((label) => radio(label).name));
    expect(names.size).toBe(1);
    expect([...names][0]).toMatch(/^cck-radio-group-/);
    expect(radio('Free').checked).toBe(true);
    expect(radio('Pro').checked).toBe(false);
  });

  it('renders the state as aria and data attributes', async () => {
    const { fixture, container } = await render(Host);
    const host = fixture.componentInstance;
    host.orientation.set('horizontal');
    host.required.set(true);
    host.disabled.set(true);
    fixture.detectChanges();
    const root = must(container.querySelector('.cck-radio-group'));
    expect(root.getAttribute('aria-orientation')).toBe('horizontal');
    expect(root.getAttribute('aria-required')).toBe('true');
    expect(root.getAttribute('aria-disabled')).toBe('true');
    expect(root.getAttribute('data-orientation')).toBe('horizontal');
    expect(root.hasAttribute('data-required')).toBe(true);
    expect(root.hasAttribute('data-disabled')).toBe(true);
    expect(radio('Pro').disabled).toBe(true);
    expect(radio('Pro').required).toBe(true);
  });

  it('has one tab stop: the checked radio, else the first enabled', async () => {
    const { fixture } = await render(Host);
    const host = fixture.componentInstance;
    await fixture.whenStable();
    expect(['Free', 'Pro', 'Team'].map((l) => radio(l).tabIndex)).toEqual([0, -1, -1]);
    host.plan.set(null);
    fixture.detectChanges();
    expect(['Free', 'Pro', 'Team'].map((l) => radio(l).tabIndex)).toEqual([0, -1, -1]);
    host.plan.set('team');
    fixture.detectChanges();
    expect(['Free', 'Pro', 'Team'].map((l) => radio(l).tabIndex)).toEqual([-1, -1, 0]);
    host.disabled.set(true);
    fixture.detectChanges();
    expect(['Free', 'Pro', 'Team'].map((l) => radio(l).tabIndex)).toEqual([-1, -1, -1]);
  });

  it('moves focus and check with the arrows, skips disabled radios and wraps', async () => {
    const { fixture } = await render(Host);
    const host = fixture.componentInstance;
    host.proDisabled.set(true);
    fixture.detectChanges();
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement).toBe(radio('Free'));
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(radio('Team'));
    expect(radio('Team').checked).toBe(true);
    expect(host.plan()).toBe('team');
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(radio('Free'));
    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(radio('Team'));
    expect(host.events.map((e) => [e.value, e.reason, e.event?.type])).toEqual([
      ['team', 'user', 'change'],
      ['free', 'user', 'change'],
      ['team', 'user', 'change'],
    ]);
  });

  it('checks the focused radio with Space and reports a user change', async () => {
    const { fixture } = await render(Host);
    const host = fixture.componentInstance;
    host.plan.set(null);
    fixture.detectChanges();
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement).toBe(radio('Free'));
    expect(radio('Free').checked).toBe(false);
    await user.keyboard(' ');
    expect(radio('Free').checked).toBe(true);
    expect(host.plan()).toBe('free');
    expect(host.events.map((e) => [e.value, e.reason, e.event?.type])).toEqual([['free', 'user', 'change']]);
  });

  it('renders a div root by default', async () => {
    const { container } = await render(Host);
    expect(must(container.querySelector('.cck-radio-group')).tagName.toLowerCase()).toBe(
      radioGroupMeta.defaultElements?.root,
    );
  });

  it('stops at the end with loop=false and blocks the other axis with orientation', async () => {
    const { fixture } = await render(Host);
    const host = fixture.componentInstance;
    host.plan.set('team');
    host.loop.set(false);
    host.orientation.set('vertical');
    fixture.detectChanges();
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(radio('Team'));
    expect(host.plan()).toBe('team');
    await user.keyboard('{ArrowLeft}');
    expect(host.plan()).toBe('team');
    expect(host.events).toEqual([]);
    await user.keyboard('{ArrowUp}');
    expect(host.plan()).toBe('pro');
  });

  it('does not handle Home and End, and fires nothing for a parent write', async () => {
    const { fixture } = await render(Host);
    const host = fixture.componentInstance;
    host.plan.set('pro');
    fixture.detectChanges();
    expect(radio('Pro').checked).toBe(true);
    expect(radio('Free').checked).toBe(false);
    expect(host.events).toEqual([]);
    // jsdom cannot run the native End on a radio: the group must simply leave the key alone.
    const end = new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true });
    radio('Pro').dispatchEvent(end);
    expect(end.defaultPrevented).toBe(false);
    expect(host.plan()).toBe('pro');
  });

  it('checks by click and label click', async () => {
    const { fixture } = await render(Host);
    const host = fixture.componentInstance;
    const user = userEvent.setup();
    await user.click(radio('Pro'));
    expect(host.plan()).toBe('pro');
    await user.click(screen.getByText('Team'));
    expect(host.plan()).toBe('team');
    expect(host.events.map((e) => e.value)).toEqual(['pro', 'team']);
  });

  it('swaps Left and Right in rtl', async () => {
    @Component({
      imports,
      template: `
        <div dir="rtl" cckDir>
          <div cckRadioGroup aria-label="Plan" [value]="plan">
            <div cckRadio submitValue="free">Free</div>
            <div cckRadio submitValue="pro">Pro</div>
          </div>
        </div>
      `,
    })
    class Rtl {
      readonly plan = 'free';
    }
    await render(Rtl, { imports: [CckDir] });
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(radio('Pro'));
  });

  it('leaves the group on Tab and keeps one tab stop', async () => {
    await render(
      `<button>before</button><div cckRadioGroup aria-label="Plan" value="free">
        <div cckRadio submitValue="free">Free</div><div cckRadio submitValue="pro">Pro</div></div><button>after</button>`,
      { imports },
    );
    const user = userEvent.setup();
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(radio('Free'));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByText('after'));
  });

  it('revalidates the tab stop when radios are added and removed', async () => {
    @Component({
      imports,
      template: `
        <div cckRadioGroup aria-label="Plan">
          @for (plan of plans(); track plan) {
            <div cckRadio [submitValue]="plan">{{ plan }}</div>
          }
        </div>
      `,
    })
    class Dynamic {
      readonly plans = signal(['a', 'b']);
    }
    const { fixture } = await render(Dynamic);
    await fixture.whenStable();
    expect([radio('a').tabIndex, radio('b').tabIndex]).toEqual([0, -1]);
    fixture.componentInstance.plans.set(['b', 'a']);
    fixture.detectChanges();
    await fixture.whenStable();
    expect([radio('a').tabIndex, radio('b').tabIndex]).toEqual([-1, 0]);
    fixture.componentInstance.plans.set(['a']);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(radio('a').tabIndex).toBe(0);
  });

  it('warns about a radio without a value and never checks it', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(`<div cckRadioGroup aria-label="Plan"><div cckRadio>Loose</div></div>`, { imports });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no submitValue'));
    await userEvent.setup().click(radio('Loose'));
    expect(radio('Loose').checked).toBe(false);
  });

  it('emits touch when focus leaves the group and not between radios', async () => {
    const touch = vi.fn();
    await render(
      `<div cckRadioGroup aria-label="Plan" value="free" (touch)="touch()">
        <div cckRadio submitValue="free">Free</div><div cckRadio submitValue="pro">Pro</div></div><button>after</button>`,
      { imports, componentProperties: { touch } },
    );
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(touch).not.toHaveBeenCalled();
    await user.tab();
    expect(touch).toHaveBeenCalledTimes(1);
  });
});

describe('Radio group in a form', () => {
  @Component({
    imports,
    template: `
      <form aria-label="Plan form">
        <div
          cckRadioGroup
          aria-label="Plan"
          name="plan"
          [required]="true"
          [(value)]="plan"
          (valueChangeDetails)="events.push($event)"
        >
          <div cckRadio submitValue="free">Free</div>
          <div cckRadio submitValue="pro">Pro</div>
        </div>
      </form>
    `,
  })
  class NativeForm {
    readonly plan = signal<string | null>('free');
    readonly events: RadioGroupChangeDetails[] = [];
  }

  it('submits name=value of the checked radio and nothing when none is checked', async () => {
    const { fixture } = await render(NativeForm);
    const formElement = screen.getByRole<HTMLFormElement>('form');
    expect(new FormData(formElement).get('plan')).toBe('free');
    fixture.componentInstance.plan.set(null);
    fixture.detectChanges();
    expect(new FormData(formElement).has('plan')).toBe(false);
    expect(formElement.checkValidity()).toBe(false);
    await userEvent.setup().click(radio('Pro'));
    expect(formElement.checkValidity()).toBe(true);
    expect(new FormData(formElement).get('plan')).toBe('pro');
  });

  it('restores the mount value on reset and emits one form-reset change only when it changes', async () => {
    const { fixture } = await render(NativeForm);
    const host = fixture.componentInstance;
    const formElement = screen.getByRole<HTMLFormElement>('form');
    formElement.reset();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(host.events).toEqual([]);
    await userEvent.setup().click(radio('Pro'));
    host.events.length = 0;
    formElement.reset();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
    expect(host.plan()).toBe('free');
    expect(radio('Free').checked).toBe(true);
    expect(radio('Pro').checked).toBe(false);
    expect(host.events.map((e) => [e.value, e.reason])).toEqual([['free', 'form-reset']]);
  });

  it('disables every radio through a disabling fieldset', async () => {
    await render(
      `<fieldset disabled><div cckRadioGroup aria-label="Plan"><div cckRadio submitValue="a">A</div></div></fieldset>`,
      { imports },
    );
    expect(radio('A').disabled).toBe(true);
  });
});

describe('Radio group forms libraries', () => {
  it('binds with Signal Forms [formField] without a ControlValueAccessor', async () => {
    @Component({
      imports: [...imports, FormField],
      template: `
        <div cckRadioGroup aria-label="Plan" [formField]="planForm.plan">
          <div cckRadio submitValue="free">Free</div>
          <div cckRadio submitValue="pro">Pro</div>
        </div>
      `,
    })
    class SignalHost {
      readonly model = signal<{ plan: string | null }>({ plan: 'pro' });
      readonly planForm = form(this.model, (path) => {
        requiredRule(path.plan);
      });
    }
    const { fixture, container } = await render(SignalHost);
    expect(radio('Pro').checked).toBe(true);
    await userEvent.setup().click(radio('Free'));
    expect(fixture.componentInstance.model().plan).toBe('free');
    expect(must(container.querySelector('.cck-radio-group')).hasAttribute('data-required')).toBe(true);
    fixture.componentInstance.model.set({ plan: 'pro' });
    fixture.detectChanges();
    expect(radio('Pro').checked).toBe(true);
  });

  it('binds with formControlName / [formControl]', async () => {
    @Component({
      imports: [...imports, ReactiveFormsModule],
      template: `
        <div cckRadioGroup aria-label="Plan" [formControl]="control">
          <div cckRadio submitValue="free">Free</div>
          <div cckRadio submitValue="pro">Pro</div>
        </div>
      `,
    })
    class ReactiveHost {
      readonly control = new FormControl<string | null>('pro');
    }
    const { fixture } = await render(ReactiveHost);
    expect(radio('Pro').checked).toBe(true);
    await userEvent.setup().click(radio('Free'));
    expect(fixture.componentInstance.control.value).toBe('free');
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(radio('Free').disabled).toBe(true);
  });

  it('binds with ngModel', async () => {
    @Component({
      imports: [...imports, FormsModule],
      template: `
        <div cckRadioGroup aria-label="Plan" [(ngModel)]="plan">
          <div cckRadio submitValue="free">Free</div>
          <div cckRadio submitValue="pro">Pro</div>
        </div>
      `,
    })
    class ModelHost {
      plan: string | null = 'pro';
    }
    const { fixture } = await render(ModelHost);
    await fixture.whenStable();
    expect(radio('Pro').checked).toBe(true);
    await userEvent.setup().click(radio('Free'));
    expect(fixture.componentInstance.plan).toBe('free');
  });
});
