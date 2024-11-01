interface ButtonProps {
  /**
   * The text to be displayed on the button.
   */
  label: string;
}
export function Button({label}: ButtonProps) {
  return (
    <button>{label}</button>
  );
}

export default Button;
