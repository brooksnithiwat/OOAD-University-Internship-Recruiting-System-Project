interface SearchBoxProps {
  id?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  id = 'search',
  placeholder = 'Search...',
  value,
  onChange,
  label,
  className = '',
}) => {
  return (
    <div className={label ? 'w-full' : ''}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${className}`.trim()}
      />
    </div>
  );
};
