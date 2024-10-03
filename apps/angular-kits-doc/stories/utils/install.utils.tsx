import { CckThemeChangedEvent } from '../../../../packages/internal/storybook-theme-switcher/src';
import { camelCase } from 'lodash';
import { backtick, code } from './markdown.util';

export const tocItems = [
  {"id":"step-1-install-packages","name":"Step 1"},
  {"id":"step-2-provide-theme-configuration","name":"Step 2"},
  {"id":"step-3-add-component-styles","name":"Step 3"},
  {"id":"step-4-apply-theme-modes","name":"Step 4"},
  {"id":"step-5-basic-usage-of-components","name":"Step 5"},
  {"id":"step-6-use-tokens-in-your-component-styles","name":"Step 6"},
];


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

export function getStep4IndexHtmlCssSelector(theme: CckThemeChangedEvent) {
  const selectors = Object.entries(theme.selectedModes)
    .map(([collection, mode]) => `cck-theme-${theme.id}__${collection}--${mode}`)
    .join(' ');

  const html = `html
<html class="${selectors}">
...
</html>
  `;

  return code(html);
}

export function getStep4IndexHtmlAttrSelector(theme: CckThemeChangedEvent) {
  const selectors = Object.entries(theme.selectedModes)
    .map(([collection, mode]) => `${theme.id}__${collection}--${mode}`)
    .join(' ');

  const html = `html
<html data-cck-theme="${selectors}">
...
</html>
  `;

  return code(html);
}

export function getStep4IndexHtmlSelectorExample(theme: CckThemeChangedEvent) {

  const collection = theme.id === 'frame-x' ? 'sizing' : 'brand-color-1';
  const firstMode = theme.selectedModes[collection];

  return `
For example, to set the ${backtick(firstMode)} mode from ${backtick(collection)}:
  - **Collection Name:** ${backtick(collection)}
  - **Mode Name:** ${backtick(firstMode)}
  - **CSS Class:** ${backtick(`cck-theme-${theme.id}__${collection}--${firstMode}`)}
    `;
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

  return table;
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

  return code(tsCodes);
}

export function getStep6Token(theme: CckThemeChangedEvent) {
  const tsCodes = `scss
@use "@cocokits/theme-${theme.id}/tokens" as Tokens;

:host {
    display: block;
    background-color: Tokens.$YOUR_TOKEN_NAME; // Replace YOUR_TOKEN_NAME with your token name
}
`

  return code(tsCodes);
}