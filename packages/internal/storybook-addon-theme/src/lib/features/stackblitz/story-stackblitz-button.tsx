import { PreparedStory } from "@storybook/types";

import { Button } from "@cocokits/react-button";
import { SvgIcon } from "@cocokits/react-icon";

import { Icons } from "../../utils/icons";

interface StoryStackblitzButtonProps {
  story: PreparedStory;
}

export function StoryStackblitzButton({story}: StoryStackblitzButtonProps) {
  return (
    <Button>
      <SvgIcon icon={Icons.stackblitz}/>
      Stackblitz
    </Button>
  );

}