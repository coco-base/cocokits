import { Component, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { CckDir, CckDirection, provideCckDirection, type Direction } from '../src/index';

afterEach(() => {
  TestBed.resetTestingModule();
});

@Component({ selector: 'dir-probe', template: '', host: { '[attr.data-seen]': 'direction.dir()' } })
class DirProbe {
  readonly direction = inject(CckDirection);
}

@Component({
  selector: 'dir-host',
  imports: [CckDir, DirProbe],
  template: `
    <dir-probe id="app" />
    <div id="outer" cckDir [dir]="outer()"><dir-probe id="inside" /></div>
    <div id="inner" cckDir dir="rtl"><dir-probe id="nested" /></div>
  `,
})
class DirHost {
  readonly outer = signal<Direction>('ltr');
}

describe('direction runtime', () => {
  it('defaults to ltr', () => {
    expect(TestBed.inject(CckDirection).dir()).toBe('ltr');
  });

  it('is set app-wide by provideCckDirection', () => {
    TestBed.configureTestingModule({ providers: [provideCckDirection('rtl')] });
    expect(TestBed.inject(CckDirection).dir()).toBe('rtl');
  });

  it('is provided to a subtree by [cckDir], which also sets dir on its element', async () => {
    TestBed.configureTestingModule({ providers: [provideCckDirection('rtl')] });
    const fixture = TestBed.createComponent(DirHost);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const seen = (id: string): string | null => root.querySelector(`#${id}`)?.getAttribute('data-seen') ?? null;
    expect(seen('app')).toBe('rtl');
    expect(seen('inside')).toBe('ltr');
    expect(seen('nested')).toBe('rtl');
    expect(root.querySelector('#outer')?.getAttribute('dir')).toBe('ltr');
    expect(root.querySelector('#inner')?.getAttribute('dir')).toBe('rtl');

    fixture.componentInstance.outer.set('rtl');
    await fixture.whenStable();
    expect(seen('inside')).toBe('rtl');
    expect(root.querySelector('#outer')?.getAttribute('dir')).toBe('rtl');
  });
});
