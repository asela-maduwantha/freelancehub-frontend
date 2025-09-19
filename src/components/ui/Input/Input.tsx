import React from 'react';

interface InputProps {
  id?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
}

const Input: React.FC<InputProps> = ({
  id,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  disabled = false,
  required = false,
  autoComplete
}) => {
  const baseStyles = 'input-default w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none disabled:cursor-not-allowed';

  return (
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      autoComplete={autoComplete}
      className={`${baseStyles} ${className}`}
    />
  );
};

export default Input;