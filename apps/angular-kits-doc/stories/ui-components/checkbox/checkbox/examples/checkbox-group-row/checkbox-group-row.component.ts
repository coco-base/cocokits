import { Component, input } from '@angular/core';

import { CheckboxComponent } from '@cocokits/angular-checkbox';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/checkbox/checkbox-group-row.config';

@Component({
  standalone: true,
  selector: 'cck-checkbox-group-row',
  imports: [CheckboxComponent],
  template: `
    <div>
      <i style="color: var(--checkbox-group-column-color);">Favorite food</i>
      <div style="display: flex; flex-direction: row; gap: 12px; marginTop: 10px;">
        <cck-checkbox [size]="cckExampleArgs().size" [value]="1">Pizza</cck-checkbox>
        <cck-checkbox [size]="cckExampleArgs().size" [value]="1">Pasta</cck-checkbox>
        <cck-checkbox [size]="cckExampleArgs().size" [value]="1">Fruits</cck-checkbox>
      </div>
    </div>
  `,
  styles: ``,
})
export class CheckboxGroupRowComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
}
