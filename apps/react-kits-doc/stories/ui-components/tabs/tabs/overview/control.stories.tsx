import { useState } from 'react';

import { Tab, Tabs } from '@cocokits/react-tabs';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

function TabsControl({ type }: { type: string }) {
  const [selected, setSelected] = useState(1);
  return (
    <>
      <div className="cck-doc-story__radio-selection-group">
        <div
          className={`cck-doc-story__radio-selection ${selected === 1 ? 'cck-doc-story__radio-selection--selected' : ''}`}
          onClick={() => setSelected(1)}>
          1
        </div>
        <div
          className={`cck-doc-story__radio-selection ${selected === 2 ? 'cck-doc-story__radio-selection--selected' : ''}`}
          onClick={() => setSelected(2)}>
          2
        </div>
        <div
          className={`cck-doc-story__radio-selection ${selected === 3 ? 'cck-doc-story__radio-selection--selected' : ''}`}
          onClick={() => setSelected(3)}>
          3
        </div>
      </div>
      <hr style={{ width: '100%', margin: '0' }} />

      <Tabs type={type} selected={selected} onSelectionChange={(e) => setSelected(e.value)} hideContent={true}>
        <Tab header="Header 1" value={1} />
        <Tab header="Header 2" value={2} />
        <Tab header="Header 3" value={3} />
      </Tabs>
    </>
  );
}

export const Control: StoryObj<typeof Tabs> = {
  name: 'Control',
  parameters: {
    docs: {
      description: {
        story: 'Tabs can be controlled programmatically.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      singleControls: ['type'],
      controls: [CCK_CONTROL.type()],
      source: [
        {
          filename: 'example.tsx',
          language: 'tsx',
          code: `
          import { Tabs, Tab } from "@cocokits/react-components";

          export const MyComponent = () => {
            const [selected, setSelected] = useState(1);
            return (
              <>
                <div className="cck-doc-story__radio-selection-group">
                  <div
                    className={\`cck-doc-story__radio-selection \${selected === 1 ? 'cck-doc-story__radio-selection--selected' : ''}\`}
                    onClick={() => setSelected(1)}>
                    1
                  </div>
                  <div
                    className={\`cck-doc-story__radio-selection \${selected === 2 ? 'cck-doc-story__radio-selection--selected' : ''}\`}
                    onClick={() => setSelected(2)}>
                    2
                  </div>
                  <div
                    className={\`cck-doc-story__radio-selection \${selected === 3 ? 'cck-doc-story__radio-selection--selected' : ''}\`}
                    onClick={() => setSelected(3)}>
                    3
                  </div>
                </div>
                <hr />

                <Tabs type="<%= type %>" selected={selected} onSelectionChange={(e) => setSelected(e.value)} hideContent={true}>
                  <Tab header="Header 1" value={1} />
                  <Tab header="Header 2" value={2} />
                  <Tab header="Header 3" value={3} />
                </Tabs>
              </>
            );
          }
          `,
        },
        {
          filename: 'styles.scss',
          language: 'scss',
          code: `
            // Warning: The styles below are optimized for dark mode.

            .cck-doc-story__radio-selection-group {
              display: flex;
              justify-content: center;
              gap: 8px;
            }

            .cck-doc-story__radio-selection {
              width: 32px;
              height: 32px;
              border: 1px solid var(--cck-doc-color-border-3, #ffffff33);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--cck-doc-color-font-1, #fff);
              font: var(--cck-doc-text-sm-light, 300 14px/24px Inter);
              cursor: pointer;
              user-select: none;
            }

            .cck-doc-story__radio-selection--selected {
              background-color: var(--cck-doc-color-bg-selected-2, #14513c);
            }

            .cck-doc-story__button--basic {
              padding: 0 16px 0 16px;
              background-color: transparent;
              color: var(--cck-doc-color-font-1, #fff);
              gap: 8px;
              height: 40px;
              align-items: center;
              border: none;
              border-radius: var(--cck-doc-radius-sm, 4px);
              box-sizing: border-box;
              cursor: pointer;
              display: flex;
              font: var(--cck-doc-text-sm-medium, 500 14px/24px Inter);
              justify-content: center;
              margin: 0;
              min-width: 80px;
              outline: transparent;

              &:hover {
                background-color: var(--cck-doc-color-bg-hover-2, #15171e);
              }
            }

            hr {
              width: 100%;
              margin: 0;
            }
          `,
        },
      ],
    },
  },
  render: (args) => <TabsControl type={args.cckControl.type} />,
};
