import { Component, Directive, ElementRef, inject, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkNameWhenAttached } from '../src/index';

const check = vi.fn();

@Directive({ selector: '[testChecked]' })
class Checked {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  constructor() {
    checkNameWhenAttached(
      () => this.element,
      (checked) => {
        check(checked === this.element && checked.isConnected);
      },
    );
  }
}

@Component({
  selector: 'test-shown',
  template: `@if (shown()) {
    <ng-content />
  }`,
})
class Shown {
  readonly shown = input(false);
}

@Component({
  imports: [Checked, Shown],
  template: `<test-shown [shown]="shown()"><span testChecked></span></test-shown>`,
})
class Host {
  readonly shown = signal(false);
}

afterEach(() => {
  check.mockReset();
  TestBed.resetTestingModule();
});

describe('checkNameWhenAttached', () => {
  it('waits while the element is not in the document and checks once when it is', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(check).not.toHaveBeenCalled();

    fixture.componentInstance.shown.set(true);
    await fixture.whenStable();
    expect(check).toHaveBeenCalledTimes(1);
    expect(check).toHaveBeenCalledWith(true);

    fixture.componentInstance.shown.set(false);
    await fixture.whenStable();
    fixture.componentInstance.shown.set(true);
    await fixture.whenStable();
    expect(check).toHaveBeenCalledTimes(1);
  });
});
