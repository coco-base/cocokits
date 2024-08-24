import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';

import { injectFormFieldStore } from '../form-field.store';

let NEXT_ID = 1;

@Component({
  standalone: true,
  imports: [],
  selector: 'cck-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classNames().host',
  },
})
export class ErrorComponent extends _UiBaseComponent<'error'> implements OnInit, OnDestroy {
  protected readonly componentName = 'error';
  protected extraHostElementClassConditions = computed(() => []);

  protected store = injectFormFieldStore();

  private readonly id = `${this.componentName}-${NEXT_ID++}`;

  /**
   * Force to show the error, event the formFiled is don't consider the field with error.
   */
  public force: InputSignal<boolean> = input(false);

  ngOnInit() {
    this.store.error.components.update((components) => [...components, { id: this.id, force: this.force }]);
  }

  ngOnDestroy() {
    this.store.error.components.update((components) => components.filter((component) => component.id !== this.id));
  }
}
