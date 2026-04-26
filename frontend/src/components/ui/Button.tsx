type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
};

export const Button = ({ children, variant = 'primary', isLoading, disabled, ...props }: ButtonProps) => {
  const baseStyles = 'font-medium py-2 px-4 rounded-lg transition-colors';
  const primaryStyles = 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400';
  const secondaryStyles = 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-300';

  const variantStyles = variant === 'primary' ? primaryStyles : secondaryStyles;

  return (
    <button disabled={disabled || isLoading} className={`${baseStyles} ${variantStyles}`} {...props}>
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
