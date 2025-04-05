import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/checkbox/checkbox-group-row.config';
import { Checkbox } from '@cocokits/react-checkbox';

export function CheckboxGroupRow(props: { cckExampleArgs: ExampleArgs }) {
  return (
    <div>
      <i style={{ color: 'var(--checkbox-group-column-color)' }}>Favorite food</i>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '12px', marginTop: '10px' }}>
        <Checkbox size={props.cckExampleArgs.size} value={1}>
          Pizza
        </Checkbox>
        <Checkbox size={props.cckExampleArgs.size} value={1}>
          Pasta
        </Checkbox>
        <Checkbox size={props.cckExampleArgs.size} value={1}>
          Fruits
        </Checkbox>
      </div>
    </div>
  );
}
