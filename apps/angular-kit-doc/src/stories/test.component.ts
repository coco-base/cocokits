import {
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  EventEmitter,
  inject,
  Input,
  input,
  output,
  Output,
  signal,
} from '@angular/core';

@Component({
  standalone: true,
  selector: 'cck-task',
  template: `
    <h3>{{ title() }}</h3>
    <div class="btn-wrapper">
      <button (click)="decrease()">-</button>
      <button (click)="increase()">+</button>
    </div>
    <div><b>Counter:</b>{{ counter() }}</div>
    <div>
      <b>{{ counter() }} * {{ ratio() }} = </b>{{ result() }}
    </div>
  `,
})
export default class TaskComponent {
  protected title = input('Counter Component Title', {
    transform: (title) => (typeof title !== 'string' || title.trim() === '' ? 'Counter Component Title' : title),
  });
  protected ratio = input(0.2);

  protected counter = signal(0, {});
  protected result = computed(() => this.counter() * this.ratio());

  public counterChanged = output<number>();

  constructor() {
    effect(() => {
      console.log('COMPONENT EFFECT', this.counter());
      this.counterChanged.emit(this.counter());
    });

    effect(() => {
      console.log('COMPONENT EFFECT - ratio', this.ratio());
    });
  }

  protected increase() {
    this.counter.update((counter) => counter + 1);
  }

  protected decrease() {
    this.counter.update((counter) => counter - 1);
  }
}
