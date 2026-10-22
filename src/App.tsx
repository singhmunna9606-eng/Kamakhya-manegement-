/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Product,
  Customer,
  Invoice,
  StoreSettings,
} from './types';
import {
  DEFAULT_SETTINGS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_INVOICES,
} from './initialData';
import { BillingTab } from './components/BillingTab';
import { StockTab } from './components/StockTab';
import { CustomersTab } from './components/CustomersTab';
import { ReportsTab } from './components/ReportsTab';
import { SettingsTab } from './components/SettingsTab';
import {
  Receipt,
  Boxes,
  Users,
  BarChart3,
  Settings,
  ShoppingBag,
  Bell,
  Sparkles,
} from 'lucide-react';

const PRODUCTS_KEY = 'kamakhya_products';
const CUSTOMERS_KEY = 'kamakhya_customers';
const INVOICES_KEY = 'kamakhya_invoices';
const SETTINGS_KEY = 'kamakhya_settings';

export default function App() {
  // Load settings
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Load products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(PRODUCTS_KEY);
      return stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Load customers
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const stored = localStorage.getItem(CUSTOMERS_KEY);
      return stored ? JSON.parse(stored) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  // Load invoices
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const stored = localStorage.getItem(INVOICES_KEY);
      return stored ? JSON.parse(stored) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    'billing' | 'stock' | 'customers' | 'reports' | 'settings'
  >('billing');

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  }, [invoices]);

  // Invoice creation handler
  const handleInvoiceGenerated = (newInvoice: Invoice, updatedProducts: Product[]) => {
    setInvoices((prev) => [newInvoice, ...prev]);
    setProducts(updatedProducts);

    // Update customer history or create new customer
    if (newInvoice.customerPhone) {
      setCustomers((prev) => {
        const existingIdx = prev.findIndex((c) => c.phone === newInvoice.customerPhone);
        if (existingIdx >= 0) {
          const updated = [...prev];
          const current = updated[existingIdx];
          updated[existingIdx] = {
            ...current,
            name: newInvoice.customerName || current.name,
            totalSpent: current.totalSpent + newInvoice.grandTotal,
            visitCount: current.visitCount + 1,
            lastVisit: newInvoice.date,
            balanceDue:
              newInvoice.status === 'Due'
                ? current.balanceDue + newInvoice.grandTotal
                : current.balanceDue,
          };
          return updated;
        } else {
          const newCust: Customer = {
            id: 'cust-' + Date.now(),
            name: newInvoice.customerName || 'Customer',
            phone: newInvoice.customerPhone,
            totalSpent: newInvoice.grandTotal,
            visitCount: 1,
            lastVisit: newInvoice.date,
            balanceDue: newInvoice.status === 'Due' ? newInvoice.grandTotal : 0,
          };
          return [newCust, ...prev];
        }
      });
    }
  };

  // Stock operations
  const handleAddProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // Customer operations
  const handleAddCustomer = (newCust: Customer) => {
    setCustomers((prev) => [newCust, ...prev]);
  };

  const handleUpdateCustomer = (updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  // Restore backup
  const handleRestoreAllData = (data: {
    products: Product[];
    customers: Customer[];
    invoices: Invoice[];
    settings: StoreSettings;
  }) => {
    setProducts(data.products);
    setCustomers(data.customers);
    setInvoices(data.invoices);
    setSettings(data.settings);
  };

  // Quick header stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRevenue = invoices
    .filter((inv) => inv.date === todayStr)
    .reduce((acc, inv) => acc + inv.grandTotal, 0);

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-8">
      {/* 1. Header with Royal Maroon & Golden Branding + Stylized K Logo */}
      <header className="bg-gradient-to-r from-[#7B001C] via-[#650017] to-[#560013] text-white border-b-4 border-[#FFC107] shadow-md sticky top-0 z-40 no-print">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo & Shop Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#560013] border-2 border-[#FFC107] rounded-xl flex items-center justify-center shadow-md shrink-0">
              <span className="text-[#FFC107] font-serif font-black text-2xl drop-shadow-sm select-none">
                K
              </span>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-[#FFC107] tracking-wide leading-tight truncate max-w-[200px] sm:max-w-md">
                {settings.shopName}
              </h1>
              <p className="text-[11px] text-amber-100/90 font-medium tracking-normal flex items-center gap-1.5">
                <span>Kamakhya Management POS</span>
                <span className="hidden sm:inline text-white/40">•</span>
                <span className="hidden sm:inline text-amber-200/80">{settings.phone}</span>
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('billing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'billing'
                  ? 'bg-[#FFC107] text-[#560013] shadow'
                  : 'text-stone-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              Billing
            </button>

            <button
              onClick={() => setActiveTab('stock')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'stock'
                  ? 'bg-[#FFC107] text-[#560013] shadow'
                  : 'text-stone-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              Stock & Barcode
              {lowStockCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[10px]">
                  {lowStockCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'customers'
                  ? 'bg-[#FFC107] text-[#560013] shadow'
                  : 'text-stone-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Customers & Bills
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'reports'
                  ? 'bg-[#FFC107] text-[#560013] shadow'
                  : 'text-stone-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Reports
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'bg-[#FFC107] text-[#560013] shadow'
                  : 'text-stone-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </button>
          </nav>

          {/* Quick Header Badge */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[10px] text-amber-200 uppercase font-semibold">
                Aaj Ki Bikri
              </span>
              <span className="text-xs font-bold font-mono text-[#FFC107]">
                ₹{todayRevenue.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="bg-[#FFC107] text-stone-900 px-2.5 py-1 rounded-lg text-xs font-black tracking-wide shadow-xs">
              PRO
            </span>
          </div>
        </div>
      </header>

      {/* 2. Main Content Body */}
      <main className="max-w-6xl mx-auto px-4 py-5 flex-1 w-full">
        {activeTab === 'billing' && (
          <BillingTab
            products={products}
            customers={customers}
            settings={settings}
            onInvoiceGenerated={handleInvoiceGenerated}
            onAddOrUpdateCustomer={handleAddCustomer}
          />
        )}

        {activeTab === 'stock' && (
          <StockTab
            products={products}
            settings={settings}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersTab
            customers={customers}
            invoices={invoices}
            settings={settings}
            onAddCustomer={handleAddCustomer}
            onUpdateCustomer={handleUpdateCustomer}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsTab invoices={invoices} products={products} settings={settings} />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            settings={settings}
            products={products}
            customers={customers}
            invoices={invoices}
            onSaveSettings={setSettings}
            onRestoreAllData={handleRestoreAllData}
          />
        )}
      </main>

      {/* 3. Mobile Sticky Bottom Navigation Bar (as requested in user's prompt) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-stone-200 shadow-xl z-50 flex justify-around py-1.5 px-1 no-print">
        <button
          onClick={() => setActiveTab('billing')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
            activeTab === 'billing' ? 'text-[#7B001C] font-bold' : 'text-stone-500'
          }`}
        >
          <Receipt className="w-5 h-5 mb-0.5" />
          <span>Billing</span>
        </button>

        <button
          onClick={() => setActiveTab('stock')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors relative ${
            activeTab === 'stock' ? 'text-[#7B001C] font-bold' : 'text-stone-500'
          }`}
        >
          <Boxes className="w-5 h-5 mb-0.5" />
          <span>Stock</span>
          {lowStockCount > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-red-600"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
            activeTab === 'customers' ? 'text-[#7B001C] font-bold' : 'text-stone-500'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>Grahak</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
            activeTab === 'reports' ? 'text-[#7B001C] font-bold' : 'text-stone-500'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span>Reports</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
            activeTab === 'settings' ? 'text-[#7B001C] font-bold' : 'text-stone-500'
          }`}
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}
