import { Component, input } from '@angular/core';

import {
  FormFieldComponent,
  LabelComponent,
  OptionComponent,
  SelectComponent,
  SelectPreviewComponent,
} from '@cocokits/angular-components';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/select-preview-tag.config';

@Component({
  selector: 'cck-select-preview-tag',
  imports: [OptionComponent, FormFieldComponent, LabelComponent, SelectComponent, SelectPreviewComponent],
  template: `
    <cck-form-field>
      <cck-label>Favorite food</cck-label>
      <cck-select #select class="select" [multiple]="true" [value]="['Cake', 'Pizza']" appendTo="body">
        <cck-select-preview class="preview">
          <div class="tag">{{ select.selected().length }}</div>
          <span>{{ select.selected()[0] }}</span>
          @if (select.selected().length > 1) {
            <span class="hint">(+{{ select.selected().length - 1 }} more)</span>
          }
        </cck-select-preview>

        <cck-option value="Cake">Cake</cck-option>
        <cck-option value="Pizza">Pizza</cck-option>
        <cck-option value="Burger">Burger</cck-option>
        <cck-option value="Steak">Steak</cck-option>
      </cck-select>
    </cck-form-field>
  `,
  styles: `
    .select {
      min-width: 190px;
    }

    .preview {
      display: flex;
      gap: 8px;
    }

    .tag {
      border-radius: 50%;
      border: 1px solid var(--tag-border);
      pad: 2px;
      width: 24px;
      height: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: var(--tag-bg);
      font: var(--tag-font);
      color: var(--tag-color);
    }

    .hint {
      color: var(--hint-color);
    }
  `,
})
export class SelectPreviewTagComponent {
  public cckExampleArgs = input.required<ExampleArgs>();
}
