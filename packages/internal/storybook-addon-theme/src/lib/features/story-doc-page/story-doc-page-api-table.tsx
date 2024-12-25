import { StoryDocPageComponentArgType } from "./story-doc-page-api.model";

interface StoryDocPageApiTableProps {
  hideDefault?: boolean;
  argTypes: StoryDocPageComponentArgType[]
}

export function StoryDocPageApiTable({hideDefault = false, argTypes}: StoryDocPageApiTableProps) {
  return (
    <table className="arg-type-table arg-type-table--full-width">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          {!hideDefault && <th>Default</th>}
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {argTypes.map((argType, index) => (
          <tr key={index}>
            <td>{argType.name}</td>
            <td>
              <div className="arg-type-table--gap-8">
                {argType.type.split('|').map((type) => (<code key={type}>{type}</code>))}
              </div>
            </td>
            { !hideDefault && <td>{argType.defaultValue}</td> }
            <td>{argType.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

}