import { names } from '@nx/devkit';
import process from 'node:process';
import path from 'path';

import { GeneratorDirectoryFormat } from '../../generator.model';
import { LibraryGeneratorOptions } from '../model';
import { LibraryGeneratorSchema } from '../schema';

export function getOptions(schema: LibraryGeneratorSchema, workspaceRoot: string): LibraryGeneratorOptions {
  const libraryRoot = getLibraryRoot(schema, workspaceRoot);

  return {
    ...names(schema.name),
    type: schema.type,
    framework: schema.framework,
    storybook: schema.storybook,
    publishable: schema.publishable,
    importPath: getImportPath(schema),
    libraryRoot: getLibraryRoot(schema, workspaceRoot),
    offsetPathToRoot: path.relative(libraryRoot, './'),
    tsconfigBase: './tsconfig.base.json',
    tsconfigStorybookManager: './tsconfig.storybook-manager-paths.json',
  };
}

function getImportPath(schema: LibraryGeneratorSchema) {
  return schema.importPath || `@cocokits/${schema.framework}-${schema.name}`;
}

function getLibraryRoot(schema: LibraryGeneratorSchema, workspaceRoot: string) {
  return schema.directoryFormat === GeneratorDirectoryFormat.AsProvided
    ? path.relative(workspaceRoot, path.join(process.cwd(), schema.directory, schema.name))
    : path.join(schema.directory, schema.name);
}
