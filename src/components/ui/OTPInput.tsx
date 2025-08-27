"use client";
import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  autoFocus?: boolean;
  className?: string;
}

const OTPInput = ({ 
  length = 6, 
  value, 
  onChange, 
  disabled = false, 
  error, 
  autoFocus = false,
  className 
}: OTPInputProps) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(autoFocus ? 0 : -1);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Auto-focus first input
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  // Auto-submit when all digits are entered
  useEffect(() => {
    if (value.length === length) {
      // Trigger any submit logic here if needed
    }
  }, [value, length]);

  const handleChange = (index: number, digit: string) => {
    // Only allow digits
    if (!/^\d*$/.test(digit)) return;

    const newValue = value.split('');
    newValue[index] = digit;
    onChange(newValue.join(''));

    // Move to next input if digit entered
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
      } else {
        // Clear current input
        const newValue = value.split('');
        newValue[index] = '';
        onChange(newValue.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, length);
    onChange(digits);

    // Focus the last filled input or first empty one
    const focusIndex = Math.min(digits.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
    setActiveIndex(focusIndex);
  };

  const handleFocus = (index: number) => {
    setActiveIndex(index);
  };

  const handleBlur = () => {
    setActiveIndex(-1);
  };

  return (
    <div className={clsx('space-y-4', className)}>
      <div className="flex justify-center space-x-2 sm:space-x-3">
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            onBlur={handleBlur}
            disabled={disabled}
            className={clsx(
              'w-12 h-12 sm:w-14 sm:h-14 text-center text-lg sm:text-xl font-bold border-2 rounded-lg transition-all duration-200 focus:outline-none',
              {
                'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20': !error && !disabled,
                'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20': error && !disabled,
                'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed': disabled,
                'border-blue-500 ring-2 ring-blue-500/20': activeIndex === index && !error && !disabled,
                'bg-blue-50': value[index] && !error && !disabled,
              }
            )}
          />
        ))}
      </div>

      {error && (
        <div className="text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Helper text */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Enter the {length}-digit code sent to your email
        </p>
      </div>
    </div>
  );
};

export default OTPInput;
