"use client";
import { forwardRef, useState } from 'react';
import { clsx } from 'clsx';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: string;
  helperText?: string;
  showPasswordToggle?: boolean;
  validationState?: 'idle' | 'validating' | 'valid' | 'invalid';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ 
    label, 
    error, 
    success, 
    helperText, 
    showPasswordToggle = false, 
    validationState = 'idle',
    leftIcon,
    rightIcon,
    className, 
    type = 'text',
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

    const inputClasses = clsx(
      'w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-500',
      {
        'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20': validationState === 'idle',
        'border-blue-500 focus:border-blue-500 focus:ring-blue-500/20': validationState === 'validating',
        'border-green-500 focus:border-green-500 focus:ring-green-500/20': validationState === 'valid' || success,
        'border-red-500 focus:border-red-500 focus:ring-red-500/20': validationState === 'invalid' || error,
        'pl-12': leftIcon,
        'pr-12': rightIcon || showPasswordToggle,
      },
      className
    );

    const getValidationIcon = () => {
      if (validationState === 'validating') {
        return (
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
        );
      }
      if (validationState === 'valid' || success) {
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      }
      if (validationState === 'invalid' || error) {
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      }
      return null;
    };

    return (
      <div className="space-y-2">
        <label 
          htmlFor={props.id || props.name} 
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            className={inputClasses}
            {...props}
          />
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {getValidationIcon()}
            
            {showPasswordToggle && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            )}
            
            {rightIcon && !showPasswordToggle && (
              <div className="text-gray-400">
                {rightIcon}
              </div>
            )}
          </div>
        </div>
        
        {(error || success || helperText) && (
          <div className="space-y-1">
            {error && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </p>
            )}
            {success && !error && (
              <p className="text-sm text-green-600 flex items-center space-x-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>{success}</span>
              </p>
            )}
            {helperText && !error && !success && (
              <p className="text-sm text-gray-500">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;
