'use client';

import React from 'react';
import Button from '@/components/ui/Button';

interface NavigationButtonsProps {
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  onSaveAndContinue?: () => void;
  nextLabel?: string;
  backLabel?: string;
  skipLabel?: string;
  saveLabel?: string;
  showSkip?: boolean;
  showSaveAndContinue?: boolean;
  nextDisabled?: boolean;
  backDisabled?: boolean;
  loading?: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onNext,
  onBack,
  onSkip,
  onSaveAndContinue,
  nextLabel = 'Continue',
  backLabel = 'Back',
  skipLabel = 'Skip for now',
  saveLabel = 'Save & Continue Later',
  showSkip = false,
  showSaveAndContinue = false,
  nextDisabled = false,
  backDisabled = false,
  loading = false
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-gray-200">
      {/* Primary Actions */}
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            disabled={backDisabled || loading}
            className="order-2 sm:order-1"
          >
            {backLabel}
          </Button>
        )}

        {onNext && (
          <Button
            variant="primary"
            onClick={onNext}
            disabled={nextDisabled || loading}
            className="order-1 sm:order-2"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              nextLabel
            )}
          </Button>
        )}
      </div>

      {/* Secondary Actions */}
      {(showSkip || showSaveAndContinue) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {showSaveAndContinue && onSaveAndContinue && (
            <Button
              variant="ghost"
              onClick={onSaveAndContinue}
              disabled={loading}
              className="text-gray-600 hover:text-gray-800"
            >
              {saveLabel}
            </Button>
          )}

          {showSkip && onSkip && (
            <Button
              variant="ghost"
              onClick={onSkip}
              disabled={loading}
              className="text-gray-600 hover:text-gray-800"
            >
              {skipLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default NavigationButtons;