import { moduleMetadata } from '@storybook/angular';

import { AngularStoryObj } from '@cocokits/internal-model';
import { renderWithPageTab } from '@cocokits/storybook-addon-theme';

import { CheckboxIndeterminateComponent } from './components/checkbox-indeterminate/checkbox-indeterminate.component';
import { CheckboxComponent } from '../../src/lib/checkbox/checkbox.component';

export const Indeterminate: AngularStoryObj<CheckboxComponent> = {
  name: 'Indeterminate',
  decorators: [
    moduleMetadata({
      imports: [CheckboxIndeterminateComponent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Whether the checkbox is indeterminate. This is also known as "mixed" mode and can be used to represent a checkbox with three states, e.g. a checkbox that represents a nested list of checkable items. Note that whenever checkbox is manually clicked, indeterminate is immediately set to false.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
            <cck-checkbox
              [checked]="task().completed"
              [indeterminate]="partiallyComplete()"
              (change)="update($event.checked)">
              {{task().name}}
            </cck-checkbox>

            <ul>
              @for (subtask of task().subtasks; track subtask; let i = $index) {
                <li>
                  <cck-checkbox [checked]="subtask.completed" (change)="update($event.checked, i)">
                    {{subtask.name}}
                  </cck-checkbox>
                </li>
              }
            </ul>
          `,
        },
        {
          filename: 'example.component.scss',
          language: 'scss',
          code: `
            :host {
              display: flex;
              flex-direction: column;
            }

            ul {
              list-style-type: none;
              padding-left: 24px;
              margin-bottom: 0;
            }

            li:last-of-type {
              margin-bottom: 0;
            }
          `,
        },
        {
          filename: 'example.component.ts',
          language: 'angular-ts',
          code: `
            import { Component, computed, signal } from '@angular/core';
            
            import { CheckboxComponent } from '@cocokits/angular-components';
import { moduleMetadata } from '@storybook/angular';
            
            interface Task {
              name: string;
              completed: boolean;
              subtasks?: Task[];
            }
            
            @Component({
              standalone: true,
              imports: [CheckboxComponent],
              selector: 'app-example',
              templateUrl: './checkbox-indeterminate.component.html',
              styleUrls: ['./checkbox-indeterminate.component.scss'],
            })
            export class ExampleComponent {
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
            
          `,
        },
      ],
    },
  },
  render: (args: any) => ({
    props: {
      ...args,
    },
    template: `
        <story-checkbox-indeterminate></story-checkbox-indeterminate>
    `,
  }),
};
