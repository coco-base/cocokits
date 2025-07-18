import { Icons } from '@cocokits/common-icons';
import { IconButton } from '@cocokits/react-button';
import { SvgIcon } from '@cocokits/react-icon';

import { StoryControlChangeEvent } from './story-control.model';
import { StyledControlImage, StyledControlLabel, StyledControlSelection } from './story-control.style';
import { AddonParametersControlImage } from '../../model/addon.model';

export interface StoryControlImageProps {
  control: AddonParametersControlImage;
  value: string;
  onChange: (changes: StoryControlChangeEvent) => void;
}

export function StoryControlImage({ control, value, onChange }: StoryControlImageProps) {
  const [selectedImage, setSelectedImage] = useState(value);

  const onSelectChange = (_selectedImage: string) => {
    setSelectedImage(_selectedImage);
    const storyArgKey = _selectedImage === 'none' ? null : _selectedImage;
    onChange({ [control.storyArgKey]: storyArgKey });
  };

  return (
    <>
      <StyledControlLabel>{control.displayName}</StyledControlLabel>
      <StyledControlSelection $isRow={true}>
        {control.images.map((image, index) =>
          image === 'none' ? (
            <IconButton key={index} onClick={() => onSelectChange(image)}>
              <SvgIcon icon={Icons.none} />
            </IconButton>
          ) : (
            <StyledControlImage key={index} $selected={image === selectedImage} onClick={() => onSelectChange(image)}>
              <img src={image} alt={`Image ${index}`} />
            </StyledControlImage>
          )
        )}
      </StyledControlSelection>
    </>
  );
}
