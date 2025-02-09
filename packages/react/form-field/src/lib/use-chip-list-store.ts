import { useState } from 'react';

export function useChipListStore() {
  const [chips, setChips] = useState<string[]>([]);

  const addChip = (chip: string) => {
    if (chips.includes(chip)) {
      return;
    }

    const newChips = [...chips, chip];
    setChips(newChips);
    return newChips;
  };

  const removeChip = (chip: string) => {
    const newChips = chips.filter((c) => c !== chip);
    setChips(newChips);
    return newChips;
  };

  return {
    chips,
    setChips,
    addChip,
    removeChip,
  };
}
