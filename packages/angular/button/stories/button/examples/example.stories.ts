import { AddonParametersSource, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

import { ButtonComponent } from '../../../src/lib/button/button.component';

const SOURCE: AddonParametersSource[] = [
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
];

export const Example1: StoryObj<ButtonComponent> = {
  name: 'Example 1',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 1</button>
    `,
  }),
};

export const Example2: StoryObj<ButtonComponent> = {
  name: 'Example 2',
  parameters: {
    docs: {
      description: {
        story:
          'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 2</button>
    `,
  }),
};

export const Example3: StoryObj<ButtonComponent> = {
  name: 'Example 3',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 3</button>
    `,
  }),
};

export const Example4: StoryObj<ButtonComponent> = {
  name: 'Example 4',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 4</button>
    `,
  }),
};

export const Example5: StoryObj<ButtonComponent> = {
  name: 'Example 5',
  parameters: {
    docs: {
      description: {
        story:
          'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 5</button>
    `,
  }),
};

export const Example6: StoryObj<ButtonComponent> = {
  name: 'Example 6',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 6</button>
    `,
  }),
};

export const Example7: StoryObj<ButtonComponent> = {
  name: 'Example 7',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 7</button>
    `,
  }),
};

export const Example8: StoryObj<ButtonComponent> = {
  name: 'Example 8',
  parameters: {
    docs: {
      description: {
        story:
          'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 8</button>
    `,
  }),
};

export const Example9: StoryObj<ButtonComponent> = {
  name: 'Example 9',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 9</button>
    `,
  }),
};

export const Example10: StoryObj<ButtonComponent> = {
  name: 'Example 10',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 10</button>
    `,
  }),
};

export const Example11: StoryObj<ButtonComponent> = {
  name: 'Example 11',
  parameters: {
    docs: {
      description: {
        story:
          'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 11</button>
    `,
  }),
};

export const Example12: StoryObj<ButtonComponent> = {
  name: 'Example 12',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 12</button>
    `,
  }),
};

export const Example13: StoryObj<ButtonComponent> = {
  name: 'Example 13',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 13</button>
    `,
  }),
};

export const Example14: StoryObj<ButtonComponent> = {
  name: 'Example 14',
  parameters: {
    docs: {
      description: {
        story:
          'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 14</button>
    `,
  }),
};

export const Example15: StoryObj<ButtonComponent> = {
  name: 'Example 15',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 15</button>
    `,
  }),
};

export const Example16: StoryObj<ButtonComponent> = {
  name: 'Example 16',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 16</button>
    `,
  }),
};

export const Example17: StoryObj<ButtonComponent> = {
  name: 'Example 17',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 17</button>
    `,
  }),
};

export const Example18: StoryObj<ButtonComponent> = {
  name: 'Example 18',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 18</button>
    `,
  }),
};

export const Example19: StoryObj<ButtonComponent> = {
  name: 'Example 19',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 19</button>
    `,
  }),
};

export const Example20: StoryObj<ButtonComponent> = {
  name: 'Example 20',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 20</button>
    `,
  }),
};

export const Example21: StoryObj<ButtonComponent> = {
  name: 'Example 21',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 21</button>
    `,
  }),
};

export const Example22: StoryObj<ButtonComponent> = {
  name: 'Example 22',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 22</button>
    `,
  }),
};
export const Example23: StoryObj<ButtonComponent> = {
  name: 'Example 23',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 23</button>
    `,
  }),
};

export const Example24: StoryObj<ButtonComponent> = {
  name: 'Example 24',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 24</button>
    `,
  }),
};

export const Example25: StoryObj<ButtonComponent> = {
  name: 'Example 25',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 25</button>
    `,
  }),
};

export const Example26: StoryObj<ButtonComponent> = {
  name: 'Example 26',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 26</button>
    `,
  }),
};

export const Example27: StoryObj<ButtonComponent> = {
  name: 'Example 27',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 27</button>
    `,
  }),
};

export const Example28: StoryObj<ButtonComponent> = {
  name: 'Example 28',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 28</button>
    `,
  }),
};

export const Example29: StoryObj<ButtonComponent> = {
  name: 'Example 29',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 29</button>
    `,
  }),
};

export const Example30: StoryObj<ButtonComponent> = {
  name: 'Example 30',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 30</button>
    `,
  }),
};

export const Example31: StoryObj<ButtonComponent> = {
  name: 'Example 31',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 31</button>
    `,
  }),
};

export const Example32: StoryObj<ButtonComponent> = {
  name: 'Example 32',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 32</button>
    `,
  }),
};

export const Example33: StoryObj<ButtonComponent> = {
  name: 'Example 33',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 33</button>
    `,
  }),
};

export const Example34: StoryObj<ButtonComponent> = {
  name: 'Example 34',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 34</button>
    `,
  }),
};

export const Example35: StoryObj<ButtonComponent> = {
  name: 'Example 35',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 35</button>
    `,
  }),
};

export const Example36: StoryObj<ButtonComponent> = {
  name: 'Example 36',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 36</button>
    `,
  }),
};

export const Example37: StoryObj<ButtonComponent> = {
  name: 'Example 37',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 37</button>
    `,
  }),
};

export const Example38: StoryObj<ButtonComponent> = {
  name: 'Example 38',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 38</button>
    `,
  }),
};

export const Example39: StoryObj<ButtonComponent> = {
  name: 'Example 39',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 39</button>
    `,
  }),
};

export const Example40: StoryObj<ButtonComponent> = {
  name: 'Example 40',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 40</button>
    `,
  }),
};

export const Example41: StoryObj<ButtonComponent> = {
  name: 'Example 41',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 41</button>
    `,
  }),
};
export const Example42: StoryObj<ButtonComponent> = {
  name: 'Example 42',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 42</button>
    `,
  }),
};

export const Example43: StoryObj<ButtonComponent> = {
  name: 'Example 43',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 43</button>
    `,
  }),
};

export const Example44: StoryObj<ButtonComponent> = {
  name: 'Example 44',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 44</button>
    `,
  }),
};

export const Example45: StoryObj<ButtonComponent> = {
  name: 'Example 45',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 45</button>
    `,
  }),
};

export const Example46: StoryObj<ButtonComponent> = {
  name: 'Example 46',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 46</button>
    `,
  }),
};

export const Example47: StoryObj<ButtonComponent> = {
  name: 'Example 47',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 47</button>
    `,
  }),
};

export const Example48: StoryObj<ButtonComponent> = {
  name: 'Example 48',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 48</button>
    `,
  }),
};

export const Example49: StoryObj<ButtonComponent> = {
  name: 'Example 49',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 49</button>
    `,
  }),
};

export const Example50: StoryObj<ButtonComponent> = {
  name: 'Example 50',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 50</button>
    `,
  }),
};

export const Example51: StoryObj<ButtonComponent> = {
  name: 'Example 51',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 51</button>
    `,
  }),
};

export const Example52: StoryObj<ButtonComponent> = {
  name: 'Example 52',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 52</button>
    `,
  }),
};

export const Example53: StoryObj<ButtonComponent> = {
  name: 'Example 53',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 53</button>
    `,
  }),
};

export const Example54: StoryObj<ButtonComponent> = {
  name: 'Example 54',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 54</button>
    `,
  }),
};

export const Example55: StoryObj<ButtonComponent> = {
  name: 'Example 55',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 55</button>
    `,
  }),
};

export const Example56: StoryObj<ButtonComponent> = {
  name: 'Example 56',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 56</button>
    `,
  }),
};

export const Example57: StoryObj<ButtonComponent> = {
  name: 'Example 57',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 57</button>
    `,
  }),
};

export const Example58: StoryObj<ButtonComponent> = {
  name: 'Example 58',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 58</button>
    `,
  }),
};

export const Example59: StoryObj<ButtonComponent> = {
  name: 'Example 59',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 59</button>
    `,
  }),
};

export const Example60: StoryObj<ButtonComponent> = {
  name: 'Example 60',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 60</button>
    `,
  }),
};

export const Example61: StoryObj<ButtonComponent> = {
  name: 'Example 61',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 61</button>
    `,
  }),
};
export const Example62: StoryObj<ButtonComponent> = {
  name: 'Example 62',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 62</button>
    `,
  }),
};

export const Example63: StoryObj<ButtonComponent> = {
  name: 'Example 63',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 63</button>
    `,
  }),
};

export const Example64: StoryObj<ButtonComponent> = {
  name: 'Example 64',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 64</button>
    `,
  }),
};

export const Example65: StoryObj<ButtonComponent> = {
  name: 'Example 65',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 65</button>
    `,
  }),
};

export const Example66: StoryObj<ButtonComponent> = {
  name: 'Example 66',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 66</button>
    `,
  }),
};

export const Example67: StoryObj<ButtonComponent> = {
  name: 'Example 67',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 67</button>
    `,
  }),
};

export const Example68: StoryObj<ButtonComponent> = {
  name: 'Example 68',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 68</button>
    `,
  }),
};

export const Example69: StoryObj<ButtonComponent> = {
  name: 'Example 69',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 69</button>
    `,
  }),
};

export const Example70: StoryObj<ButtonComponent> = {
  name: 'Example 70',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 70</button>
    `,
  }),
};

export const Example71: StoryObj<ButtonComponent> = {
  name: 'Example 71',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 71</button>
    `,
  }),
};

export const Example72: StoryObj<ButtonComponent> = {
  name: 'Example 72',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 72</button>
    `,
  }),
};

export const Example73: StoryObj<ButtonComponent> = {
  name: 'Example 73',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 73</button>
    `,
  }),
};

export const Example74: StoryObj<ButtonComponent> = {
  name: 'Example 74',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 74</button>
    `,
  }),
};

export const Example75: StoryObj<ButtonComponent> = {
  name: 'Example 75',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 75</button>
    `,
  }),
};

export const Example76: StoryObj<ButtonComponent> = {
  name: 'Example 76',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 76</button>
    `,
  }),
};

export const Example77: StoryObj<ButtonComponent> = {
  name: 'Example 77',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 77</button>
    `,
  }),
};

export const Example78: StoryObj<ButtonComponent> = {
  name: 'Example 78',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 78</button>
    `,
  }),
};

export const Example79: StoryObj<ButtonComponent> = {
  name: 'Example 79',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 79</button>
    `,
  }),
};

export const Example80: StoryObj<ButtonComponent> = {
  name: 'Example 80',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <button cck-button>Example 80</button>
    `,
  }),
};
