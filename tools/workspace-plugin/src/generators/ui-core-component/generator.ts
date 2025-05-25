import { formatFiles, Tree } from '@nx/devkit';

import { UiCoreComponentGeneratorSchema } from './schema';
import { generateClassNameFile } from './utils/class-name.util';
import { updateClassNamesMap } from './utils/class-names-map.util';
import { generateComponent } from './utils/generate-component';
import { generateLibrary } from './utils/generate-library';
import { updateGeneratorSchema } from './utils/generator-schema.util';
import { updateLayoutClassNamesConfig } from './utils/layout-class-names-config.util';
import { getOptions } from './utils/options.util';
import { generateStorybook } from './utils/storybook.util';
import { updateThemeAllStylesFile } from './utils/theme-all-style.util';
import { updateThemeConfigs } from './utils/theme-configs.util';
import { updateThemeIndexStylesFile } from './utils/theme-index-style.util';
import { generateThemeStyles } from './utils/theme-styles.util';
import { updateUiBaseComponentsNameFile } from './utils/ui-base-components-name.util';

export async function uiCoreComponentGenerator(tree: Tree, schema: UiCoreComponentGeneratorSchema) {
  const options = getOptions(tree, schema);

  // Core
  updateUiBaseComponentsNameFile(options);
  updateGeneratorSchema(options);
  generateClassNameFile(options);
  updateLayoutClassNamesConfig(options);
  updateClassNamesMap(options);

  // Theme
  updateThemeConfigs(options);
  generateThemeStyles(options);
  updateThemeAllStylesFile(options);
  updateThemeIndexStylesFile(options);

  if (options.newLibrary) {
    await generateLibrary(options);
  }

  await generateComponent(options);
  generateStorybook(options);

  await formatFiles(tree);
}

export default uiCoreComponentGenerator;
