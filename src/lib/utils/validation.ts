export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateRequired = (value: any, fieldName: string): string | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string
): string | null => {
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName: string
): string | null => {
  if (value.length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters`;
  }
  return null;
};

export const validateNumericRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string
): string | null => {
  if (value < min || value > max) {
    return `${fieldName} must be between ${min} and ${max}`;
  }
  return null;
};

export const validateForm = (
  fields: Record<string, any>,
  rules: Record<string, (value: any) => string | null>
): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach((field) => {
    const error = rules[field](fields[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};

// ===== WITHDRAWAL & PAYMENT VALIDATIONS =====

/**
 * Validate withdrawal amount
 */
export interface WithdrawalValidationOptions {
  minAmount?: number;
  maxAmount?: number;
  availableBalance?: number;
  requireMinimum?: boolean;
}

export interface WithdrawalValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export const validateWithdrawalAmount = (
  amount: number,
  options: WithdrawalValidationOptions = {}
): WithdrawalValidationResult => {
  const {
    minAmount = 10,
    maxAmount,
    availableBalance,
    requireMinimum = true,
  } = options;

  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if amount is a valid number
  if (isNaN(amount) || !isFinite(amount)) {
    errors.push('Amount must be a valid number');
    return { isValid: false, errors, warnings };
  }

  // Check if amount is positive
  if (amount <= 0) {
    errors.push('Amount must be greater than zero');
  }

  // Check minimum amount
  if (requireMinimum && amount < minAmount) {
    errors.push(`Minimum withdrawal amount is $${minAmount.toFixed(2)}`);
  }

  // Check maximum amount if specified
  if (maxAmount && amount > maxAmount) {
    errors.push(`Maximum withdrawal amount is $${maxAmount.toFixed(2)}`);
  }

  // Check available balance
  if (availableBalance !== undefined && amount > availableBalance) {
    errors.push(`Amount exceeds available balance ($${availableBalance.toFixed(2)})`);
  }

  // Warning for amounts close to available balance
  if (
    availableBalance !== undefined &&
    amount > availableBalance * 0.95 &&
    amount <= availableBalance
  ) {
    warnings.push('This withdrawal will use most of your available balance');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
};

/**
 * Calculate withdrawal fee based on method
 */
export interface FeeCalculation {
  processingFee: number;
  finalAmount: number;
  feePercentage: number;
  fixedFee?: number;
  effectiveFeePercentage: number; // Actual percentage after fixed fee
}

export enum WithdrawalMethodType {
  STRIPE = 'stripe',
  BANK_TRANSFER = 'bank_transfer',
  PAYPAL = 'paypal',
}

export const calculateWithdrawalFee = (
  amount: number,
  method: WithdrawalMethodType | string
): FeeCalculation => {
  let feePercentage = 0;
  let fixedFee: number | undefined;
  let processingFee = 0;

  switch (method.toLowerCase()) {
    case WithdrawalMethodType.STRIPE:
    case WithdrawalMethodType.PAYPAL:
      feePercentage = 2.9;
      fixedFee = 0.30;
      processingFee = (amount * 0.029) + 0.30;
      break;
    case WithdrawalMethodType.BANK_TRANSFER:
      feePercentage = 2.0;
      processingFee = amount * 0.02;
      break;
    default:
      // Unknown method, assume no fee
      feePercentage = 0;
      processingFee = 0;
  }

  const finalAmount = amount - processingFee;
  const effectiveFeePercentage = (processingFee / amount) * 100;

  return {
    processingFee: Math.round(processingFee * 100) / 100,
    finalAmount: Math.round(finalAmount * 100) / 100,
    feePercentage,
    fixedFee,
    effectiveFeePercentage: Math.round(effectiveFeePercentage * 100) / 100,
  };
};

/**
 * Validate bank account details
 */
export interface BankAccountValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateBankAccount = (
  accountNumber: string,
  routingNumber: string,
  accountHolderName: string
): BankAccountValidation => {
  const errors: Record<string, string> = {};

  // Validate account number
  if (!accountNumber || accountNumber.trim() === '') {
    errors.accountNumber = 'Account number is required';
  } else if (!/^\d+$/.test(accountNumber)) {
    errors.accountNumber = 'Account number must contain only digits';
  } else if (accountNumber.length < 8 || accountNumber.length > 17) {
    errors.accountNumber = 'Account number must be between 8 and 17 digits';
  }

  // Validate routing number
  if (!routingNumber || routingNumber.trim() === '') {
    errors.routingNumber = 'Routing number is required';
  } else if (!/^\d{9}$/.test(routingNumber)) {
    errors.routingNumber = 'Routing number must be exactly 9 digits';
  } else if (!isValidRoutingNumber(routingNumber)) {
    errors.routingNumber = 'Invalid routing number (checksum failed)';
  }

  // Validate account holder name
  if (!accountHolderName || accountHolderName.trim() === '') {
    errors.accountHolderName = 'Account holder name is required';
  } else if (accountHolderName.trim().length < 2) {
    errors.accountHolderName = 'Account holder name is too short';
  } else if (accountHolderName.trim().length > 100) {
    errors.accountHolderName = 'Account holder name is too long';
  } else if (!/^[a-zA-Z\s\-'.]+$/.test(accountHolderName)) {
    errors.accountHolderName = 'Account holder name contains invalid characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate US routing number using checksum algorithm
 */
export const isValidRoutingNumber = (routingNumber: string): boolean => {
  if (!/^\d{9}$/.test(routingNumber)) {
    return false;
  }

  // ABA routing number checksum algorithm
  const digits = routingNumber.split('').map(Number);
  const checksum =
    3 * (digits[0] + digits[3] + digits[6]) +
    7 * (digits[1] + digits[4] + digits[7]) +
    (digits[2] + digits[5] + digits[8]);

  return checksum % 10 === 0;
};

/**
 * Validate PayPal email
 */
export const validatePayPalEmail = (email: string): string | null => {
  if (!email || email.trim() === '') {
    return 'PayPal email is required';
  }

  if (!isValidEmail(email)) {
    return 'Invalid email format';
  }

  // Additional PayPal-specific validations
  if (email.length > 254) {
    return 'Email address is too long';
  }

  return null;
};

/**
 * Check if withdrawal would leave sufficient minimum balance
 */
export const checkMinimumBalanceAfterWithdrawal = (
  withdrawalAmount: number,
  currentBalance: number,
  minimumBalance: number = 0
): { isValid: boolean; error?: string } => {
  const balanceAfter = currentBalance - withdrawalAmount;

  if (balanceAfter < minimumBalance) {
    return {
      isValid: false,
      error: `This withdrawal would leave your balance below the minimum ($${minimumBalance.toFixed(2)})`,
    };
  }

  return { isValid: true };
};

/**
 * Comprehensive withdrawal request validation
 */
export interface WithdrawalRequest {
  amount: number;
  method: WithdrawalMethodType | string;
  bankAccountNumber?: string;
  bankRoutingNumber?: string;
  bankAccountHolderName?: string;
  paypalEmail?: string;
}

export interface ComprehensiveValidationResult {
  isValid: boolean;
  fieldErrors: Record<string, string>;
  generalErrors: string[];
  warnings?: string[];
  feeCalculation?: FeeCalculation;
}

export const validateWithdrawalRequest = (
  request: WithdrawalRequest,
  availableBalance: number,
  options: WithdrawalValidationOptions = {}
): ComprehensiveValidationResult => {
  const fieldErrors: Record<string, string> = {};
  const generalErrors: string[] = [];
  const warnings: string[] = [];

  // Validate amount
  const amountValidation = validateWithdrawalAmount(request.amount, {
    ...options,
    availableBalance,
  });

  if (!amountValidation.isValid) {
    fieldErrors.amount = amountValidation.errors.join('; ');
  }

  if (amountValidation.warnings) {
    warnings.push(...amountValidation.warnings);
  }

  // Calculate fee
  const feeCalculation = calculateWithdrawalFee(request.amount, request.method);

  // Check if final amount is positive after fee
  if (feeCalculation.finalAmount <= 0) {
    generalErrors.push('Withdrawal amount is too low to cover processing fees');
  }

  // Validate method-specific fields
  if (request.method.toLowerCase() === WithdrawalMethodType.BANK_TRANSFER) {
    if (request.bankAccountNumber && request.bankRoutingNumber && request.bankAccountHolderName) {
      const bankValidation = validateBankAccount(
        request.bankAccountNumber,
        request.bankRoutingNumber,
        request.bankAccountHolderName
      );

      if (!bankValidation.isValid) {
        Object.assign(fieldErrors, bankValidation.errors);
      }
    } else {
      if (!request.bankAccountNumber) {
        fieldErrors.bankAccountNumber = 'Bank account number is required';
      }
      if (!request.bankRoutingNumber) {
        fieldErrors.bankRoutingNumber = 'Bank routing number is required';
      }
      if (!request.bankAccountHolderName) {
        fieldErrors.bankAccountHolderName = 'Account holder name is required';
      }
    }
  } else if (request.method.toLowerCase() === WithdrawalMethodType.PAYPAL) {
    if (request.paypalEmail) {
      const emailError = validatePayPalEmail(request.paypalEmail);
      if (emailError) {
        fieldErrors.paypalEmail = emailError;
      }
    } else {
      fieldErrors.paypalEmail = 'PayPal email is required';
    }
  }

  return {
    isValid: Object.keys(fieldErrors).length === 0 && generalErrors.length === 0,
    fieldErrors,
    generalErrors,
    warnings: warnings.length > 0 ? warnings : undefined,
    feeCalculation,
  };
};