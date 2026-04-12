// Transaction & Payment Types for Admin

export type TransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "disputed"
  | "cancelled";

export type TransactionType =
  | "subscription"
  | "booking"
  | "service_fee"
  | "refund"
  | "adjustment";

export type PaymentGateway = "flutterwave" | "paystack" | "stripe" | "manual";

export interface Transaction {
  _id: string;
  transactionId: string;
  userId: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  gateway: PaymentGateway;
  gatewayTransactionId?: string;
  gatewayResponse?: any;
  description: string;
  metadata?: {
    subscriptionId?: string;
    bookingId?: string;
    eventId?: string;
    [key: string]: any;
  };
  paymentMethod: string;
  refundedAmount?: number;
  refundReason?: string;
  refundedAt?: Date;
  disputedAt?: Date;
  disputeReason?: string;
  disputeResolvedAt?: Date;
  disputeResolution?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
}

export interface TransactionDetails extends Transaction {
  refundHistory: RefundRecord[];
  disputeHistory: DisputeRecord[];
  relatedTransactions: Transaction[];
}

export interface RefundRecord {
  _id: string;
  transactionId: string;
  amount: number;
  reason: string;
  status: "pending" | "completed" | "failed";
  gatewayRefundId?: string;
  processedBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  completedAt?: Date;
}

export interface DisputeRecord {
  _id: string;
  transactionId: string;
  reason: string;
  status: "open" | "investigating" | "resolved" | "closed";
  reportedBy: {
    _id: string;
    name: string;
    email: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  resolution?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface PaymentAnalytics {
  totalTransactions: number;
  totalVolume: number;
  successfulTransactions: number;
  failedTransactions: number;
  refundedTransactions: number;
  disputedTransactions: number;
  successRate: number;
  averageTransactionValue: number;
  totalRefundAmount: number;
  byGateway: {
    [key in PaymentGateway]?: {
      count: number;
      volume: number;
      successRate: number;
    };
  };
  byType: {
    [key in TransactionType]?: {
      count: number;
      volume: number;
    };
  };
  byStatus: {
    [key in TransactionStatus]?: number;
  };
  revenueByDay: {
    date: string;
    revenue: number;
    transactions: number;
  }[];
  topUsers: {
    userId: string;
    userName: string;
    totalSpent: number;
    transactionCount: number;
  }[];
}

export interface ReconciliationReport {
  _id: string;
  period: {
    start: Date;
    end: Date;
  };
  gateway: PaymentGateway;
  platformRecords: {
    count: number;
    totalAmount: number;
    transactions: string[];
  };
  gatewayRecords: {
    count: number;
    totalAmount: number;
    transactions: string[];
  };
  matched: {
    count: number;
    totalAmount: number;
    transactions: string[];
  };
  discrepancies: {
    missingInPlatform: {
      count: number;
      totalAmount: number;
      transactions: any[];
    };
    missingInGateway: {
      count: number;
      totalAmount: number;
      transactions: string[];
    };
    amountMismatch: {
      count: number;
      transactions: {
        transactionId: string;
        platformAmount: number;
        gatewayAmount: number;
        difference: number;
      }[];
    };
  };
  status: "pending" | "completed" | "requires_action";
  generatedBy: string;
  generatedAt: Date;
  notes?: string;
}

export interface TransactionFilters {
  status?: TransactionStatus;
  type?: TransactionType;
  gateway?: PaymentGateway;
  userId?: string;
  transactionId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface ExportOptions {
  format: "csv" | "excel" | "pdf";
  filters?: TransactionFilters;
  fields?: string[];
  includeGatewayResponse?: boolean;
}
