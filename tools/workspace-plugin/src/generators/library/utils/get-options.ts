import { names } from '@nx/devkit';

import { posixPath } from '../../../utils/path';
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
    offsetPathToRoot: posixPath.relative(libraryRoot, './'),
    tsconfigBase: './tsconfig.base.json',
    tsconfigStorybookManager: './tsconfig.storybook-manager-paths.json',
  };
}

function getImportPath(schema: LibraryGeneratorSchema) {
  return schema.importPath || `@cocokits/${schema.framework}-${schema.name}`;
}

function getLibraryRoot(schema: LibraryGeneratorSchema, workspaceRoot: string) {
  const libraryPath =
    schema.directoryFormat === GeneratorDirectoryFormat.AsProvided
      ? posixPath.relative(workspaceRoot, posixPath.join(posixPath.cwd(), schema.directory, schema.name))
      : posixPath.join(schema.directory, schema.name);

  return libraryPath;
}
