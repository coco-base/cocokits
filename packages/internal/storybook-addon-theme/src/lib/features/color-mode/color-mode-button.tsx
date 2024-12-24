import { IconButton } from "@cocokits/react-button";
import { SvgIcon } from "@cocokits/react-icon";

import { ColorMode } from "../../model/theme.model";
import { Icons } from '../../utils/icons';
import { useColorMode } from "../../utils/use-preview-color-mode";

export function ColorModeButton() {

  const { colorMode, dispatchColorMode } = useColorMode();

  const isDark = colorMode === ColorMode.Dark;

  return (
    <IconButton onClick={() => dispatchColorMode(isDark ? ColorMode.Light : ColorMode.Dark)}>
      <SvgIcon icon={isDark ? Icons.dark : Icons.light}></SvgIcon>
    </IconButton>
  );
}