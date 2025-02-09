import './standalone.scss';
import { useState } from "react";

import { Button, FormField, Input, openStandaloneOverlay, OverlayRef, ThemeConfigContext } from "@cocokits/react-components";
import { useTheme } from '@cocokits/storybook-addon-theme';

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

export const OverlayStandaloneExample = ({hasBackdrop, disableBackdropClose}: {
  hasBackdrop: boolean,
  disableBackdropClose: boolean,
}) => {

  const theme = useTheme();

  const [text, setText] = useState('');
  const [result, setResult] = useState<OverlayDialogResult>();


  const openOverlay = async () => {
    const renderedOverlay = openStandaloneOverlay(OverlayDialogStandaloneExample, {
      disableBackdropClose,
      hasBackdrop,
      panelClass: ['overlay-standalone-example'],
      decorator: (children) => (
        <ThemeConfigContext.Provider value={theme.themeConfig}>
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