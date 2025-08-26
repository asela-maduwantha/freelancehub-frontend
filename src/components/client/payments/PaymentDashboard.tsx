"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { 
  CreditCard, 
  DollarSign, 
  Clock, 
  CheckCircle,
  XCircle,
  Download,
  ArrowRightLeft,
  Shield,
  Calendar,
  User
} from "lucide-react";
import Link from "next/link";

interface Payment {
  id: string;
  contractId: string;
  milestoneId?: string;
  amount: number;
  status: string;
  type: string;
  paymentMethod: string;
  createdAt: string;
  processedAt?: string;
  projectTitle: string;
  freelancerName: string;
}

interface PaymentDashboardProps {
  payments: Payment[];
  isLoading: boolean;
  onPaymentAction: (paymentId: string, action: string, data?: any) => void;
  onEscrowRelease: (contractId: string, milestoneId: string, amount: number) => void;
  onPaymentUpdate: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "PROCESSED": return "bg-green-100 text-green-800";
    case "PENDING": return "bg-yellow-100 text-yellow-800";
    case "FAILED": return "bg-red-100 text-red-800";
    case "REFUNDED": return "bg-gray-100 text-gray-800";
    case "ESCROW": return "bg-blue-100 text-blue-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "PROCESSED": return CheckCircle;
    case "PENDING": return Clock;
    case "FAILED": return XCircle;
    case "REFUNDED": return ArrowRightLeft;
    case "ESCROW": return Shield;
    default: return Clock;
  }
};

const getPaymentMethodIcon = (method: string) => {
  switch (method) {
    case "credit_card": return CreditCard;
    case "paypal": return DollarSign;
    case "bank_transfer": return ArrowRightLeft;
    default: return CreditCard;
  }
};

const PaymentCard = ({ payment, onAction, onEscrowRelease }: {
  payment: Payment;
  onAction: (paymentId: string, action: string, data?: any) => void;
  onEscrowRelease: (contractId: string, milestoneId: string, amount: number) => void;
}) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const StatusIcon = getStatusIcon(payment.status);
  const PaymentIcon = getPaymentMethodIcon(payment.paymentMethod);

  const handleAction = async (action: string, data?: any) => {
    setActionLoading(action);
    try {
      if (action === "release_escrow" && payment.milestoneId) {
        await onEscrowRelease(payment.contractId, payment.milestoneId, payment.amount);
      } else {
        await onAction(payment.id, action, data);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {payment.projectTitle}
                </h3>
                <Badge className={getStatusColor(payment.status)}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {payment.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{payment.freelancerName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <PaymentIcon className="h-4 w-4" />
                  <span className="capitalize">{payment.paymentMethod.replace("_", " ")}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ${payment.amount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 capitalize">
                {payment.type.replace("_", " ")}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Payment Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Created:</span>
                <div className="font-medium">{formatDate(payment.createdAt)}</div>
              </div>
              {payment.processedAt && (
                <div>
                  <span className="text-gray-600">Processed:</span>
                  <div className="font-medium">{formatDate(payment.processedAt)}</div>
                </div>
              )}
              <div>
                <span className="text-gray-600">Payment ID:</span>
                <div className="font-mono text-xs">{payment.id}</div>
              </div>
              <div>
                <span className="text-gray-600">Contract:</span>
                <div className="font-mono text-xs">{payment.contractId}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              {payment.status === "PENDING" && payment.type === "milestone_payment" && (
                <Button
                  size="sm"
                  onClick={() => handleAction("capture")}
                  disabled={actionLoading === "capture"}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {actionLoading === "capture" ? "Processing..." : "Release Payment"}
                </Button>
              )}

              {payment.status === "ESCROW" && (
                <Button
                  size="sm"
                  onClick={() => handleAction("release_escrow")}
                  disabled={actionLoading === "release_escrow"}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {actionLoading === "release_escrow" ? "Releasing..." : "Release Escrow"}
                </Button>
              )}

              {payment.status === "PROCESSED" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction("partial_refund", { amount: payment.amount * 0.5 })}
                  disabled={actionLoading === "partial_refund"}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  {actionLoading === "partial_refund" ? "Processing..." : "Request Refund"}
                </Button>
              )}

              <Button variant="outline" size="sm" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Receipt
              </Button>

              <Link href={`/client/contracts/${payment.contractId}`}>
                <Button variant="outline" size="sm">
                  View Contract
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const PaymentSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="animate-pulse">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 rounded flex-1"></div>
          <div className="h-8 bg-gray-200 rounded flex-1"></div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export function PaymentDashboard({ 
  payments, 
  isLoading, 
  onPaymentAction, 
  onEscrowRelease, 
  onPaymentUpdate 
}: PaymentDashboardProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <PaymentSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
          <CreditCard className="w-full h-full" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
        <p className="text-gray-500 mb-6">
          Your payment history will appear here once you start working with freelancers
        </p>
        <Link href="/client/projects">
          <Button>View Your Projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {payments.map((payment) => (
        <PaymentCard
          key={payment.id}
          payment={payment}
          onAction={onPaymentAction}
          onEscrowRelease={onEscrowRelease}
        />
      ))}
    </div>
  );
}
