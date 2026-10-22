export type Category = 'Clothes' | 'Cosmetics' | 'Jewellery' | 'General';

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  barcode: string;
  unit: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  category: Category;
  price: number;
  quantity: number;
  barcode: string;
  unit: string;
  discountPercent?: number;
  total: number;
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
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Due';
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
  invoiceTemplate: 'modern' | 'classic' | 'thermal';
  language: 'hinglish' | 'hindi' | 'english';
  defaultTaxPercent: number;
}
