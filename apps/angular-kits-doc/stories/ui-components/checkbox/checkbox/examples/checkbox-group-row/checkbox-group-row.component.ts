import { Component, input } from '@angular/core';

import { CheckboxComponent } from '@cocokits/angular-components';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/checkbox/checkbox-group-row.config';

@Component({
  standalone: true,
  selector: 'cck-checkbox-group-row',
  imports: [CheckboxComponent],
  template: `
    <div class="checkbox-group-row-wrapper">
      <span class="label">Favorite food</span>
      <div class="checkbox-group-row">
        <cck-checkbox [size]="cckExampleArgs().size" [value]="1">Pizza</cck-checkbox>
        <cck-checkbox [size]="cckExampleArgs().size" [value]="2">Pasta</cck-checkbox>
        <cck-checkbox [size]="cckExampleArgs().size" [value]="3">Fruits</cck-checkbox>
      </div>
    </div>
  `,
  styles: `
    .checkbox-group-row-wrapper {
      display: flex;
      flex-direction: column;
    }

    .label {
      color: var(--checkbox-group-column-color);
      font-style: italic;
    }

    .checkbox-group-row {
      display: flex;
      flex-direction: row;
      gap: 12px;
      margin-top: 10px;
    }
  `,
})
export class CheckboxGroupRowComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
}
