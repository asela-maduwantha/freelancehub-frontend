"use client";
import { CheckCircle2, XCircle, Shield } from 'lucide-react';
import { clsx } from 'clsx';

interface PasswordStrengthProps {
  password: string;
  score?: number;
  feedback?: string[];
  isValid?: boolean;
  className?: string;
}

const PasswordStrength = ({ 
  password, 
  score = 0, 
  feedback = [], 
  isValid = false,
  className 
}: PasswordStrengthProps) => {
  // Calculate basic strength if score not provided
  const calculateStrength = (pwd: string) => {
    let strength = 0;
    const checks = {
      length: pwd.length >= 8,
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
    
    strength = Object.values(checks).filter(Boolean).length;
    return { strength, checks };
  };

  const { strength, checks } = calculateStrength(password);
  const finalScore = score || strength;
  
  const getStrengthLevel = (score: number) => {
    if (score <= 1) return { level: 'Very Weak', color: 'red', width: '20%' };
    if (score <= 2) return { level: 'Weak', color: 'orange', width: '40%' };
    if (score <= 3) return { level: 'Fair', color: 'yellow', width: '60%' };
    if (score <= 4) return { level: 'Good', color: 'blue', width: '80%' };
    return { level: 'Strong', color: 'green', width: '100%' };
  };

  const strengthInfo = getStrengthLevel(finalScore);
  
  const requirements = [
    { key: 'length', label: 'At least 8 characters', met: checks.length },
    { key: 'lowercase', label: 'One lowercase letter', met: checks.lowercase },
    { key: 'uppercase', label: 'One uppercase letter', met: checks.uppercase },
    { key: 'number', label: 'One number', met: checks.number },
    { key: 'special', label: 'One special character', met: checks.special },
  ];

  if (!password) return null;

  return (
    <div className={clsx('space-y-3', className)}>
      {/* Strength Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 flex items-center space-x-1">
            <Shield className="w-4 h-4" />
            <span>Password Strength</span>
          </span>
          <span
            className={clsx(
              'text-sm font-medium',
              {
                'text-red-600': strengthInfo.color === 'red',
                'text-orange-600': strengthInfo.color === 'orange',
                'text-yellow-600': strengthInfo.color === 'yellow',
                'text-blue-600': strengthInfo.color === 'blue',
                'text-green-600': strengthInfo.color === 'green',
              }
            )}
          >
            {strengthInfo.level}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={clsx(
              'h-2 rounded-full transition-all duration-300',
              {
                'bg-red-500': strengthInfo.color === 'red',
                'bg-orange-500': strengthInfo.color === 'orange',
                'bg-yellow-500': strengthInfo.color === 'yellow',
                'bg-blue-500': strengthInfo.color === 'blue',
                'bg-green-500': strengthInfo.color === 'green',
              }
            )}
            style={{ width: strengthInfo.width }}
          />
        </div>
      </div>

      {/* Requirements */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-700">Requirements:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {requirements.map((req) => (
            <div
              key={req.key}
              className="flex items-center space-x-2 text-sm"
            >
              {req.met ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-300" />
              )}
              <span
                className={clsx(
                  req.met ? 'text-green-700' : 'text-gray-500'
                )}
              >
                {req.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {feedback.length > 0 && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-700">Suggestions:</p>
          <ul className="space-y-1">
            {feedback.map((item, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                <span className="text-blue-500">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordStrength;
