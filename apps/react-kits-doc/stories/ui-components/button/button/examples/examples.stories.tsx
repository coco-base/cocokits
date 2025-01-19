import { Button } from "@cocokits/react-button";
import { AddonParametersSource, renderWithPageTab } from "@cocokits/storybook-addon-theme";
import { StoryObj } from "@cocokits/storybook-addon-theme-react";

const SOURCE: AddonParametersSource[] = [
  {
    filename: 'exampleComponent.tsx',
    language: 'tsx',
    code: `
      import { Button, SvgIcon} from '@cocokits/react-components';
import { Button } from '@cocokits/react-button';

      export default function Component() {
        return (
          <Button>
            <SvgIcon icon="YOUR_ICON"/>
            Button
          </Button>
        );
      }
    `,
  },
  {
    filename: 'exampleComponent2.tsx',
    language: 'tsx',
    code: `
      import { Button, SvgIcon} from '@cocokits/react-components';

      export default function Component() {
        return (
          <Button>
            <SvgIcon icon="YOUR_ICON"/>
            Button
          </Button>
        );
      }
    `,
  },
  {
    filename: 'exampleComponent3.tsx',
    language: 'tsx',
    code: `
      import { Button, SvgIcon} from '@cocokits/react-components';

      export default function Component() {
        return (
          <Button>
            <SvgIcon icon="YOUR_ICON"/>
            Button
          </Button>
        );
      }
    `,
  },
];

export const Example1: StoryObj<typeof Button> = {
  name: 'Example 1',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 1</Button>,
};

export const Example2: StoryObj<typeof Button> = {
  name: 'Example 2',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 2</Button>,
};

export const Example3: StoryObj<typeof Button> = {
  name: 'Example 3',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 3</Button>,
};

export const Example4: StoryObj<typeof Button> = {
  name: 'Example 4',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 4</Button>,
};

export const Example5: StoryObj<typeof Button> = {
  name: 'Example 5',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 5</Button>,
};

export const Example6: StoryObj<typeof Button> = {
  name: 'Example 6',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 6</Button>,
};

export const Example7: StoryObj<typeof Button> = {
  name: 'Example 7',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 7</Button>,
};

export const Example8: StoryObj<typeof Button> = {
  name: 'Example 8',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 8</Button>,
};

export const Example9: StoryObj<typeof Button> = {
  name: 'Example 9',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 9</Button>,
};

export const Example10: StoryObj<typeof Button> = {
  name: 'Example 10',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 10</Button>,
};

export const Example11: StoryObj<typeof Button> = {
  name: 'Example 11',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 11</Button>,
};

export const Example12: StoryObj<typeof Button> = {
  name: 'Example 12',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 12</Button>,
};

export const Example13: StoryObj<typeof Button> = {
  name: 'Example 13',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 13</Button>,
};

export const Example14: StoryObj<typeof Button> = {
  name: 'Example 14',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 14</Button>,
};

export const Example15: StoryObj<typeof Button> = {
  name: 'Example 15',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 15</Button>,
};

export const Example16: StoryObj<typeof Button> = {
  name: 'Example 16',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 16</Button>,
};

export const Example17: StoryObj<typeof Button> = {
  name: 'Example 17',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 17</Button>,
};

export const Example18: StoryObj<typeof Button> = {
  name: 'Example 18',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 18</Button>,
};

export const Example19: StoryObj<typeof Button> = {
  name: 'Example 19',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 19</Button>,
};

export const Example20: StoryObj<typeof Button> = {
  name: 'Example 20',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 20</Button>,
};

export const Example21: StoryObj<typeof Button> = {
  name: 'Example 21',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 21</Button>,
};

export const Example22: StoryObj<typeof Button> = {
  name: 'Example 22',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 22</Button>,
};

export const Example23: StoryObj<typeof Button> = {
  name: 'Example 23',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 23</Button>,
};

export const Example24: StoryObj<typeof Button> = {
  name: 'Example 24',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 24</Button>,
};

export const Example25: StoryObj<typeof Button> = {
  name: 'Example 25',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 25</Button>,
};

export const Example26: StoryObj<typeof Button> = {
  name: 'Example 26',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 26</Button>,
};

export const Example27: StoryObj<typeof Button> = {
  name: 'Example 27',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 27</Button>,
};

export const Example28: StoryObj<typeof Button> = {
  name: 'Example 28',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 28</Button>,
};

export const Example29: StoryObj<typeof Button> = {
  name: 'Example 29',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 29</Button>,
};

export const Example30: StoryObj<typeof Button> = {
  name: 'Example 30',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 30</Button>,
};

export const Example31: StoryObj<typeof Button> = {
  name: 'Example 31',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 31</Button>,
};

export const Example32: StoryObj<typeof Button> = {
  name: 'Example 32',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 32</Button>,
};

export const Example33: StoryObj<typeof Button> = {
  name: 'Example 33',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 33</Button>,
};

export const Example34: StoryObj<typeof Button> = {
  name: 'Example 34',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 34</Button>,
};

export const Example35: StoryObj<typeof Button> = {
  name: 'Example 35',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 35</Button>,
};

export const Example36: StoryObj<typeof Button> = {
  name: 'Example 36',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 36</Button>,
};

export const Example37: StoryObj<typeof Button> = {
  name: 'Example 37',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 37</Button>,
};

export const Example38: StoryObj<typeof Button> = {
  name: 'Example 38',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 38</Button>,
};

export const Example39: StoryObj<typeof Button> = {
  name: 'Example 39',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 39</Button>,
};

export const Example40: StoryObj<typeof Button> = {
  name: 'Example 40',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 40</Button>,
};

export const Example41: StoryObj<typeof Button> = {
  name: 'Example 41',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 41</Button>,
};

export const Example42: StoryObj<typeof Button> = {
  name: 'Example 42',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 42</Button>,
};

export const Example43: StoryObj<typeof Button> = {
  name: 'Example 43',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 43</Button>,
};

export const Example44: StoryObj<typeof Button> = {
  name: 'Example 44',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 44</Button>,
};

export const Example45: StoryObj<typeof Button> = {
  name: 'Example 45',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 45</Button>,
};

export const Example46: StoryObj<typeof Button> = {
  name: 'Example 46',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 46</Button>,
};

export const Example47: StoryObj<typeof Button> = {
  name: 'Example 47',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 47</Button>,
};

export const Example48: StoryObj<typeof Button> = {
  name: 'Example 48',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 48</Button>,
};

export const Example49: StoryObj<typeof Button> = {
  name: 'Example 49',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 49</Button>,
};

export const Example50: StoryObj<typeof Button> = {
  name: 'Example 50',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 50</Button>,
};

export const Example51: StoryObj<typeof Button> = {
  name: 'Example 51',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 51</Button>,
};

export const Example52: StoryObj<typeof Button> = {
  name: 'Example 52',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 52</Button>,
};

export const Example53: StoryObj<typeof Button> = {
  name: 'Example 53',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 53</Button>,
};

export const Example54: StoryObj<typeof Button> = {
  name: 'Example 54',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 54</Button>,
};

export const Example55: StoryObj<typeof Button> = {
  name: 'Example 55',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 55</Button>,
};

export const Example56: StoryObj<typeof Button> = {
  name: 'Example 56',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 56</Button>,
};

export const Example57: StoryObj<typeof Button> = {
  name: 'Example 57',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 57</Button>,
};

export const Example58: StoryObj<typeof Button> = {
  name: 'Example 58',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 58</Button>,
};

export const Example59: StoryObj<typeof Button> = {
  name: 'Example 59',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 59</Button>,
};

export const Example60: StoryObj<typeof Button> = {
  name: 'Example 60',
  parameters: {
    docs: {
      description: {
        story: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr',
      }
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE
    },
  },
  render: () => <Button>Example 60</Button>,
};