import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import * as path from 'path';

import { toTitleCase } from '@cocokits/common-utils';

import { ExampleStoryGeneratorOptions } from './options';
import { ExampleStoryGeneratorSchema } from './schema';

export async function exampleStoryGenerator(tree: Tree, schema: ExampleStoryGeneratorSchema) {
  const paredNames = names(schema.name);
  const options: ExampleStoryGeneratorOptions = {
    ...paredNames,
    titleName: toTitleCase(paredNames.name),
    rawName: schema.name,
    library: schema.library,
    uiComponentName: schema.uiComponentName,
    angularInline: schema.angularInline,
    reactInline: schema.reactInline,
  };

  const reactExampleFolderPath = `apps/react-kits-doc/stories/ui-components/${options.library}/${options.uiComponentName}/examples`; // back-button/component.tsx
  const angularExampleFolderPath = `apps/angular-kits-doc/stories/ui-components/${options.library}/${options.uiComponentName}/examples`; // back-button/component.ts
  const configExampleFolderPath = `packages/internal/common-kits-doc/src/examples-config/${options.uiComponentName}`; // back-button.config.ts

  generateFiles(
    tree,
    path.join(__dirname, `files/${options.reactInline ? 'react-inline' : 'react'}`),
    reactExampleFolderPath,
    options
  );
  addImport(tree, reactExampleFolderPath, false, options);

  generateFiles(
    tree,
    path.join(__dirname, `files/${options.angularInline ? 'angular-inline' : 'angular'}`),
    angularExampleFolderPath,
    options
  );
  addImport(tree, angularExampleFolderPath, true, options);

  generateFiles(tree, path.join(__dirname, `files/config`), configExampleFolderPath, options);

  await formatFiles(tree);
}

function findIndexStory(tree: Tree, startDir: string): string | null {
  let currentDir = startDir;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const candidateTs = path.join(currentDir, 'index.stories.ts');
    const candidateTsx = path.join(currentDir, 'index.stories.tsx');

    if (tree.exists(candidateTs)) {
      return candidateTs;
    }

    if (tree.exists(candidateTsx)) {
      return candidateTsx;
    }

    const parent = path.dirname(currentDir);
    if (parent === currentDir) {
      return null;
    }
    currentDir = parent;
  }
}

function addImport(tree: Tree, exampleFolderPath: string, isAngular: boolean, options: ExampleStoryGeneratorOptions) {
  const indexStoryPath = findIndexStory(tree, exampleFolderPath);

  if (!indexStoryPath || !tree.exists(indexStoryPath)) {
    return;
  }

  let content = tree.read(indexStoryPath, 'utf-8');

  const lastMatch = findLastExportLine(content);

  if (lastMatch) {
    const newLine = `export { ${options.className}${isAngular ? '' : 'Story'} } from './examples/${options.fileName}/index.example.stories';`;
    content = content.replace(lastMatch, `${lastMatch}\n${newLine}`);
  } else {
    console.warn(
      `Could not find a place to export the generate story in ${indexStoryPath}. You will need to add the export manually.`
    );
  }

  tree.write(indexStoryPath, content);
}

function findLastExportLine(content: string): string | null {
  let lastMatch: string | null = null;
  let match: RegExpExecArray | null;

  // Matches any line containing from './examples/ plus any characters after
  // and captures the entire line
  const regexExample = /^(.*from\s+['"]\.\/examples\/.*['"].*)$/gm;

  // Find the last occurrence of the matching line
  while ((match = regexExample.exec(content)) !== null) {
    lastMatch = match[1];
  }

  if (lastMatch) {
    return lastMatch;
  }

  // Matches any line containing from './examples/ plus any characters after
  // and captures the entire line
  const regexOverview = /^(.*from\s+['"]\.\/overview\/.*['"].*)$/gm;

  // Find the last occurrence of the matching line
  while ((match = regexOverview.exec(content)) !== null) {
    lastMatch = match[1];
  }

  return lastMatch;
}

export default exampleStoryGenerator;
