import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  id?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  placeholder = 'Enter password',
  value,
  onChange,
  className = '',
  disabled = false,
  required = false
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const baseStyles = 'input-default w-full px-4 py-3 rounded-lg transition-all duration-200 pr-12 focus:outline-none disabled:cursor-not-allowed';

  return (
    <div className="relative">
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`${baseStyles} ${className}`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-body)] focus:outline-none disabled:text-[var(--color-text-secondary)]"
        disabled={disabled}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
};

export default PasswordInput;