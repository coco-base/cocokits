import { generateFiles, names, Tree } from '@nx/devkit';
import { LibraryGeneratorOptions, LibraryGeneratorSchema } from './schema';
import { CckLibraryFramework, CckLibraryType } from './library-generator.model';
import type { Schema as NgSchema } from '@nx/angular/src/generators/library/schema';
import { Linter } from '@nx/eslint';
import { libraryGenerator as ngLibraryGenerator, UnitTestRunner } from '@nx/angular/generators';
import * as path from 'path';

export default async function libraryGenerator(tree: Tree, options: LibraryGeneratorSchema) {
  const libraryOptions: LibraryGeneratorOptions = {
    ...options,
    ...names(options.name),
  };

  switch (options.framework) {
    case CckLibraryFramework.Angular:
      await angularLibraryGenerator(tree, libraryOptions);
      break;

    case CckLibraryFramework.React:
      await reactLibraryGenerator(tree, libraryOptions);
      break;

    case CckLibraryFramework.Web:
      await webLibraryGenerator(tree, libraryOptions);
      break;

    case CckLibraryFramework.Html:
      await htmlLibraryGenerator(tree, libraryOptions);
      break;

    case CckLibraryFramework.Shared:
      await angularLibraryGenerator(tree, libraryOptions);
      await reactLibraryGenerator(tree, libraryOptions);
      await webLibraryGenerator(tree, libraryOptions);
      await htmlLibraryGenerator(tree, libraryOptions);
      break;
  }
}

async function angularLibraryGenerator(tree: Tree, options: LibraryGeneratorOptions) {
  const ngSchema: NgSchema = {
    name: options.name,
    directory: getNxLibraryDirectory(options),
    buildable: true,
    publishable: true,
    importPath: getNxImportPath(options),
    tags: getNxTags(options),
    linter: Linter.None,
    unitTestRunner: UnitTestRunner.None,
    skipModule: true,
    skipTests: true,
    standalone: false,
  };

  const libPath = `${ngSchema.directory}/${ngSchema.name}`;
  const eslintPath = `tools/eslint`;
  const relativePathToEslint = path.relative(libPath, eslintPath);

  await ngLibraryGenerator(tree, ngSchema);
  generateFiles(tree, path.join(__dirname, 'templates', 'angular'), path.join(libPath), {
    baseEslintDir: relativePathToEslint,
  });
}

async function reactLibraryGenerator(tree: Tree, options: LibraryGeneratorOptions) {
  console.log('library generator for react is not implemented.');
}

async function webLibraryGenerator(tree: Tree, options: LibraryGeneratorOptions) {
  console.log('library generator for web is not implemented.');
}

async function htmlLibraryGenerator(tree: Tree, options: LibraryGeneratorOptions) {
  console.log('library generator for html is not implemented.');
}

function getNxTags(options: LibraryGeneratorOptions) {
  return `type:${options.type}, framework:${options.framework}`;
}

function getNxImportPath(options: LibraryGeneratorOptions) {
  switch (options.type) {
    case CckLibraryType.Theme:
      return `@coco-kits/theme-${options.fileName}`;
    case CckLibraryType.App:
      return `@coco-kits/app-${options.fileName}`;
    case CckLibraryType.Ui:
      return `@coco-kits/${options.framework}-${options.fileName}`;
    case CckLibraryType.Util:
      return `@coco-kits/${options.framework}-utils-${options.fileName}`;
  }
}

function getNxLibraryDirectory(options: LibraryGeneratorOptions) {
  switch (options.type) {
    case CckLibraryType.Theme:
      return `packages/themes`;
    case CckLibraryType.App:
      return `apps`;
    case CckLibraryType.Ui:
      return `packages/${options.framework}`;
    case CckLibraryType.Util:
      return `packages/${options.framework}/utils`;
  }
}
