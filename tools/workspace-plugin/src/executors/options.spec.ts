import { describe, expect, it } from 'vitest';
import { expandOption } from './options';

const context = {
  root: '/ws',
  projectName: 'react',
  projectsConfigurations: { projects: { react: { root: 'packages/react' } } },
} as never;

describe('expandOption', () => {
  it('replaces {projectRoot}, {projectName} and {workspaceRoot}', () => {
    expect(expandOption('{projectRoot}/a', context)).toBe('packages/react/a');
    expect(expandOption('{workspaceRoot}/dist/api-docs/{projectName}', context)).toBe('./dist/api-docs/react');
  });
});
