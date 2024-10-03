import { CckThemeChangedEvent } from '../../../../packages/internal/storybook-theme-switcher/src';
import { camelCase } from 'lodash';
import { backtick, code, header } from './markdown.util';

export const tocItems = [
  {"id":"step-1","name":"Step 1"},
  {"id":"step-2","name":"Step 2"},
  {"id":"step-3","name":"Step 3"},
  {"id":"step-4","name":"Step 4"},
  {"id":"step-5","name":"Step 5"},
  {"id":"step-6","name":"Step 6"},
];


export function getStep1Description(theme: CckThemeChangedEvent) {
  return `Install the ${backtick('CocoKits')} Angular components and the ${backtick(theme.name)} theme:

`;
}

export function getStep2Description(theme: CckThemeChangedEvent) {
  return `Provide the ${backtick(theme.name)} theme configuration in the root of your application.`;
}

export function getStep3Description() {
  return 'Add the component styles to your `angular.json` or `project.json` file';
}

export function getStep4Description() {
  return [
    'To ensure that your application uses the correct styles, you need to include at least one mode for each collection in the theme. This can be done by adding CSS classes to the `<html>` tag in your index.html file.',
    'You can choose different modes for each collection based on your preferences.'
  ].join('\n')
}

export function getStep5Description() {
  return ``;
}

export function getStep6Description() {
  return `You can use theme tokens in your component styles to maintain consistency across your application.`;
}


export function getStep2StandaloneApp(theme: CckThemeChangedEvent) {
  const tsCodes = `typescript

import { provideCocokits } from '@cocokits/angular-components';
import { ${camelCase(theme.id)}UIComponentConfig } from '@cocokits/theme-${theme.id}';

bootstrapApplication(AppComponent, {
  providers: [
    provideCocokits(${camelCase(theme.id)}UIComponentConfig),
    ...
  ]
})`

  return code(tsCodes);
}

export function getStep2ModuleApp(theme: CckThemeChangedEvent) {
  const tsCodes = `typescript

  import { UIComponentConfig } from '@cocokits/angular-components';
  import { ${camelCase(theme.id)}UIComponentConfig } from '@cocokits/theme-${theme.id}';

  @NgModule({
    imports: [...],
    declarations: [...],
    providers: [
      {
        provide: UIComponentConfig,
        useValue: ${camelCase(theme.id)}UIComponentConfig
      },
      ...
    ]
    ...
  })
  export class AppModule {}`

  return code(tsCodes);
}

export function getStep3AngularJson(theme: CckThemeChangedEvent) {
  const tsCodes = `json
 {
  ...
  "styles": [
    ...,
    "@cocokits/theme-${theme.id}/styles.min.css",
    "@cocokits/theme-${theme.id}/tokens.min.css"
  ],
  ...
}`

  return code(tsCodes);
}

export function getStep4IndexHtml(theme: CckThemeChangedEvent) {
  const selectors = Object.entries(theme.selectedModes)
    .map(([collection, mode]) => `${theme.id}__${collection}--${mode}`)

  const classSelectorCode = `html
<html class="${selectors.map(selector => `cck-theme-${selector}`).join(' ')}">
...
</html>
  `;

  const attrSelectorCode = `html
<html data-cck-theme="${selectors.join(' ')}">
...
</html>
  `;

  const firstCollection = theme.tokenDictionary.collectionNames[1] ?? theme.tokenDictionary.collectionNames[0];
  const firstMode = theme.selectedModes[firstCollection.name];

  return [
    code(classSelectorCode),
    'Alternatively, you can use the data-cck-theme attribute:',
    code(attrSelectorCode),
    '**Note:** You must include at least one mode for each collection to ensure all styles are properly applied in your app. Otherwise, some tokens may not be defined.',
    header(3, 'Collection and Mode Naming Convention'),
    'We use the following naming convention for collections and modes:',
    code('cck-theme-[THEME_NAME]__[COLLECTION_NAME]--[MODE_NAME]', false),
    `For example, to set the sizing mode to ${backtick(firstMode)} in the ${backtick(theme.name)} theme:`,
    `- **Collection Name:** ${backtick(firstCollection.name)}`,
    `- **Mode Name:** ${backtick(firstMode)}`,
    `- **CSS Class:** ${backtick(`cck-theme-${theme.id}__${firstCollection.name}--${firstMode}`)}`,
  ];
}

export function getStep4CollectionModesTable(theme: CckThemeChangedEvent) {

  const table = (
    <table className='collection-modes-selector-table'>
      <tbody>
        <tr>
          <th>Collection Name</th>
          <th>Mode Names</th>
          <th>Selectors</th>
        </tr>

        {
          Object.entries(theme.tokenDictionary.collectionModeNames)
            .map(([collection, modes]) => modes.map((mode, index) => (
              <tr>
                {
                  index === 0 &&
                  <td rowSpan={modes.length} className="collection-modes-selector-table__header-cell">{collection}</td>
                }
                <td>{mode.name}</td>
                <td>
                  <ul>
                    <li><code>.cck-theme-{theme.id}__{collection}--{mode.name}</code></li>
                    <li><code>[data-cck-theme*='{theme.id}__{collection}--{mode.name}']</code></li>
                  </ul>
                </td>
              </tr>
            )))
        }
      </tbody>
    </table>
  )

  return [
    header(3, 'Available Collections and Modes'),
    `Here is a list of all collections, modes, and their corresponding CSS selectors for the ${theme.name} design system:`,
    table,
    `**Note:** Adjust the collections and modes based on the actual theme options available.`
  ]
}

export function getStep5HelloComponent() {
  const tsCodes = `typescript
  
import { Component } from '@angular/core';
import { ButtonComponent, CheckboxComponent } from '@cocokits/angular-components';

@Component({
    selector: 'hello',
    standalone: true,
    imports: [ButtonComponent, CheckboxComponent],
    template: \`
      <button cck-button>Button</button>
      <cck-checkbox>This is a Checkbox</cck-checkbox>
    \`
})
export class HelloComponent {}
`

  return [
    code(tsCodes),
    'For more examples and configuration options, check the documentation page of each component.'
  ];
}

export function getStep6Token(theme: CckThemeChangedEvent) {
  const tsCodes = `scss
@use "@cocokits/theme-${theme.id}/tokens" as Tokens;

:host {
    display: block;
    background-color: Tokens.$YOUR_TOKEN_NAME; // Replace YOUR_TOKEN_NAME with your token name
}
`

  return [
    code(tsCodes),
    '**Note:** Replace `YOUR_TOKEN_NAME` with the desired token name.',
    'You can find all tokens with their names and values in the `Theme Config / Tokens` page of the documentation.'
  ];
}