import { SetupStorybookOption } from '../model';

export function getAngularProjectJsonChanges(options: SetupStorybookOption) {
  return {
    targets: {
      storybook: {
        options: {
          styles: [],
          compodoc: true,
          compodocArgs: [
            '-e',
            'json',
            '-d',
            `dist/compodoc/${options.libraryRoot}`,
            '--disableLifeCycleHooks',
            '--disableProtected',
            '--disablePrivate',
            '--disableInternal',
          ],
        },
      },
      'storybook-build': {
        executor: '@storybook/angular:build-storybook',
        outputs: ['{options.outputPath}'],
        options: {
          outputDir: `dist/storybook/${options.libraryRoot}`,
          configDir: `${options.libraryRoot}/.storybook`,
          browserTarget: `${options.libraryName}:build-storybook`,
          styles: [],
          compodoc: true,
          compodocArgs: [
            '-e',
            'json',
            '-d',
            `dist/compodoc/${options.libraryRoot}`,
            '--disableLifeCycleHooks',
            '--disableProtected',
            '--disablePrivate',
            '--disableInternal',
          ],
        },
      },
    },
  };
}
