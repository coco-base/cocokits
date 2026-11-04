import { describe, expect, it } from 'vitest';
import type { ApiDocJson, ApiMemberJson, ApiPartJson } from '../api-docs-common/types';
import { compareApiDocs } from './compare';

type Framework = ApiDocJson['framework'];

function member(over: Partial<ApiMemberJson>): ApiMemberJson {
  return { name: 'x', semanticId: 'tooltip.x', type: 'number', required: false, description: 'Text.', ...over };
}

const part = (semanticId: string, over: Partial<ApiPartJson> = {}): ApiPartJson => ({
  name: semanticId,
  semanticId,
  description: 'Text.',
  props: [],
  events: [],
  slots: [],
  methods: [],
  ...over,
});

const docOf = (framework: Framework, parts: ApiPartJson[]): ApiDocJson => ({ component: 'tooltip', framework, parts });

describe('a default that differs by design', () => {
  const delay = (framework: Framework, value: string, tagged: boolean): ApiMemberJson =>
    member({
      name: framework === 'angular' ? 'showDelay' : 'delayDuration',
      semanticId: 'tooltip.delay',
      default: value,
      ...(tagged ? { defaultDiffers: 'The holder differs.' } : {}),
    });
  const docs = (angularTagged: boolean, reactTagged: boolean, reactRequired = false): ApiDocJson[] => [
    docOf('angular', [part('tooltip.root', { props: [delay('angular', '0', angularTagged)] })]),
    docOf('react', [
      part('tooltip.root', { props: [{ ...delay('react', '700', reactTagged), required: reactRequired }] }),
    ]),
  ];

  it('is reported when every member with the id carries the tag', () => {
    const result = compareApiDocs(docs(true, true));
    expect(result.failures).toEqual([]);
    expect(result.reports).toEqual([
      'tooltip.root props "tooltip.delay" default differs: angular tooltip.root 0, react tooltip.root 700 (by design: The holder differs.)',
    ]);
  });

  it('still fails when one member lacks the tag', () => {
    expect(compareApiDocs(docs(true, false)).failures).toEqual([
      'tooltip.root props "tooltip.delay" default differs: angular tooltip.root 0, react tooltip.root 700',
    ]);
    expect(compareApiDocs(docs(false, false)).failures).toHaveLength(1);
  });

  it('does not excuse a required difference', () => {
    expect(compareApiDocs(docs(true, true, true)).failures).toEqual([
      'tooltip.root props "tooltip.delay" required differs: angular tooltip.root false, react tooltip.root true',
    ]);
  });
});

describe('a part that exists in some frameworks only by design', () => {
  const provider = (): ApiPartJson =>
    part('tooltip.provider', {
      frameworkOnly: true,
      props: [member({ name: 'delayDuration', semanticId: 'tooltip.provider.delayDuration', default: '700' })],
    });

  it('is not required in Angular', () => {
    const docs = [
      docOf('angular', [part('tooltip.root')]),
      docOf('react', [part('tooltip.root'), provider()]),
      docOf('vue', [part('tooltip.root'), provider()]),
    ];
    expect(compareApiDocs(docs).failures).toEqual([]);
  });

  it('still compares its members across the frameworks that have it', () => {
    const vue = provider();
    const first = vue.props[0];
    if (first) first.default = '500';
    const docs = [
      docOf('angular', [part('tooltip.root')]),
      docOf('react', [part('tooltip.root'), provider()]),
      docOf('vue', [part('tooltip.root'), vue]),
    ];
    expect(compareApiDocs(docs).failures).toEqual([
      'tooltip.provider props "tooltip.provider.delayDuration" default differs: react tooltip.provider 700, vue tooltip.provider 500',
    ]);
  });

  it('fails on a part that is missing without the tag', () => {
    const docs = [
      docOf('angular', [part('tooltip.root')]),
      docOf('react', [part('tooltip.root'), part('tooltip.provider')]),
    ];
    expect(compareApiDocs(docs).failures).toEqual(['tooltip.provider: the part exists in react only']);
  });
});

describe('a root member that names the content part', () => {
  const label = (name: string): ApiMemberJson =>
    member({ name, semanticId: 'tooltip.content.aria-label', type: 'string' });
  const angular = (withContent: boolean): ApiDocJson =>
    docOf('angular', [
      part('tooltip.root', { props: [label('message')] }),
      ...(withContent ? [part('tooltip.content')] : []),
    ]);
  const react = docOf('react', [part('tooltip.root'), part('tooltip.content', { props: [label('aria-label')] })]);

  it('is the label of the Angular content part when Angular has that part', () => {
    expect(compareApiDocs([angular(true), react]).failures).toEqual([]);
  });

  it('is dropped when Angular has no such part, so React reports the part nobody pairs', () => {
    expect(compareApiDocs([angular(false), react]).failures).toEqual([
      'tooltip.content: the part exists in react only',
    ]);
  });

  it('keeps its other members on the root', () => {
    const disabled = (): ApiMemberJson => member({ name: 'disabled', semanticId: 'tooltip.disabled' });
    const root = angular(true);
    root.parts[0]?.props.push(disabled());
    const reactRoot = docOf('react', [
      part('tooltip.root', { props: [disabled()] }),
      part('tooltip.content', { props: [label('aria-label')] }),
    ]);
    expect(compareApiDocs([root, reactRoot]).failures).toEqual([]);
  });
});
