import { APP_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { IdGenerator } from '../src/index';

function freshIds(appId: string | null, prefixes: readonly string[]): string[] {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: appId === null ? [] : [{ provide: APP_ID, useValue: appId }] });
  const generator = TestBed.inject(IdGenerator);
  return prefixes.map((prefix) => generator.getId(prefix));
}

afterEach(() => TestBed.resetTestingModule());

describe('IdGenerator', () => {
  it('is a root service: one instance per application', () => {
    TestBed.configureTestingModule({});
    expect(TestBed.inject(IdGenerator)).toBe(TestBed.inject(IdGenerator));
  });

  it('returns a new id on every call, in call order', () => {
    const ids = freshIds('app', ['cck-form-field', 'cck-form-field', 'cck-input']);
    expect(ids).toEqual(['cck-form-field-app-0', 'cck-form-field-app-1', 'cck-input-app-2']);
    expect(new Set(ids).size).toBe(3);
  });

  it('gives the same ids to a server and a client application that render in the same order', () => {
    const order = ['cck-form-field', 'cck-form-field', 'cck-form-field'];
    expect(freshIds('app', order)).toEqual(freshIds('app', order));
  });

  it('keeps two applications on one page apart through the application id', () => {
    const first = freshIds('one', ['cck-form-field']);
    const second = freshIds('two', ['cck-form-field']);
    expect(first).not.toEqual(second);
  });

  it('uses the default application id when none is provided', () => {
    TestBed.resetTestingModule();
    const appId = TestBed.inject(APP_ID);
    expect(freshIds(null, ['cck-form-field'])).toEqual([`cck-form-field-${appId}-0`]);
  });
});
