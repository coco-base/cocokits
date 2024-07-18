import { Component, computed, signal } from '@angular/core';

import { CheckboxComponent } from '../../../../src/lib/checkbox/checkbox.component';

interface Task {
  name: string;
  completed: boolean;
  subtasks?: Task[];
}

@Component({
  standalone: true,
  imports: [CheckboxComponent],
  selector: 'story-checkbox-indeterminate',
  templateUrl: './checkbox-indeterminate.component.html',
  styleUrls: ['./checkbox-indeterminate.component.scss'],
})
export class CheckboxIndeterminateComponent {
  readonly task = signal<Task>({
    name: 'Parent task',
    completed: false,
    subtasks: [
      { name: 'Child task 1', completed: true },
      { name: 'Child task 2', completed: false },
      { name: 'Child task 3', completed: false },
    ],
  });

  readonly partiallyComplete = computed(() => {
    const task = this.task();
    if (!task.subtasks) {
      return false;
    }
    return task.subtasks.some((t) => t.completed) && !task.subtasks.every((t) => t.completed);
  });

  update(completed: boolean, index?: number) {
    this.task.update((task) => {
      if (index === undefined) {
        task.completed = completed;
        task.subtasks?.forEach((t) => (t.completed = completed));
      } else if (task.subtasks) {
        task.subtasks[index].completed = completed;
        task.completed = task.subtasks?.every((t) => t.completed) ?? true;
      }
      return { ...task };
    });
  }
}
