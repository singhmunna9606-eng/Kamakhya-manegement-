export type Category = string;

export type InvoiceStyle =
  | 'modern'
  | 'classic'
  | 'thermal80'
  | 'thermal58'
  | 'gst'
  | 'festive'
  | 'monochrome'
  | 'khata';

export type DeviceLayoutMode = 'auto' | 'phone' | 'desktop';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  barcode: string;
  unit: string;
  createdAt: string;
  hsnCode?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  barcode: string;
  unit: string;
  discountPercent?: number;
  total: number;
  hsnCode?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  taxAmount: number;
  taxPercent: number;
  grandTotal: number;
  paymentMode: string;
  amountReceived: number;
  changeDue: number;
  status: 'Paid' | 'Partial' | 'Due';
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  totalSpent: number;
  visitCount: number;
  lastVisit: string;
  balanceDue: number;
}

export interface ParkedBill {
  id: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  timestamp: string;
  notes?: string;
}

export interface HardwareConfig {
  scannerGunEnabled: boolean;
  scannerGunBeep: boolean;
  scannerPrefix: string;
  scannerSuffix: string;
  printerType: 'browser' | 'thermal80' | 'thermal58' | 'bluetooth' | 'network';
  printerIp?: string;
  printerPort?: number;
  autoPrintOnBill: boolean;
  printCutPaper: boolean;
}

export interface BrandingConfig {
  logoType: 'letter' | 'custom_image';
  logoLetter: string;
  customLogoUrl: string;
  themePreset: string;
  primaryColor: string;
  primaryDark: string;
  accentColor: string;
  accentLight: string;
  bgColor: string;
  fontFamily: 'poppins' | 'inter' | 'roboto' | 'outfit' | 'playfair' | 'georgia' | 'mono';
  enableShadows: boolean;
  roundedCorners: 'rounded-none' | 'rounded-lg' | 'rounded-xl' | 'rounded-2xl';
}

export interface LowStockConfig {
  enabled: boolean;
  defaultThreshold: number;
  soundAlert: boolean;
  bannerAlert: boolean;
  highlightRows: boolean;
  notifyOnZero: boolean;
}

export interface InvoiceCustomization {
  prefix: string;
  showLogo: boolean;
  showBarcode: boolean;
  showUpiQr: boolean;
  showTerms: boolean;
  termsText: string;
  stateCode: string;
  bankDetails: string;
}

export interface StoreSettings {
  shopName: string;
  tagline: string;
  phone: string;
  secondaryPhone: string;
  address: string;
  gst: string;
  upiId: string;
  footerMessage: string;
  currency: string;
  invoiceTemplate: InvoiceStyle;
  language: 'hinglish' | 'hindi' | 'english';
  defaultTaxPercent: number;
  hardware: HardwareConfig;
  branding: BrandingConfig;
  lowStock: LowStockConfig;
  invoiceConfig: InvoiceCustomization;
  categories: string[];
  units: string[];
  paymentMethods: string[];
  layoutMode: DeviceLayoutMode;
  compactDensity: boolean;
}
