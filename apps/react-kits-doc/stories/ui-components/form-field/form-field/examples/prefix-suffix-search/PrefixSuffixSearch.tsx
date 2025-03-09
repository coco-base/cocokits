import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/prefix-suffix-search.config';
import { FormField, Input, Prefix, Suffix, SvgIcon } from '@cocokits/react-components';

export function PrefixSuffixSearch(props: { cckExampleArgs: ExampleArgs }) {
  return (
    <FormField>
      <Input placeholder="Search ..." />
      <Prefix>
        <SvgIcon size={props.cckExampleArgs.iconSize} icon={Icons.search}></SvgIcon>
      </Prefix>
      <Suffix>
        <SvgIcon size={props.cckExampleArgs.iconSize} icon={Icons.mic}></SvgIcon>
      </Suffix>
    </FormField>
  );
}
