import React from 'react';

interface TextAreaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
}

const TextArea: React.FC<TextAreaProps> = ({
  placeholder,
  value,
  onChange,
  className = '',
  disabled = false,
  required = false,
  rows = 4
}) => {
  const baseStyles = 'input-default w-full px-4 py-3 rounded-lg transition-all duration-200 resize-vertical focus:outline-none disabled:cursor-not-allowed';

  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      rows={rows}
      className={`${baseStyles} ${className}`}
    />
  );
};

export default TextArea;