import { readProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { themeGenerator } from './generator';
import { ThemeGeneratorSchema } from './schema';

describe('theme generator', () => {
  let tree: Tree;
  const options: ThemeGeneratorSchema = { name: 'test' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await themeGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
    expect(tree.read(`libs/test/src/index.ts`, 'utf-8')).toMatchSnapshot();
  });
});
