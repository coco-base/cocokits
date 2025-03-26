// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Wed Mar 26 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'angular-ts',
    filename: 'checkbox-group-column.component.ts',
    code: `
import { Component, input } from '@angular/core';

import { CheckboxComponent } from '@cocokits/angular-checkbox';


@Component({
  standalone: true,
  selector: 'cck-checkbox-group-column',
  imports: [CheckboxComponent],
  template: \`
         <div style="display: flex; flex-direction: column; gap: 12px;">
      <i style="color: var(--checkbox-group-column-color);">My hobbies</i>
      <cck-checkbox [size]="'<%=size%>'" [value]="1">Comic books</cck-checkbox>
      <cck-checkbox [size]="'<%=size%>'" [value]="1">Listen to music</cck-checkbox>
      <cck-checkbox [size]="'<%=size%>'" [value]="1">Travel the world</cck-checkbox>
      <cck-checkbox [size]="'<%=size%>'" [value]="1">Watch movies</cck-checkbox>
    </div>
    \`,
  styles: \`\`,
})
export class CheckboxGroupColumnComponent {

}
`,
  },
  {
    language: 'scss',
    filename: 'global.scss',
    code: `
      :root {--checkbox-group-column-color: var(--color-palette-gray-800);
      }`,
    visibleConditions: [(theme) => theme.id === ThemeId.CocoKits],
  },
  {
    language: 'scss',
    filename: 'global.scss',
    code: `
      :root {--checkbox-group-column-color: var(--colors-gray-300);
      }`,
    visibleConditions: [(theme) => theme.id === ThemeId.FramesX],
  },
];
