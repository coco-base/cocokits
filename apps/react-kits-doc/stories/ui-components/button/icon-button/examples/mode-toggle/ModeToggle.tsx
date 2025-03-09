import { useState } from 'react';

import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/icon-button/mode-toggle.config';
import { IconButton, SvgIcon } from '@cocokits/react-components';

export function ModeToggle(props: { cckExampleArgs: ExampleArgs }) {
  const [isDark, setIsDark] = useState(false);
  
  return (
    <IconButton
      color={props.cckExampleArgs.color}
      type={props.cckExampleArgs.type}
      size={props.cckExampleArgs.size}
      onClick={() => setIsDark(!isDark)}>
      <SvgIcon icon={isDark ? Icons.light : Icons.dark} size={props.cckExampleArgs.iconSize}/>
    </IconButton>
  );
}
