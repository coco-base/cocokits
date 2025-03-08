/** @module transform */

export function toAmountFormat(value: string): string {
  // Remove all commas and convert to number
  const numericValue = parseFloat(value.replace(/,/g, ''));

  if (isNaN(numericValue)) {
    return '';
  }

  // Format to have 2 decimal places and add commas for thousands
  const formattedValue = numericValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formattedValue;
}

export function removeAmountFormat(string: string): string {
  return string.replace(/,/g, '');
}
