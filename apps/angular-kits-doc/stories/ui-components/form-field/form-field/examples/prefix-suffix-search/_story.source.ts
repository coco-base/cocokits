// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Wed Feb 26 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'angular-ts',
    filename: 'prefix-suffix-search.component.ts',
    code: `
import { Component, input } from '@angular/core';

import { FormFieldComponent, InputComponent, PrefixComponent, SuffixComponent, SvgIconComponent } from '@cocokits/angular-components';
import { Icons } from '@cocokits/common-icons';


@Component({
  standalone: true,
  selector: 'cck-prefix-suffix-search',
  imports: [FormFieldComponent, InputComponent, PrefixComponent, SuffixComponent, SvgIconComponent],
  template: \`
    <cck-form-field>
      <input cck-input placeholder="Search ..." />
      <cck-prefix>
        <cck-svg-icon [size]="'<%=iconSize%>'" [icon]="Icons.search"></cck-svg-icon>
      </cck-prefix>
      <cck-suffix>
        <cck-svg-icon [size]="'<%=iconSize%>'" [icon]="Icons.mic"></cck-svg-icon>
      </cck-suffix>
    </cck-form-field>
  \`,
  styles: \`\`,
})
export class PrefixSuffixSearchComponent {

  protected readonly Icons = Icons;
}
`,
  },
];
