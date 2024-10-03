import { CckThemeChangedEvent } from '../../../../packages/internal/storybook-theme-switcher/src';
import { camelCase } from 'lodash';
import { backtick, code } from './markdown.util';

export const tocItems = [
  {"id":"install-specific-components","name":"Install Specific Components"},
  {"id":"override-theme-ui-configurations","name":"Override Theme UI Configurations"},
  {"id":"merge-themes","name":"Merge Themes"},
  {"id":"use-only-one-mode-from-each-collection","name":"Use Only One Mode from Each Collection"},
  {"id":"change-token-selectors","name":"Change Token Selectors"}
];

// region ---------------- Install Specific Components ----------------
export function getInstallPackagesStep2Provide(theme: CckThemeChangedEvent) {
  const tsCodes = `typescript

import { provideCocokits } from '@cocokits/angular-core';
import { ${camelCase(theme.id)}UIComponentConfig } from '@cocokits/theme-${theme.id}';

bootstrapApplication(AppComponent, {
  providers: [
    provideCocokits(${camelCase(theme.id)}UIComponentConfig),
    ...
  ]
})`

  return code(tsCodes);
}

export function getInstallPackagesStep3AngularJson(theme: CckThemeChangedEvent) {
  const tsCodes = `json
 {
  ...
  "styles": [
    ...,
    "@cocokits/theme-${theme.id}/tokens.min.css"
  ],
  ...
}`

  return code(tsCodes);
}

export function getInstallPackagesStep3ComponentStyle(theme: CckThemeChangedEvent) {
  const ts = `scss
@use "@cocokits/theme-${theme.id}/styles-core" as ${theme.name};

@include ${theme.name}.components_button;
@include ${theme.name}.components_icon_button;
@include ${theme.name}.components_radio_button;
@include ${theme.name}.components_radio_group;
  `

  return code(ts);
}
// endregion

// region ---------------- Override Theme UI Configurations ----------------
export function getOverrideComponentConfig(theme: CckThemeChangedEvent) {
  const ts = `typescript
import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideCocokits,
  DeepPartial,
  ThemeUIComponentsConfig,
  deepMerge,
} from '@cocokits/angular-components';
import { ${camelCase(theme.id)}UIComponentConfig } from '@cocokits/theme-${theme.id}';

const customUIComponentConfig = deepMerge(${camelCase(theme.id)}UIComponentConfig, {
  button: {
    size: {
      default: 'xs',
    },
  },
} as DeepPartial<ThemeUIComponentsConfig>);

bootstrapApplication(AppComponent, {
  providers: [
    provideCocokits(customUIComponentConfig),
  ],
});
  `

  return code(ts);
}
// endregion


// region ---------------- Merge Themes ----------------
export function getMergeThemesStep2Provide() {
  const tsCodes = `typescript

import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideCocokits,
  DeepPartial,
  ThemeUIComponentsConfig,
  deepMerge,
} from '@cocokits/angular-components';
import { defaultUIComponentConfig } from '@cocokits/theme-default';
import { framesXUIComponentConfig } from '@cocokits/theme-frames-x';

const customUIComponentConfig = deepMerge(defaultUIComponentConfig, {
  button: framesXUIComponentConfig.button,
  iconButton: framesXUIComponentConfig.iconButton,
  radioGroup: framesXUIComponentConfig.radioGroup,
  radioButton: framesXUIComponentConfig.radioButton,
} as DeepPartial<ThemeUIComponentsConfig>);

bootstrapApplication(AppComponent, {
  providers: [
    provideCocokits(customUIComponentConfig)
  ],
});
`

  return code(tsCodes);
}

export function getMergeThemesStep3Scss() {
  return code(`scss
  
@use "@cocokits/theme-default/styles-core" as Default;
@use "@cocokits/theme-frames-x/styles-core" as FramesX;

// Import styles from Frames X theme
@include FramesX.components_button;
@include FramesX.components_icon_button;
@include FramesX.components_radio_button;
@include FramesX.components_radio_group;

// Import styles from Default theme
@include Default.components_checkbox;
@include Default.components_chip;
@include Default.components_chip_list;
@include Default.components_divider;
@include Default.components_error;
@include Default.components_form_field;
@include Default.components_hint;
@include Default.components_icon;
@include Default.components_input;
@include Default.components_label;
@include Default.components_leading;
@include Default.components_menu;
@include Default.components_menu_item;
@include Default.components_option;
@include Default.components_option_group;
@include Default.components_prefix;
@include Default.components_select;
@include Default.components_select_preview;
@include Default.components_suffix;
@include Default.components_textarea;
@include Default.components_toggle;
@include Default.components_trailing;

  
  `)
}
// endregion

// region ---------------- Use Only One Mode from Each Collection ----------------
export function getUseOnlyOneModeOption1Step1Code(theme: CckThemeChangedEvent) {

  const mixinNames = Object.entries(theme.selectedModes)
    .map(([collection, mode]) => `@include ${theme.name}.use_${collection}_${mode}`);

  const scss = `scss
@use "@cocokits/theme-${theme.id}/tokens-core" as ${theme.name};

${mixinNames.join('\n')}
  `;

  return code(scss);
}

export function getUseOnlyOneModeOption1Step2ClassSelector(theme: CckThemeChangedEvent) {
  const selectors = Object.entries(theme.selectedModes)
    .map(([collection, mode]) => `cck-theme-${theme.id}__${collection}--${mode}`)
    .join(' ');

  const classSelectorCode = `html
<html class="${selectors}">
...
</html>
  `;

  return code(classSelectorCode);
}

export function getUseOnlyOneModeOption1Step2AttrSelector(theme: CckThemeChangedEvent) {
  const selectors = Object.entries(theme.selectedModes)
    .map(([collection, mode]) => `${theme.id}__${collection}--${mode}`)
    .join(' ');

  const classSelectorCode = `html
<html data-cck-theme="${selectors}">
...
</html>
  `;

  return code(classSelectorCode);
}

export function getUseOnlyOneModeOption1code(theme: CckThemeChangedEvent) {
  const mixinNames = Object.entries(theme.selectedModes)
    .map(([collection, mode]) => `@include ${theme.name}.variables_${collection}_${mode}`);

  const scss = `scss
@use "@cocokits/theme-${theme.id}/tokens-core" as ${theme.name};

:root {
  ${mixinNames.join('\n  ')}
}
  `;

  return code(scss);
}
// endregion

// region ---------------- Change Token Selectors ----------------
export function getChangeTokenSelectorsItems(theme: CckThemeChangedEvent) {
  const lightFrom = theme.id === 'frames-x' ? '.cck-theme-frames-x__color-mode--light' : '.cck-theme-default__brand-color-1--light';
  const darkFrom = theme.id === 'frames-x' ? '.cck-theme-frames-x__color-mode--dark' : '.cck-theme-default__brand-color-1--dark';

  return `
- ${backtick(lightFrom)} -> ${backtick('.cck-theme-light')}
- ${backtick(darkFrom)} -> ${backtick('.cck-theme-dark')}
  `
}

export function getChangeTokenSelectorsStep1Code(theme: CckThemeChangedEvent) {
  const lightMixin = theme.id === 'frames-x' ? 'FramesX.variables_color_mode_light' : 'Default.cck-theme-default__brand-color-1--light';
  const darkMixin = theme.id === 'frames-x' ? 'FramesX.variables_color_mode_dark' : 'Default.cck-theme-default__brand-color-1--dark';

  const collectionNameWithLightAndDark = theme.id === 'frames-x' ? 'color-mode' : 'brand-color-1';

  const otherMixins = Object.entries(theme.selectedModes)
    .filter(([collection]) => collection !== collectionNameWithLightAndDark)
    .map(([collection, mode]) => `@include ${theme.name}.variables_${collection}_${mode}`);

  const scss = `scss
@use "@cocokits/theme-${theme.id}/tokens-core" as ${theme.name};

.cck-theme-light {
  @include ${lightMixin};
}

.cck-theme-dark {
  @include ${darkMixin};
}

:root {
  ${otherMixins.join('\n  ')}
}
  `;

  return code(scss);
}

export function getChangeTokenSelectorsStep2Code() {
  const html = `html
<html class="cck-theme-light">
  <!-- ... -->
</html>

<!-- Or switch to dark mode -->

<html class="cck-theme-dark">
  <!-- ... -->
</html>`

  return code(html);
}
// endregion



