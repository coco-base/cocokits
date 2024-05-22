import { generateFiles, offsetFromRoot, Tree, workspaceRoot } from '@nx/devkit';
import type { Schema as NgSchema } from '@nx/angular/src/generators/library/schema';
import { Linter } from '@nx/eslint';
import { libraryGenerator as ngLibraryGenerator, UnitTestRunner } from '@nx/angular/generators';
import * as path from 'path';
import { LibraryFramework, LibraryGeneratorOptions, LibraryType } from './libarary-generator.model';

export async function angularLibraryGenerator(tree: Tree, options: LibraryGeneratorOptions) {
  const ngSchema: NgSchema = {
    name: options.name,
    directory: options.directory,
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

  const libPath = `${options.directory}/${options.name}`;

  await ngLibraryGenerator(tree, ngSchema);

  generateFiles(tree, path.join(__dirname, 'templates', 'angular', 'defaults'), path.join(libPath), {
    offsetFromRoom: offsetFromRoot(libPath),
  });

  if (options.storybook) {
    await AngularStorybookGenerator(tree, options);
  }
}

export async function reactLibraryGenerator(tree: Tree, options: LibraryGeneratorOptions) {
  console.log('library generator for react is disabled.');
  //
  // const reactSchema: ReactSchema = {
  //   name: options.name,
  //   directory: options.directory,
  //   buildable: true,
  //   publishable: true,
  //   importPath: getNxImportPath(options),
  //   tags: getNxTags(options),
  //   linter: Linter.None,
  //   unitTestRunner: UnitTestRunner.None,
  //   style: 'scss',
  // };
  //
  // const libPath = `${reactSchema.directory}/${reactSchema.name}`;
  // const eslintPath = `tools/eslint`;
  // const relativePathToEslint = path.relative(libPath, eslintPath);
  // const relativePathToEslintrc = path.relative(libPath, '');
  //
  // await rjsLibraryGenerator(tree, reactSchema);
  // generateFiles(tree, path.join(__dirname, 'templates', 'react'), path.join(libPath), {
  //   baseEslintDir: relativePathToEslint,
  //   eslintrcDir: relativePathToEslintrc,
  // });
}

export async function webLibraryGenerator(tree: Tree, options: LibraryGeneratorOptions) {
  console.log('library generator for web is not implemented.');
}
export async function sharedLibraryGenerator(tree: Tree, options: LibraryGeneratorOptions) {
  console.log('library generator for shared is not implemented.');
}

export async function AngularStorybookGenerator(tree: Tree, options: LibraryGeneratorOptions) {
  const libPath = `${options.directory}/${options.name}`;
  const storybookPath = `${libPath}/.storybook`;

  generateFiles(tree, path.join(__dirname, 'templates', 'angular', 'storybook'), path.join(libPath), {
    storybookOffsetFromRoot: `${offsetFromRoot(storybookPath)}`,
    libraryRelativeName: getLibraryRelativeName(options),
  });
}

function getNxTags(options: LibraryGeneratorOptions) {
  return `type:${options.type}, framework:${options.framework}`;
}

function getNxImportPath(options: LibraryGeneratorOptions) {
  return `@coco-kits/${getLibraryRelativeName(options)}`;
}

function getLibraryRelativeName(options: LibraryGeneratorOptions) {
  switch (options.type) {
    case LibraryType.Ui:
      return `${options.framework}-${options.fileName}`;
    case LibraryType.Util:
      if (options.framework === LibraryFramework.Shared) {
        return `utils-${options.fileName}`;
      } else {
        return `${options.framework}-utils-${options.fileName}`;
      }
  }
}
