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

@Component({
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

  /**
   * Force to show the error, event the reactive form is valid or there is no reactive form.
   * By default the error component will only show when the reactive form is invalid.
   */
  public force: InputSignal<boolean> = input(false);

  ngOnInit() {
    this.store.registerErrorComponent(this);
  }

  ngOnDestroy() {
    this.store.unregisterErrorComponent(this);
  }
}
