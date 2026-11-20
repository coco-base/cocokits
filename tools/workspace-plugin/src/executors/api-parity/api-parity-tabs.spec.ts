import { describe, expect, it } from 'vitest';
import type { ApiDocJson, ApiMemberJson, ApiSlotJson } from '../api-docs-common/types';
import { compareApiDocs } from './compare';

type Part = ApiDocJson['parts'][number];

function part(semanticId: string, over: Partial<Part> = {}): Part {
  return { name: semanticId, semanticId, description: 'Text.', props: [], events: [], slots: [], methods: [], ...over };
}

const docOf = (framework: ApiDocJson['framework'], parts: Part[]): ApiDocJson => ({
  component: 'tabs',
  framework,
  parts,
});

const value = (semanticId: string): ApiMemberJson => ({
  name: 'value',
  semanticId,
  type: 'string',
  required: true,
  description: 'Text.',
});

const slot = (name: string, semanticId: string): ApiSlotJson => ({
  name,
  semanticId,
  type: 'ReactNode',
  required: false,
  description: 'Text.',
});

describe('the Tabs shapes', () => {
  it('accepts a tab and a panel without a value in Angular, which selects by index', () => {
    const angular = docOf('angular', [part('tabs.root'), part('tabs.trigger'), part('tabs.panel')]);
    const react = docOf('react', [
      part('tabs.root'),
      part('tabs.trigger', { props: [value('tabs.trigger.value')] }),
      part('tabs.panel', { props: [value('tabs.panel.value')] }),
    ]);
    expect(compareApiDocs([angular, react]).failures).toEqual([]);
  });

  it('accepts the Angular content template slot and the default slot of the indicator it renders', () => {
    const angular = docOf('angular', [
      part('tabs.root', { renders: ['list', 'indicator'], slots: [slot('default', 'tabs.default')] }),
      part('tabs.list'),
      part('tabs.indicator'),
      part('tabs.panel', { slots: [slot('content', 'tabs.content')] }),
    ]);
    const react = docOf('react', [
      part('tabs.root'),
      part('tabs.list', { slots: [slot('default', 'tabs.default')] }),
      part('tabs.indicator'),
      part('tabs.panel'),
    ]);
    expect(compareApiDocs([angular, react]).failures).toEqual([]);
  });

  it('still requires a value in React and Vue to agree', () => {
    const react = docOf('react', [part('tabs.root'), part('tabs.trigger', { props: [value('tabs.trigger.value')] })]);
    const vue = docOf('vue', [part('tabs.root'), part('tabs.trigger')]);
    expect(compareApiDocs([react, vue]).failures).toEqual([
      'tabs.trigger props "tabs.trigger.value" exists in react only, not in vue',
    ]);
  });
});
