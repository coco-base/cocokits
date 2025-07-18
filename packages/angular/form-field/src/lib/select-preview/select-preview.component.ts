import { ChangeDetectionStrategy, Component, computed, ViewEncapsulation } from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';

@Component({
  imports: [],
  selector: 'cck-select-preview',
  templateUrl: './select-preview.component.html',
  styleUrls: ['./select-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassNames()',
  },
})
export class SelectPreviewComponent extends _UiBaseComponent<'selectPreview'> {
  protected readonly componentName = 'selectPreview';
  protected extraHostElementClassConditions = computed(() => []);
}
