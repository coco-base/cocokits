import { describe, expect, it } from 'vitest';
import type { ApiDocJson, ApiMemberJson } from '../api-docs-common/types';
import { compareApiDocs } from './compare';

const member = (over: Partial<ApiMemberJson> = {}): ApiMemberJson => ({
  name: 'side',
  semanticId: 'thing.side',
  type: "'start' | 'end'",
  required: false,
  description: 'Text.',
  ...over,
});

const docOf = (
  framework: ApiDocJson['framework'],
  props: ApiMemberJson[],
  over: Partial<ApiDocJson> = {},
): ApiDocJson => ({
  component: 'thing',
  framework,
  parts: [{ name: 'Thing', semanticId: 'thing.root', description: 'Text.', props, events: [], slots: [], methods: [] }],
  ...over,
});

describe('compareApiDocs and the fields only the API page reads', () => {
  it('ignores the symbols, types, part examples and member group, shared and values of one framework', () => {
    const angular = docOf(
      'angular',
      [
        member({
          group: 'forms',
          shared: true,
          values: [{ value: 'start', description: 'Before.' }],
        }),
      ],
      {
        symbols: [
          { kind: 'constant', name: 'THING_CONFIG', description: 'Text.', type: 'ThingConfig', props: [], methods: [] },
        ],
        types: [{ kind: 'alias', name: 'ThingSide', description: 'Text.', text: "'start' | 'end'", fields: [] }],
      },
    );
    const angularPart = angular.parts[0];
    if (angularPart === undefined) throw new Error('no part');
    const withExamples: ApiDocJson = {
      ...angular,
      parts: [{ ...angularPart, examples: ['<cck-thing />'], remarks: 'More.' }],
    };
    const result = compareApiDocs([withExamples, docOf('react', [member()]), docOf('vue', [member()])]);
    expect(result).toEqual({ failures: [], reports: [] });
  });
});
