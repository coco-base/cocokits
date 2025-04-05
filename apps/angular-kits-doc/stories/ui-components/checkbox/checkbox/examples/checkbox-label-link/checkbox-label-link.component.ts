import { Component, input } from '@angular/core';

import { CheckboxComponent } from '@cocokits/angular-checkbox';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/checkbox/checkbox-label-link.config';

@Component({
  standalone: true,
  selector: 'cck-checkbox-label-link',
  imports: [CheckboxComponent],
  template: `
    <cck-checkbox
      >I accept the
      <a href="https://cocokits.com" target="_blank" rel="noopener noreferrer">Privacy Policy</a></cck-checkbox
    >
  `,
  styles: ``,
})
export class CheckboxLabelLinkComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
}
