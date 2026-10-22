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
  AlertTriangle,
  Smartphone,
  Monitor,
  ChevronRight,
} from 'lucide-react';

const PRODUCTS_KEY = 'kamakhya_products';
const CUSTOMERS_KEY = 'kamakhya_customers';
const INVOICES_KEY = 'kamakhya_invoices';
const SETTINGS_KEY = 'kamakhya_settings';

export default function App() {
  // Load settings with fallback merging
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          branding: { ...DEFAULT_SETTINGS.branding, ...(parsed.branding || {}) },
          lowStock: { ...DEFAULT_SETTINGS.lowStock, ...(parsed.lowStock || {}) },
          invoiceConfig: { ...DEFAULT_SETTINGS.invoiceConfig, ...(parsed.invoiceConfig || {}) },
          categories: parsed.categories || DEFAULT_SETTINGS.categories,
          units: parsed.units || DEFAULT_SETTINGS.units,
          paymentMethods: parsed.paymentMethods || DEFAULT_SETTINGS.paymentMethods,
        };
      }
      return DEFAULT_SETTINGS;
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

  // Low stock dismiss banner state
  const [hideLowStockBanner, setHideLowStockBanner] = useState(false);

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

  const defaultThreshold = settings.lowStock?.defaultThreshold || 5;
  const lowStockCount = products.filter(
    (p) => p.stock <= (p.minStock !== undefined ? p.minStock : defaultThreshold)
  ).length;

  // Branding variables
  const branding = settings.branding || DEFAULT_SETTINGS.branding;
  const primaryColor = branding.primaryColor || '#7B001C';
  const primaryDark = branding.primaryDark || '#560013';
  const accentColor = branding.accentColor || '#FFC107';
  const fontClass = `font-${branding.fontFamily || 'poppins'}`;

  // Layout mode constraints
  const isPhoneMode = settings.layoutMode === 'phone';
  const isDesktopMode = settings.layoutMode === 'desktop';

  return (
    <div
      className={`min-h-screen flex flex-col pb-20 md:pb-8 ${fontClass}`}
      style={{ backgroundColor: branding.bgColor || '#fbfbf9' }}
    >
      {/* Low Stock Urgent Top Banner (if enabled in settings) */}
      {settings.lowStock?.bannerAlert && lowStockCount > 0 && !hideLowStockBanner && (
        <div className="bg-red-600 text-white px-4 py-2 text-xs flex items-center justify-between no-print shadow-md z-50">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-300 animate-bounce shrink-0" />
            <span>
              <strong>Kam Stock Alert:</strong> {lowStockCount} items khatam hone ki kagar par hain (Stock limit reach ho chuki hai)!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('stock')}
              className="px-2.5 py-0.5 bg-white text-red-700 font-bold rounded-lg text-[11px] hover:bg-stone-100 flex items-center gap-1 shadow-xs"
            >
              Stock Check Karein <ChevronRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => setHideLowStockBanner(true)}
              className="text-white/80 hover:text-white font-bold px-1"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 1. Header with Fully Customizable Branding, Logo, & Theme Colors */}
      <header
        className="text-white shadow-md sticky top-0 z-40 no-print"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${primaryDark})`,
          borderBottom: `4px solid ${accentColor}`,
        }}
      >
        <div
          className={`mx-auto px-4 py-3 flex items-center justify-between gap-4 ${
            isPhoneMode ? 'max-w-md' : isDesktopMode ? 'max-w-7xl' : 'max-w-6xl'
          }`}
        >
          {/* Logo & Shop Title */}
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md shrink-0 overflow-hidden"
              style={{
                backgroundColor: primaryDark,
                border: `2px solid ${accentColor}`,
              }}
            >
              {branding.logoType === 'custom_image' && branding.customLogoUrl ? (
                <img
                  src={branding.customLogoUrl}
                  alt={settings.shopName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to letter if image fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <span
                  className="font-serif font-black text-2xl drop-shadow-sm select-none"
                  style={{ color: accentColor }}
                >
                  {branding.logoLetter || 'K'}
                </span>
              )}
            </div>

            <div>
              <h1
                className="text-base sm:text-lg font-bold tracking-wide leading-tight truncate max-w-[200px] sm:max-w-md"
                style={{ color: accentColor }}
              >
                {settings.shopName}
              </h1>
              <p className="text-[11px] text-amber-100/90 font-medium tracking-normal flex items-center gap-1.5">
                <span>{settings.tagline || 'Kamakhya Management POS'}</span>
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
                  ? 'text-stone-900 shadow'
                  : 'text-stone-200 hover:text-white hover:bg-white/10'
              }`}
              style={{
                backgroundColor: activeTab === 'billing' ? accentColor : 'transparent',
              }}
            >
              <Receipt className="w-3.5 h-3.5" />
              Billing
            </button>

            <button
              onClick={() => setActiveTab('stock')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'stock'
                  ? 'text-stone-900 shadow'
                  : 'text-stone-200 hover:text-white hover:bg-white/10'
              }`}
              style={{
                backgroundColor: activeTab === 'stock' ? accentColor : 'transparent',
              }}
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
                  ? 'text-stone-900 shadow'
                  : 'text-stone-200 hover:text-white hover:bg-white/10'
              }`}
              style={{
                backgroundColor: activeTab === 'customers' ? accentColor : 'transparent',
              }}
            >
              <Users className="w-3.5 h-3.5" />
              Customers & Bills
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'reports'
                  ? 'text-stone-900 shadow'
                  : 'text-stone-200 hover:text-white hover:bg-white/10'
              }`}
              style={{
                backgroundColor: activeTab === 'reports' ? accentColor : 'transparent',
              }}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Reports
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'text-stone-900 shadow'
                  : 'text-stone-200 hover:text-white hover:bg-white/10'
              }`}
              style={{
                backgroundColor: activeTab === 'settings' ? accentColor : 'transparent',
              }}
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
              <span
                className="text-xs font-bold font-mono"
                style={{ color: accentColor }}
              >
                ₹{todayRevenue.toLocaleString('en-IN')}
              </span>
            </div>
            <span
              className="text-stone-900 px-2.5 py-1 rounded-lg text-xs font-black tracking-wide shadow-xs"
              style={{ backgroundColor: accentColor }}
            >
              PRO
            </span>
          </div>
        </div>
      </header>

      {/* 2. Main Content Body with Responsive or Device Layout Constraints */}
      <main
        className={`mx-auto px-4 py-5 flex-1 w-full ${
          isPhoneMode
            ? 'max-w-md border-x border-stone-200 bg-white shadow-sm'
            : isDesktopMode
            ? 'max-w-7xl'
            : 'max-w-6xl'
        }`}
      >
        {activeTab === 'billing' && (
          <BillingTab
            products={products}
            customers={customers}
            settings={settings}
            onInvoiceGenerated={handleInvoiceGenerated}
            onAddOrUpdateCustomer={handleAddCustomer}
            onAddProduct={handleAddProduct}
            onUpdateHardware={(hw) => setSettings((s) => ({ ...s, hardware: hw }))}
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
            onUpdateProducts={(prods) => setProducts(prods)}
          />
        )}
      </main>

      {/* 3. Mobile / Phone Sticky Bottom Navigation Bar */}
      <div
        className={`${
          isDesktopMode ? 'hidden' : 'md:hidden'
        } fixed bottom-0 left-0 right-0 bg-white border-t-2 border-stone-200 shadow-xl z-50 flex justify-around py-1.5 px-1 no-print`}
      >
        <button
          onClick={() => setActiveTab('billing')}
          className="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors"
          style={{
            color: activeTab === 'billing' ? primaryColor : '#718096',
            fontWeight: activeTab === 'billing' ? 'bold' : 'normal',
          }}
        >
          <Receipt className="w-5 h-5 mb-0.5" />
          <span>Billing</span>
        </button>

        <button
          onClick={() => setActiveTab('stock')}
          className="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors relative"
          style={{
            color: activeTab === 'stock' ? primaryColor : '#718096',
            fontWeight: activeTab === 'stock' ? 'bold' : 'normal',
          }}
        >
          <Boxes className="w-5 h-5 mb-0.5" />
          <span>Stock</span>
          {lowStockCount > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-red-600"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors"
          style={{
            color: activeTab === 'customers' ? primaryColor : '#718096',
            fontWeight: activeTab === 'customers' ? 'bold' : 'normal',
          }}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>Grahak</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors"
          style={{
            color: activeTab === 'reports' ? primaryColor : '#718096',
            fontWeight: activeTab === 'reports' ? 'bold' : 'normal',
          }}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span>Reports</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors"
          style={{
            color: activeTab === 'settings' ? primaryColor : '#718096',
            fontWeight: activeTab === 'settings' ? 'bold' : 'normal',
          }}
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}
