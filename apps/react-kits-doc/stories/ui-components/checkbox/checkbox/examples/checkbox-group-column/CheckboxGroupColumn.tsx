import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/checkbox/checkbox-group-column.config';
import { Checkbox } from '@cocokits/react-checkbox';

export function CheckboxGroupColumn(props: { cckExampleArgs: ExampleArgs }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <i style={{ color: 'var(--checkbox-group-column-color)' }}>My hobbies</i>
      <Checkbox size={props.cckExampleArgs.size} value={1}>
        Comic books
      </Checkbox>
      <Checkbox size={props.cckExampleArgs.size} value={1}>
        Listen to music
      </Checkbox>
      <Checkbox size={props.cckExampleArgs.size} value={1}>
        Travel the world
      </Checkbox>
      <Checkbox size={props.cckExampleArgs.size} value={1}>
        Watch movies
      </Checkbox>
    </div>
  );
}
