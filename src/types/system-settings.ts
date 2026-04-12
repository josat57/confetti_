// System Settings Types for Admin

export interface SystemSettings {
  _id: string;
  general: GeneralSettings;
  payment: PaymentSettings;
  email: EmailSettings;
  sms: SmsSettings;
  security: SecuritySettings;
  features: FeatureSettings;
  updatedBy: string;
  updatedAt: Date;
}

export interface GeneralSettings {
  siteName: string;
  siteUrl: string;
  supportEmail: string;
  supportPhone: string;
  timezone: string;
  currency: string;
  language: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
}

export interface PaymentSettings {
  flutterwave: {
    enabled: boolean;
    publicKey: string;
    secretKey: string;
    webhookSecret: string;
    testMode: boolean;
  };
  paystack: {
    enabled: boolean;
    publicKey: string;
    secretKey: string;
    webhookSecret: string;
    testMode: boolean;
  };
  defaultGateway: "flutterwave" | "paystack";
  serviceFeePercentage: number;
  minimumTransactionAmount: number;
  maximumTransactionAmount: number;
}

export interface EmailSettings {
  provider: "sendgrid" | "mailgun" | "ses" | "smtp";
  fromEmail: string;
  fromName: string;
  replyToEmail: string;
  smtp?: {
    host: string;
    port: number;
    username: string;
    password: string;
    secure: boolean;
  };
  apiKey?: string;
  templates: EmailTemplate[];
}

export interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  category: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SmsSettings {
  provider: "twilio" | "termii" | "africas_talking";
  enabled: boolean;
  accountSid?: string;
  authToken?: string;
  apiKey?: string;
  senderId: string;
  testMode: boolean;
}

export interface SecuritySettings {
  sessionTimeout: number; // in minutes
  maxLoginAttempts: number;
  lockoutDuration: number; // in minutes
  require2FA: boolean;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  passwordExpiryDays: number;
  allowedIpAddresses: string[];
  blockedIpAddresses: string[];
}

export interface FeatureSettings {
  aiEventPlanner: boolean;
  vendorBooking: boolean;
  guestManagement: boolean;
  budgetTracking: boolean;
  documentManagement: boolean;
  teamCollaboration: boolean;
  mobileApp: boolean;
  apiAccess: boolean;
}

export interface SubscriptionTierConfig {
  _id: string;
  name: string;
  tier: "free" | "basic" | "professional" | "enterprise";
  price: {
    monthly: number;
    yearly: number;
  };
  currency: string;
  features: string[];
  limits: {
    events: number | null; // null = unlimited
    guests: number | null;
    vendors: number | null;
    storage: number | null; // in MB
    teamMembers: number | null;
    aiRequests: number | null;
  };
  active: boolean;
  popular: boolean;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureFlag {
  _id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetUsers: string[];
  targetRoles: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingsUpdateRequest {
  section: "general" | "payment" | "email" | "sms" | "security" | "features";
  settings: Partial<
    | GeneralSettings
    | PaymentSettings
    | EmailSettings
    | SmsSettings
    | SecuritySettings
    | FeatureSettings
  >;
}
