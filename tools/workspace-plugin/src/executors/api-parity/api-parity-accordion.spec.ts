import { describe, expect, it } from 'vitest';
import type { ApiDocJson, ApiMemberJson } from '../api-docs-common/types';
import { compareApiDocs } from './compare';

type Framework = ApiDocJson['framework'];

function member(over: Partial<ApiMemberJson>): ApiMemberJson {
  return { name: 'x', semanticId: 'accordion.x', type: 'boolean', required: false, description: 'Text.', ...over };
}

describe('the Accordion shapes', () => {
  const part = (semanticId: string, over: Partial<ApiDocJson['parts'][number]> = {}): ApiDocJson['parts'][number] => ({
    name: semanticId,
    semanticId,
    description: 'Text.',
    props: [],
    events: [],
    slots: [],
    methods: [],
    ...over,
  });
  const docOf = (framework: Framework, parts: ApiDocJson['parts']): ApiDocJson => ({
    component: 'accordion',
    framework,
    parts,
  });
  const headingLevel = member({ name: 'headingLevel', semanticId: 'accordion.header.headingLevel', type: 'number' });
  const expanded = member({ name: 'expanded', semanticId: 'none' });

  it('does not make a noneChange event of a model tagged none', () => {
    const angular = docOf('angular', [
      part('accordion.root'),
      part('accordion.item', {
        props: [expanded],
        bindings: [{ semanticId: 'none', value: 'expanded', syntax: '[(expanded)]' }],
      }),
    ]);
    const react = docOf('react', [part('accordion.root'), part('accordion.item')]);
    expect(compareApiDocs([angular, react]).failures).toEqual([]);
  });

  it('pairs the heading level of the Angular item with the Header part of React and Vue', () => {
    const angular = docOf('angular', [
      part('accordion.root'),
      part('accordion.item', { renders: ['header'], props: [{ ...headingLevel, default: '3' }] }),
    ]);
    const react = docOf('react', [
      part('accordion.root'),
      part('accordion.item'),
      part('accordion.header', { props: [{ ...headingLevel, default: "'h3'" }] }),
    ]);
    expect(compareApiDocs([angular, react]).failures).toEqual([]);
  });

  it('accepts a root value change without a counterpart in Angular, and still requires React and Vue to agree', () => {
    const change = member({ name: 'onValueChange', semanticId: 'accordion.valueChange', type: '() => void' });
    const angular = docOf('angular', [part('accordion.root')]);
    const react = docOf('react', [part('accordion.root', { events: [change] })]);
    const vue = docOf('vue', [part('accordion.root')]);
    expect(compareApiDocs([angular, react, vue]).failures).toEqual([
      'accordion.root events "accordion.valueChange" exists in react only, not in vue',
    ]);
    const both = docOf('vue', [part('accordion.root', { events: [change] })]);
    expect(compareApiDocs([angular, react, both]).failures).toEqual([]);
  });

  it('does not compare the required flag and the default of the type, which Radix requires and Reka infers', () => {
    const type = (over: Partial<ApiMemberJson>): ApiMemberJson =>
      member({ name: 'type', semanticId: 'accordion.type', type: "'single' | 'multiple'", ...over });
    const react = docOf('react', [part('accordion.root', { props: [type({ required: true })] })]);
    const vue = docOf('vue', [part('accordion.root', { props: [type({ default: "'single'" })] })]);
    const angular = docOf('angular', [part('accordion.root')]);
    expect(compareApiDocs([angular, react, vue]).failures).toEqual([]);
  });
});
