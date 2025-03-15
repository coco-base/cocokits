import { Component, input } from '@angular/core';

import { CheckboxComponent } from '@cocokits/angular-checkbox';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/checkbox/checkbox-label-through.config';

@Component({
  standalone: true,
  selector: 'cck-checkbox-label-through',
  imports: [CheckboxComponent],
  template: ` <cck-checkbox size="md" value="YOUR_VALUE" class="StrikedLabel"> Checkbox Label </cck-checkbox> `,
  styles: `
    .StrikedLabel {
      text-decoration: line-through;
      color: white;
    }
  `,
})
export class CheckboxLabelThroughComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
}
