import { useState } from 'react';

import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/textarea-max-char.config';
import { FormField, Hint, Label, Textarea } from '@cocokits/react-form-field';

export function TextareaMaxChar(props: { cckExampleArgs: ExampleArgs }) {
  const [valueLength, setValueLength] = useState(0);
  const maxLength = 150;

  return (
    <FormField>
      <Label>Description</Label>
      <Textarea
        maxLength={maxLength}
        placeholder="Short project description"
        onChange={(e) => setValueLength(e.target.value.length)}
      />
      <Hint>
        {valueLength}/{maxLength} characters max
      </Hint>
    </FormField>
  );
}
