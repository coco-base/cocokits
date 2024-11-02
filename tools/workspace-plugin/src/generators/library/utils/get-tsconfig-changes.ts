import { LibraryGeneratorOptions } from '../model';

export function getTsconfigJsonChanges(options: LibraryGeneratorOptions) {
  return {
    compilerOptions: {
      paths: {
        [`${options.importPath}`]: [`${options.libraryRoot}/src/index.ts`],
      },
    },
  };
}

export function getTsconfigStorybookManagerJsonChanges(options: LibraryGeneratorOptions) {
  return {
    compilerOptions: {
      paths: {
        [`${options.importPath}`]: [
          `${options.libraryRoot}/src/`,
          `../${options.libraryRoot}/src/`,
          `../../${options.libraryRoot}/src/`,
          `../../../${options.libraryRoot}/src/`,
        ],
      },
    },
  };
}
