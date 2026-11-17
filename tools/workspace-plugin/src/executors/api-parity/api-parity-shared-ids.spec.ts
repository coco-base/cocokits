import { describe, expect, it } from 'vitest';
import type { ApiDocJson, ApiMemberJson } from '../api-docs-common/types';
import { compareApiDocs } from './compare';

type Part = ApiDocJson['parts'][number];

const part = (semanticId: string, over: Partial<Part> = {}): Part => ({
  name: semanticId,
  semanticId,
  description: 'Text.',
  props: [],
  events: [],
  slots: [],
  methods: [],
  ...over,
});
const prop = (name: string, semanticId: string): ApiMemberJson => ({
  name,
  semanticId,
  type: 'boolean',
  required: false,
  description: 'Text.',
});
const docOf = (framework: ApiDocJson['framework'], parts: Part[]): ApiDocJson => ({
  component: 'acme',
  framework,
  parts,
});

describe('members that share ids across parts', () => {
  const disabled = prop('disabled', 'acme.item.disabled');

  it('keeps the shared ids with the item part when each item kind lists it in its @cckPart tags', () => {
    const angular = docOf('angular', [
      part('acme.root'),
      part('acme.checkItem', { renders: ['item'], props: [disabled] }),
      part('acme.radioItem', { renders: ['item'], props: [disabled] }),
    ]);
    const react = docOf('react', [
      part('acme.root'),
      part('acme.item', { props: [disabled] }),
      part('acme.checkItem'),
      part('acme.radioItem'),
    ]);
    expect(compareApiDocs([angular, react]).failures).toEqual([]);
  });

  it('reports a member the React item lacks', () => {
    const angular = docOf('angular', [
      part('acme.root'),
      part('acme.checkItem', { renders: ['item'], props: [disabled] }),
    ]);
    const react = docOf('react', [part('acme.root'), part('acme.item'), part('acme.checkItem')]);
    expect(compareApiDocs([angular, react]).failures).toEqual([
      'acme.item props "acme.item.disabled" exists in angular only, not in react',
    ]);
  });
});

describe('the value of a section', () => {
  const panelValue = prop('value', 'acme.panel.value');
  const triggerValue = prop('value', 'acme.trigger.value');
  const section = { partName: 'trigger', slotName: 'header', inputName: 'header' };
  const angular = (): ApiDocJson =>
    docOf('angular', [part('acme.root'), part('acme.panel', { section, props: [panelValue] })]);
  const react = (trigger: ApiMemberJson[]): ApiDocJson =>
    docOf('react', [
      part('acme.root'),
      part('acme.trigger', { props: trigger }),
      part('acme.panel', { props: [panelValue] }),
    ]);

  it('reaches the trigger only where the other frameworks declare it there', () => {
    expect(compareApiDocs([angular(), react([])]).failures).toEqual([]);
  });

  it('is compared with the trigger when the other frameworks declare it there', () => {
    expect(compareApiDocs([angular(), react([triggerValue])]).failures).toEqual([]);
    const without = docOf('angular', [part('acme.root'), part('acme.panel', { section })]);
    expect(compareApiDocs([without, react([triggerValue])]).failures).toEqual([
      'acme.panel props "acme.panel.value" exists in react only, not in angular',
      'acme.trigger props "acme.trigger.value" exists in react only, not in angular',
    ]);
  });
});
