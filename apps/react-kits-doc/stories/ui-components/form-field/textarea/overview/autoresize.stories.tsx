import { FormField, Label, Textarea } from '@cocokits/react-components';
import { renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const AutoResize: StoryObj<typeof Textarea> = {
  name: 'Auto Resize',
  parameters: {
    docs: {
      description: {
        story:
          'This demonstrates the textarea with the autoResize property enabled, allowing it to automatically adjust its height based on content.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
            import { FormField, Label, Textarea } from "@cocokits/react-components";

            export const MyComponent = () => {
            return (
                <>
                      <FormField>
                        <Label>Auto Resize</Label>
                        <Textarea
                          autoResize
                          placeholder="placeholder"
                        >
                          Auto Resize
                        </Textarea>
                      </FormField>
                </>
            );
            }
          `,
        },
      ],
    },
  },
  render: () => (
    <>
      <FormField>
        <Label>Auto Resize</Label>
        <Textarea autoResize placeholder="placeholder" />
      </FormField>
    </>
  ),
};
