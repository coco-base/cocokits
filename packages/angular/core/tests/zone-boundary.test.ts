import { NgZone, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { injectZoneBoundary, type ZoneBoundary } from '../src/index';

function boundary(providers: unknown[]): ZoneBoundary {
  TestBed.configureTestingModule({ providers: providers as never[] });
  return TestBed.runInInjectionContext(() => injectZoneBoundary());
}

afterEach(() => {
  TestBed.resetTestingModule();
});

describe('injectZoneBoundary', () => {
  it('runs outside and inside through NgZone when there is one', () => {
    const calls: string[] = [];
    const zone = {
      runOutsideAngular: <T>(fn: () => T): T => {
        calls.push('outside');
        return fn();
      },
      run: <T>(fn: () => T): T => {
        calls.push('run');
        return fn();
      },
    };
    const b = boundary([{ provide: NgZone, useValue: zone }]);
    expect(b.outside(() => 1)).toBe(1);
    expect(b.inside(() => 2)).toBe(2);
    expect(calls).toEqual(['outside', 'run']);
  });

  it('calls the function plainly in a zoneless app', () => {
    const b = boundary([provideZonelessChangeDetection()]);
    const fn = vi.fn(() => 'x');
    expect(b.outside(fn)).toBe('x');
    expect(b.inside(fn)).toBe('x');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
