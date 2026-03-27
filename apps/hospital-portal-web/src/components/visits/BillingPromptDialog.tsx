'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircle,
  Receipt,
  CheckCircle,
  XCircle,
  IndianRupee,
  Lock,
  CreditCard,
} from 'lucide-react';

export interface BillingStatus {
  hasBill: boolean;
  isPaid: boolean;
  isLocked: boolean;
  isFreeVisit: boolean;
  isCredit: boolean;
  balanceDue: number;
  netAmount?: number;
  amountPaid?: number;
  billNumber?: string;
  billId?: string;
  status?: string;
  canComplete: boolean;
  message: string;
}

interface BillingPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  billingStatus: BillingStatus;
  patientName?: string;
  onGenerateBill: () => void;
  onProceedWithoutBilling: () => void;
  onViewBill?: () => void;
  allowOverride?: boolean;
}

export const BillingPromptDialog: React.FC<BillingPromptDialogProps> = ({
  isOpen,
  onClose,
  billingStatus,
  patientName,
  onGenerateBill,
  onProceedWithoutBilling,
  onViewBill,
  allowOverride = false,
}) => {
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverrideInput, setShowOverrideInput] = useState(false);

  const getStatusIcon = () => {
    if (!billingStatus.hasBill) {
      return <AlertCircle className="h-12 w-12 text-orange-500" />;
    }
    if (billingStatus.isPaid || billingStatus.isFreeVisit) {
      return <CheckCircle className="h-12 w-12 text-green-500" />;
    }
    if (billingStatus.isCredit) {
      return <CreditCard className="h-12 w-12 text-blue-500" />;
    }
    return <XCircle className="h-12 w-12 text-red-500" />;
  };

  const getStatusBadge = () => {
    if (!billingStatus.hasBill) {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
          No Bill Generated
        </Badge>
      );
    }
    if (billingStatus.isPaid) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
          Paid
        </Badge>
      );
    }
    if (billingStatus.isFreeVisit) {
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
          Free Visit
        </Badge>
      );
    }
    if (billingStatus.isCredit) {
      return (
        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
          Credit Approved
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
        Payment Pending
      </Badge>
    );
  };

  const handleProceed = () => {
    if (billingStatus.canComplete) {
      onClose();
    } else if (showOverrideInput) {
      if (!overrideReason.trim()) {
        alert('Please provide a reason for bypassing billing');
        return;
      }
      onProceedWithoutBilling();
    } else {
      setShowOverrideInput(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Billing Status Check
          </DialogTitle>
          <DialogDescription>
            {patientName && `Patient: ${patientName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Icon */}
          <div className="flex flex-col items-center text-center space-y-3">
            {getStatusIcon()}
            {getStatusBadge()}
          </div>

          {/* Billing Details */}
          <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
            {billingStatus.hasBill && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bill Number:</span>
                  <span className="font-medium">{billingStatus.billNumber}</span>
                </div>
                
                {billingStatus.netAmount !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bill Amount:</span>
                    <span className="font-medium">₹{billingStatus.netAmount.toFixed(2)}</span>
                  </div>
                )}

                {billingStatus.amountPaid !== undefined && billingStatus.amountPaid > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span className="font-medium text-green-600">
                      ₹{billingStatus.amountPaid.toFixed(2)}
                    </span>
                  </div>
                )}

                {billingStatus.balanceDue > 0 && (
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="text-muted-foreground font-semibold">Balance Due:</span>
                    <span className="font-bold text-red-600 flex items-center">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      {billingStatus.balanceDue.toFixed(2)}
                    </span>
                  </div>
                )}

                {billingStatus.isLocked && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                    <Lock className="h-4 w-4" />
                    <span>Bill is locked</span>
                  </div>
                )}
              </>
            )}

            {!billingStatus.hasBill && (
              <p className="text-sm text-muted-foreground text-center">
                No billing record found for this visit
              </p>
            )}
          </div>

          {/* Message Alert */}
          <Alert variant={billingStatus.canComplete ? 'default' : 'destructive'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{billingStatus.message}</AlertDescription>
          </Alert>

          {/* Actions Based on Status */}
          {!billingStatus.hasBill && (
            <Alert>
              <AlertDescription>
                Please generate a bill before completing the visit. If this is a free visit or
                emergency case, please generate a bill with appropriate reason.
              </AlertDescription>
            </Alert>
          )}

          {billingStatus.hasBill && !billingStatus.canComplete && (
            <Alert variant="destructive">
              <AlertDescription>
                Payment is required before completing the visit. Please collect payment or
                apply credit approval.
              </AlertDescription>
            </Alert>
          )}

          {/* Override Section (Emergency) */}
          {!billingStatus.canComplete && allowOverride && showOverrideInput && (
            <div className="border-2 border-orange-300 rounded-lg p-4 bg-orange-50 space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-orange-900 text-sm">
                    Emergency Override
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    This will allow completing the visit without billing. Requires
                    supervisor authorization and will be logged.
                  </p>
                </div>
              </div>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="w-full p-2 border rounded text-sm"
                placeholder="Enter reason for override (required)..."
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          {!billingStatus.hasBill && (
            <Button onClick={onGenerateBill} className="bg-blue-600 hover:bg-blue-700">
              <Receipt className="h-4 w-4 mr-2" />
              Generate Bill
            </Button>
          )}

          {billingStatus.hasBill && !billingStatus.canComplete && onViewBill && (
            <Button onClick={onViewBill} variant="outline">
              <Receipt className="h-4 w-4 mr-2" />
              View Bill
            </Button>
          )}

          {billingStatus.canComplete && (
            <Button onClick={handleProceed} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Proceed to Complete
            </Button>
          )}

          {!billingStatus.canComplete && allowOverride && !showOverrideInput && (
            <Button
              onClick={() => setShowOverrideInput(true)}
              variant="destructive"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Emergency Override
            </Button>
          )}

          {!billingStatus.canComplete && allowOverride && showOverrideInput && (
            <Button
              onClick={handleProceed}
              variant="destructive"
              disabled={!overrideReason.trim()}
            >
              Confirm Override
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
