import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj, withWrapperDecorator } from '@cocokits/storybook-addon-theme-react';

import { OverlayStandaloneExample } from './standalone';

export const Standalone: StoryObj<typeof OverlayStandaloneExample> = {
  name: 'Standalone',
  decorators: [withWrapperDecorator({ insideBox: true })],
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      source: [
        {
          filename: 'OverlayDialogStandaloneExample.tsx',
          language: 'tsx',
          code: `
            <%
              function toCamelCase(str) {
                return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
              }
            %>
            import './OverlayDialogStandaloneExample.scss';
            import { useState } from "react";
            import { Button, FormField, Input, openStandaloneOverlay, OverlayRef, ThemeConfigContext } from "@cocokits/react-components";
            import { <%= toCamelCase(themeId) %>ThemeConfig } from '@cocokits/theme-<%= themeId %>';


            interface OverlayDialogData {
              text: string;
            }
            
            interface OverlayDialogResult {
              result: string;
            }
            
            const OverlayDialogStandaloneExample = ({data, close}: OverlayRef<OverlayDialogData | null, OverlayDialogResult>) => {
            
              const [text, setText] = useState('');
            
              const onCloseClick = () => {
                close({result: text});
              };
              
              return (
                <div className="overlay-dialog-standalone__host">
                  <h3 className='overlay-dialog-standalone__header'>THIS IS A OVERLAY</h3>
                  <p className='overlay-dialog-standalone__text'>
                    <b>Data: </b>
                    {data ? JSON.stringify(data, null, 2) : ''}
                  </p>
            
                  <FormField>
                    <Input placeholder="Enter the result text" onInput={(e) => setText(e.currentTarget.value)}/>
                  </FormField>
            
                  <Button onClick={onCloseClick}>Close Overlay</Button>
                </div>
              );
            };
            
            export const OverlayStandaloneExample = () => {
            
              const theme = useTheme();
            
              const [text, setText] = useState('');
              const [result, setResult] = useState<OverlayDialogResult>();
            
            
              const openOverlay = async () => {
                const renderedOverlay = openStandaloneOverlay(OverlayDialogStandaloneExample, {
                  disableBackdropClose: <%= disableBackdropClose %>,
                  hasBackdrop: <%= hasBackdrop %>,
                  panelClass: ['overlay-standalone-example'],
                  decorator: (children) => (
                    <ThemeConfigContext.Provider value={<%= toCamelCase(themeId) %>ThemeConfig}>
                      {children}
                    </ThemeConfigContext.Provider>
                  ),
                  data: text ? {text} : null
                });
            
                const overlayResult = await renderedOverlay.afterClosed;
                setResult(overlayResult ?? {result: 'No result'});
              };
            
              return (
                <div className='overlay-standalone__host'>
                  <FormField>
                    <Input placeholder='Enter any text' onInput={e => setText(e.currentTarget.value)}/>
                  </FormField>
            
                  <p className="overlay-standalone__text">
                    <b>Overlay Result: </b>
                    {JSON.stringify(result, null, 2)}
                  </p>
            
                  <Button onClick={openOverlay}>Open</Button>
                </div>
              );
            };
          `,
        },
        {
          filename: 'OverlayDialogStandalone.scss',
          language: 'scss',
          code: `
            .overlay-dialog-standalone__host {
              padding: 24px;
              background-color: white;
              border-radius: 4px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            
            .overlay-dialog-standalone__header {
              margin: 0 0 16px;
              font-size: 24px;
              font-weight: 500;
            }
            
            .overlay-dialog-standalone__text {
              margin: 0 0 16px;
              font-size: 16px;
            }
          `,
        },
      ],
      hasControl: true,
      controls: [CCK_CONTROL.hasBackdrop(), CCK_CONTROL.disableBackdropClose()],
    },
  },
  render: (args) => {
    return (
      <OverlayStandaloneExample
        hasBackdrop={args.cckControl.hasBackdrop}
        disableBackdropClose={args.cckControl.disableBackdropClose}
      />
    );
  },
};
