import React from 'react';
import { useRouter } from 'next/navigation';
import { CardFooter } from '../../../../../../../components/ui/Card';
import Button from '../../../../../../../components/ui/Button';
import { Spinner } from '../../../../../../../components/ui/Feedback';

interface ContractSubmitActionsProps {
  error: string | null;
  isSubmitting: boolean;
  startDate: string;
  endDate: string;
  hasPaymentMethod?: boolean;
  isAddingCard?: boolean;
}

export function ContractSubmitActions({
  error,
  isSubmitting,
  startDate,
  endDate,
  hasPaymentMethod = false,
  isAddingCard = false
}: ContractSubmitActionsProps) {
  const router = useRouter();

  return (
    <CardFooter>
      {/* Error Display */}
      {error && (
        <div className="w-full mb-4">
          <div className="alert-error p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          </div>
        </div>
      )}
      <div className="flex gap-3 justify-end w-full">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || !startDate || !endDate || !hasPaymentMethod || isAddingCard}
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Creating Contract...
            </>
          ) : isAddingCard ? (
            'Complete Payment Method Setup'
          ) : !hasPaymentMethod ? (
            'Select Payment Method First'
          ) : (
            'Create Contract & Pay'
          )}
        </Button>
      </div>
      
      {/* Helper text for payment method */}
      {!hasPaymentMethod && !isSubmitting && (
        <div className="w-full mt-3 text-center">
          <p className="text-sm text-secondary">
            {isAddingCard 
              ? '↑ Please complete adding your payment method above'
              : '↑ Please select or add a payment method above to continue'}
          </p>
        </div>
      )}
    </CardFooter>
  );
}