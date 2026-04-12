// Vendor Verification Types for Admin

export interface VendorVerification {
  _id: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  businessName: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  documents: {
    businessRegistration?: VerificationDocument;
    idVerification?: VerificationDocument;
    taxCertificate?: VerificationDocument;
    insurance?: VerificationDocument;
  };
  submittedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
}

export interface VerificationDocument {
  url: string;
  fileName: string;
  fileType: string;
  uploadedAt: Date;
}

export interface VendorPerformance {
  vendorId: string;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageRating: number;
  totalReviews: number;
  totalRevenue: number;
  responseTime: number; // in hours
  completionRate: number; // percentage
}

export interface VendorDetails {
  _id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  category: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
  };
  pricing: {
    startingPrice: number;
    currency: string;
  };
  status: "active" | "suspended" | "pending";
  verified: boolean;
  registrationDate: Date;
  performance?: VendorPerformance;
}
