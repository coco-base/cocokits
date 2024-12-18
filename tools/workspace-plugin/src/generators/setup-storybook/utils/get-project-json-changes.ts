import { SetupStorybookOption } from '../model';

export function getAngularProjectJsonChanges(options: SetupStorybookOption) {
  return {
    targets: {
      storybook: {
        options: {
          styles: ['tools/scripts/storybook/themes.scss', 'tools/scripts/storybook/storybook-global.scss'],
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
          styles: ['tools/scripts/storybook/themes.scss', 'tools/scripts/storybook/storybook-global.scss'],
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
