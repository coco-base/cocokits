import { names, Tree } from '@nx/devkit';

import { errorMessages } from './errors';
import { UiCoreComponentGeneratorOptions } from '../model';
import { UiCoreComponentGeneratorSchema } from '../schema';

export function getOptions(tree: Tree, schema: UiCoreComponentGeneratorSchema): UiCoreComponentGeneratorOptions {
  if (schema.exitingLibraryName && schema.newLibraryName) {
    throw new Error(errorMessages.options.bothLibraryNamesProvided());
  }

  if (!schema.exitingLibraryName && !schema.newLibraryName) {
    throw new Error(errorMessages.options.noLibraryNameProvided());
  }

  const componentName = names(schema.name);
  const libraryNames = names(schema.exitingLibraryName || schema.newLibraryName);

  return {
    tree,
    componentName: componentName,
    libraryName: libraryNames,
    angularLibrary: {
      name: `@cocokits/angular-${libraryNames.fileName}`,
      libraryPath: `packages/angular/${libraryNames.fileName}`,
      componentPath: `packages/angular/${libraryNames.fileName}/src/lib/${componentName.fileName}`,
    },
    reactLibrary: {
      name: `@cocokits/react-${libraryNames.fileName}`,
      libraryPath: `packages/react/${libraryNames.fileName}`,
      componentPath: `packages/react/${libraryNames.fileName}/src/lib/${componentName.fileName}`,
    },
    newLibrary: !!schema.newLibraryName,

    // Files Core path
    uiBaseComponentsNameFilePath: `packages/common/core/src/lib/model/ui-base-components-name.ts`,
    generatorSchemaFilePath: `tools/workspace-plugin/src/generators/ui-core-component/schema.json`,
    classNamesFolderPath: `packages/common/core/src/lib/class-names`,
    layoutClassNamesConfigFilePath: `packages/common/core/src/lib/class-names/layout-class-names-config.ts`,
    classNameMapFilePath: 'packages/common/core/src/lib/class-names/class-names.ts',

    // Files Themes path
    cocokitsThemeConfigFilePath: 'packages/themes/cocokits/src/lib/theme-config.ts',
    cocokitsStylesFilePath: 'packages/themes/cocokits/src/styles/scss',
    cocokitsAllStylesFilePath: 'packages/themes/cocokits/src/styles/scss/_all.scss',
    cocokitsIndexStylesFilePath: 'packages/themes/cocokits/src/styles/scss/_index.scss',

    framesXThemeConfigFilePath: 'packages/themes/frames-x/src/lib/theme-config.ts',
    framesXStylesFilePath: 'packages/themes/frames-x/src/styles/scss',
    framesXAllStylesFilePath: 'packages/themes/frames-x/src/styles/scss/_all.scss',
    framesXIndexStylesFilePath: 'packages/themes/frames-x/src/styles/scss/_index.scss',

    angularComponentPackageJsonPath: 'packages/angular/components/package.json',
    reactComponentPackageJsonPath: 'packages/react/components/package.json',

    angularDocAdvanceConfigurationFilePath:
      'apps/angular-kits-doc/stories/getting-started/utils/advanced-configuration.utils.tsx',
    reactDocAdvanceConfigurationFilePath:
      'apps/react-kits-doc/stories/getting-started/utils/advanced-configuration.utils.tsx',

    angularStorybookFolderPath: 'apps/angular-kits-doc/stories/ui-components',
    reactStorybookFolderPath: 'apps/react-kits-doc/stories/ui-components',
  };
}
