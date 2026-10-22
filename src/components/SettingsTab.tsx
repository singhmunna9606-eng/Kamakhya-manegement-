import React, { useState } from 'react';
import {
  StoreSettings,
  Product,
  Customer,
  Invoice,
  InvoiceStyle,
  HardwareConfig,
  BrandingConfig,
  LowStockConfig,
  DeviceLayoutMode,
} from '../types';
import {
  Settings,
  Store,
  Palette,
  Layers,
  AlertTriangle,
  Smartphone,
  Monitor,
  Printer,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Plus,
  X,
  Sliders,
  Type,
  Maximize2,
  Volume2,
  HelpCircle,
  FileText,
  CreditCard,
  Zap,
} from 'lucide-react';
import { INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_INVOICES, DEFAULT_SETTINGS } from '../initialData';

interface SettingsTabProps {
  settings: StoreSettings;
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  onSaveSettings: (settings: StoreSettings) => void;
  onRestoreAllData: (data: {
    products: Product[];
    customers: Customer[];
    invoices: Invoice[];
    settings: StoreSettings;
  }) => void;
  onUpdateProducts?: (products: Product[]) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  products,
  customers,
  invoices,
  onSaveSettings,
  onRestoreAllData,
  onUpdateProducts,
}) => {
  const [formData, setFormData] = useState<StoreSettings>({
    ...DEFAULT_SETTINGS,
    ...settings,
    branding: { ...DEFAULT_SETTINGS.branding, ...settings.branding },
    lowStock: { ...DEFAULT_SETTINGS.lowStock, ...settings.lowStock },
    invoiceConfig: { ...DEFAULT_SETTINGS.invoiceConfig, ...settings.invoiceConfig },
    categories: settings.categories || DEFAULT_SETTINGS.categories,
    units: settings.units || DEFAULT_SETTINGS.units,
    paymentMethods: settings.paymentMethods || DEFAULT_SETTINGS.paymentMethods,
  });

  const [activeSubSection, setActiveSubSection] = useState<
    'store' | 'branding' | 'categories' | 'lowstock' | 'device' | 'invoice' | 'backup' | 'apk'
  >('branding');

  const [savedAlert, setSavedAlert] = useState(false);

  // New item inputs for categories/units/payment
  const [newCatInput, setNewCatInput] = useState('');
  const [newUnitInput, setNewUnitInput] = useState('');
  const [newPayInput, setNewPayInput] = useState('');

  // Low stock restock inputs
  const [restockProductAmounts, setRestockProductAmounts] = useState<{ [id: string]: number }>({});

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveSettings(formData);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  // Add category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newCatInput.trim();
    if (!val) return;
    if (formData.categories.includes(val)) {
      alert('Ye category pehle se maujood hai!');
      return;
    }
    const updated = [...formData.categories, val];
    const newSettings = { ...formData, categories: updated };
    setFormData(newSettings);
    onSaveSettings(newSettings);
    setNewCatInput('');
  };

  // Remove category
  const handleRemoveCategory = (catToRemove: string) => {
    if (formData.categories.length <= 1) {
      alert('Kam se kam 1 category hona zaroori hai!');
      return;
    }
    if (confirm(`Kya aap "${catToRemove}" category hatana chahte hain?`)) {
      const updated = formData.categories.filter((c) => c !== catToRemove);
      const newSettings = { ...formData, categories: updated };
      setFormData(newSettings);
      onSaveSettings(newSettings);
    }
  };

  // Add unit
  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newUnitInput.trim().toLowerCase();
    if (!val) return;
    if (formData.units.includes(val)) {
      alert('Ye unit pehle se maujood hai!');
      return;
    }
    const updated = [...formData.units, val];
    const newSettings = { ...formData, units: updated };
    setFormData(newSettings);
    onSaveSettings(newSettings);
    setNewUnitInput('');
  };

  // Remove unit
  const handleRemoveUnit = (unitToRemove: string) => {
    if (formData.units.length <= 1) return;
    const updated = formData.units.filter((u) => u !== unitToRemove);
    const newSettings = { ...formData, units: updated };
    setFormData(newSettings);
    onSaveSettings(newSettings);
  };

  // Add payment method
  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newPayInput.trim();
    if (!val) return;
    if (formData.paymentMethods.includes(val)) return;
    const updated = [...formData.paymentMethods, val];
    const newSettings = { ...formData, paymentMethods: updated };
    setFormData(newSettings);
    onSaveSettings(newSettings);
    setNewPayInput('');
  };

  // Remove payment method
  const handleRemovePaymentMethod = (pmToRemove: string) => {
    if (formData.paymentMethods.length <= 1) return;
    const updated = formData.paymentMethods.filter((p) => p !== pmToRemove);
    const newSettings = { ...formData, paymentMethods: updated };
    setFormData(newSettings);
    onSaveSettings(newSettings);
  };

  // Theme presets definitions
  const themePresets = [
    {
      id: 'maroon_gold',
      name: 'Royal Maroon & Gold (Original)',
      primary: '#7B001C',
      dark: '#560013',
      accent: '#FFC107',
      accentLight: '#FFE082',
      bg: '#fbfbf9',
    },
    {
      id: 'navy_gold',
      name: 'Imperial Navy & Amber',
      primary: '#0F172A',
      dark: '#020617',
      accent: '#F59E0B',
      accentLight: '#FDE68A',
      bg: '#f8fafc',
    },
    {
      id: 'emerald_gold',
      name: 'Royal Emerald & Gold',
      primary: '#064E3B',
      dark: '#022C22',
      accent: '#FBBF24',
      accentLight: '#FDE68A',
      bg: '#f8faf7',
    },
    {
      id: 'crimson_rose',
      name: 'Dulhan Crimson & Rose',
      primary: '#881337',
      dark: '#4C0519',
      accent: '#FB7185',
      accentLight: '#FECDD3',
      bg: '#fff5f7',
    },
    {
      id: 'violet_gold',
      name: 'Luxury Violet & Gold',
      primary: '#4C1D95',
      dark: '#2E1065',
      accent: '#FCD34D',
      accentLight: '#FEF3C7',
      bg: '#faf5ff',
    },
    {
      id: 'charcoal_minimal',
      name: 'Modern Charcoal & Amber',
      primary: '#1C1917',
      dark: '#0C0A09',
      accent: '#F59E0B',
      accentLight: '#FDE68A',
      bg: '#f5f5f4',
    },
  ];

  // Quick Re-Stock action for low stock items
  const handleQuickRestock = (productId: string, addQty: number) => {
    if (!onUpdateProducts) return;
    const updated = products.map((p) => (p.id === productId ? { ...p, stock: p.stock + addQty } : p));
    onUpdateProducts(updated);
    alert(`Stock me +${addQty} pieces add ho gaye!`);
  };

  // Toggle Fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Export all shop data as JSON file
  const handleExportBackup = () => {
    const backupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      settings: formData,
      products,
      customers,
      invoices,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kamakhya_full_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.products && parsed.settings) {
          onRestoreAllData({
            products: parsed.products || [],
            customers: parsed.customers || [],
            invoices: parsed.invoices || [],
            settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
          });
          setFormData({ ...DEFAULT_SETTINGS, ...parsed.settings });
          alert('Backup safaltapoorvak restore ho gaya!');
        } else {
          alert('Galat backup file format!');
        }
      } catch {
        alert('File read karne me error aayi!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reload default sample catalog
  const handleReloadSampleData = () => {
    if (
      window.confirm(
        'Kya aap shuruwaati Sample Catalog (Saree, Kurti, Cosmetics etc.) dobara load karna chahte hain?'
      )
    ) {
      onRestoreAllData({
        products: INITIAL_PRODUCTS,
        customers: INITIAL_CUSTOMERS,
        invoices: INITIAL_INVOICES,
        settings: DEFAULT_SETTINGS,
      });
      setFormData(DEFAULT_SETTINGS);
      alert('Sample catalog safalta se load ho gaya!');
    }
  };

  // Clear all data
  const handleClearAll = () => {
    if (
      window.confirm(
        'Savdhaani! Kya aap sachme saara data (products, bills, customers) hatana chahte hain?'
      )
    ) {
      onRestoreAllData({
        products: [],
        customers: [],
        invoices: [],
        settings: DEFAULT_SETTINGS,
      });
      setFormData(DEFAULT_SETTINGS);
      alert('Saara data clear kar diya gaya.');
    }
  };

  // Low stock products count
  const lowStockThreshold = formData.lowStock?.defaultThreshold || 5;
  const lowStockItems = products.filter((p) => p.stock <= (p.minStock || lowStockThreshold));

  return (
    <div className="space-y-6">
      {savedAlert && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Sabhi settings safaltapoorvak update ho gayi! (Settings Saved)
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-stone-200 shadow-xs flex flex-wrap gap-1 text-xs font-bold">
        {[
          { id: 'branding', label: '🎨 Icon, Fonts & Theme', icon: Palette },
          { id: 'categories', label: '📦 Categories & Units', icon: Layers },
          { id: 'lowstock', label: `⚠️ Low Stock Alerts (${lowStockItems.length})`, icon: AlertTriangle },
          { id: 'device', label: '📱 Phone vs Computer View', icon: Smartphone },
          { id: 'invoice', label: '🧾 Bill & Invoice Print', icon: FileText },
          { id: 'store', label: '🏪 Store Profile & GST', icon: Store },
          { id: 'backup', label: '💾 Backup & Reset', icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubSection(tab.id as typeof activeSubSection)}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-[#7B001C] text-[#FFC107] shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          SECTION 1: BRANDING, APP ICON, FONTS & THEMES
         ======================================================== */}
      {activeSubSection === 'branding' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-[#7B001C] border-stone-200 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#7B001C]" />
                App Logo, Fonts & Theme Rang (Customization)
              </h2>
              <p className="text-xs text-stone-500">
                Aap app ka icon, font family, aur poora rang-roop yahan se badal sakte hain.
              </p>
            </div>
            <button
              onClick={() => handleSaveAll()}
              className="px-4 py-2 bg-[#7B001C] hover:bg-[#560013] text-[#FFC107] font-bold text-xs rounded-xl shadow-xs"
            >
              Changes Apply Karein
            </button>
          </div>

          {/* 1. App Logo / Icon Customization */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <span className="font-bold text-stone-800 text-xs block">
              1. App Logo / Icon Type:
            </span>
            <div className="flex flex-wrap gap-4 items-center">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                <input
                  type="radio"
                  name="logoType"
                  value="letter"
                  checked={formData.branding.logoType === 'letter'}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      branding: { ...formData.branding, logoType: 'letter' },
                    })
                  }
                  className="text-[#7B001C] focus:ring-[#7B001C]"
                />
                Stylized Royal Letter Crest (Akshar Logo)
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                <input
                  type="radio"
                  name="logoType"
                  value="custom_image"
                  checked={formData.branding.logoType === 'custom_image'}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      branding: { ...formData.branding, logoType: 'custom_image' },
                    })
                  }
                  className="text-[#7B001C] focus:ring-[#7B001C]"
                />
                Custom Photo / Image Logo URL
              </label>
            </div>

            <div className="flex items-center gap-4 pt-1">
              {formData.branding.logoType === 'letter' ? (
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#560013] border-2 border-[#FFC107] text-[#FFC107] font-serif font-black text-3xl flex items-center justify-center shadow-md">
                    {formData.branding.logoLetter || 'K'}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Logo Letter (Type 1-2 Letters e.g. K, KP, S):
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      value={formData.branding.logoLetter}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          branding: { ...formData.branding, logoLetter: e.target.value.toUpperCase() },
                        })
                      }
                      className="w-24 px-3 py-1.5 border border-stone-300 rounded-xl text-center font-serif text-lg font-bold uppercase bg-white outline-none focus:border-[#7B001C]"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 space-y-1">
                  <label className="block text-[11px] font-semibold text-stone-600">
                    Logo Image URL / Web Link:
                  </label>
                  <input
                    type="url"
                    value={formData.branding.customLogoUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        branding: { ...formData.branding, customLogoUrl: e.target.value },
                      })
                    }
                    placeholder="https://example.com/shop-logo.png"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white outline-none focus:border-[#7B001C]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 2. Font Family Selection */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <span className="font-bold text-stone-800 text-xs block flex items-center gap-1.5">
              <Type className="w-4 h-4 text-[#7B001C]" /> 2. App Font Style (Font Family):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'poppins', label: 'Poppins', desc: 'Modern & Clean (Default)' },
                { id: 'inter', label: 'Inter', desc: 'Tech & Crisp' },
                { id: 'roboto', label: 'Roboto', desc: 'High Readability' },
                { id: 'outfit', label: 'Outfit', desc: 'Retail & Fashion' },
                { id: 'playfair', label: 'Playfair Display', desc: 'Royal & Bridal Serif' },
                { id: 'georgia', label: 'Georgia', desc: 'Classic Elegant' },
                { id: 'mono', label: 'Monospace', desc: 'POS Terminal Style' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      branding: { ...formData.branding, fontFamily: f.id as BrandingConfig['fontFamily'] },
                    })
                  }
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    formData.branding.fontFamily === f.id
                      ? 'border-[#7B001C] bg-white ring-2 ring-[#7B001C]/20 text-[#7B001C] font-bold shadow-xs'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className={`text-sm ${f.id === 'playfair' ? 'font-serif' : f.id === 'mono' ? 'font-mono' : ''}`}>
                    {f.label}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Theme Presets & Color Customization */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <span className="font-bold text-stone-800 text-xs block">
              3. Theme Color Presets (Thyme):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {themePresets.map((preset) => {
                const isSelected = formData.branding.themePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        branding: {
                          ...formData.branding,
                          themePreset: preset.id,
                          primaryColor: preset.primary,
                          primaryDark: preset.dark,
                          accentColor: preset.accent,
                          accentLight: preset.accentLight,
                          bgColor: preset.bg,
                        },
                      })
                    }
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#7B001C] bg-white ring-2 ring-[#7B001C]/20 shadow-xs'
                        : 'border-stone-200 bg-white hover:bg-stone-100'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-stone-900">{preset.name}</div>
                      <div className="flex gap-1.5 mt-1.5">
                        <span
                          className="w-4 h-4 rounded-full border border-stone-300"
                          style={{ backgroundColor: preset.primary }}
                          title="Primary"
                        ></span>
                        <span
                          className="w-4 h-4 rounded-full border border-stone-300"
                          style={{ backgroundColor: preset.accent }}
                          title="Accent"
                        ></span>
                        <span
                          className="w-4 h-4 rounded-full border border-stone-300"
                          style={{ backgroundColor: preset.bg }}
                          title="Background"
                        ></span>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Hex Color Pickers */}
            <div className="pt-3 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Primary Brand Color:
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={formData.branding.primaryColor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        branding: {
                          ...formData.branding,
                          primaryColor: e.target.value,
                          themePreset: 'custom',
                        },
                      })
                    }
                    className="w-9 h-9 rounded-lg border border-stone-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={formData.branding.primaryColor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        branding: { ...formData.branding, primaryColor: e.target.value },
                      })
                    }
                    className="flex-1 px-2.5 py-1.5 text-xs font-mono border border-stone-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Accent / Golden Highlight Color:
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={formData.branding.accentColor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        branding: {
                          ...formData.branding,
                          accentColor: e.target.value,
                          themePreset: 'custom',
                        },
                      })
                    }
                    className="w-9 h-9 rounded-lg border border-stone-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={formData.branding.accentColor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        branding: { ...formData.branding, accentColor: e.target.value },
                      })
                    }
                    className="flex-1 px-2.5 py-1.5 text-xs font-mono border border-stone-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Background Tint:
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={formData.branding.bgColor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        branding: {
                          ...formData.branding,
                          bgColor: e.target.value,
                          themePreset: 'custom',
                        },
                      })
                    }
                    className="w-9 h-9 rounded-lg border border-stone-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={formData.branding.bgColor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        branding: { ...formData.branding, bgColor: e.target.value },
                      })
                    }
                    className="flex-1 px-2.5 py-1.5 text-xs font-mono border border-stone-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 2: DYNAMIC CATEGORIES, UNITS & PAYMENT METHODS
         ======================================================== */}
      {activeSubSection === 'categories' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-[#FFC107] border-stone-200 space-y-6">
          <div className="border-b border-stone-100 pb-3">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#7B001C]" />
              Categories, Units & Payment Methods (Add / Remove Sabhi Cheezein)
            </h2>
            <p className="text-xs text-stone-500">
              Yahan se aap nayi category jod sakte hain ya purani hata sakte hain.
            </p>
          </div>

          {/* 1. Manage Product Categories */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800 text-xs">
                Product Categories ({formData.categories.length}):
              </span>
              <span className="text-[11px] text-stone-400">Clothes, Cosmetics, Jewellery, etc.</span>
            </div>

            {/* List of current categories */}
            <div className="flex flex-wrap gap-2">
              {formData.categories.map((cat) => (
                <div
                  key={cat}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-stone-800 shadow-2xs"
                >
                  <span>{cat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(cat)}
                    className="text-stone-400 hover:text-red-600 rounded-full p-0.5"
                    title={`Remove ${cat}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new category form */}
            <form onSubmit={handleAddCategory} className="flex gap-2 pt-2 border-t border-stone-200">
              <input
                type="text"
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                placeholder="Nayi category likhein (e.g. Footwear, Bangles, Perfumes)..."
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-xl outline-none focus:border-[#7B001C]"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#7B001C] hover:bg-[#560013] text-[#FFC107] font-bold text-xs rounded-xl shadow-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Category
              </button>
            </form>
          </div>

          {/* 2. Manage Units */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <span className="font-bold text-stone-800 text-xs block">
              Units of Measurement ({formData.units.length}):
            </span>
            <div className="flex flex-wrap gap-2">
              {formData.units.map((u) => (
                <div
                  key={u}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-stone-800 shadow-2xs font-mono"
                >
                  <span>{u}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveUnit(u)}
                    className="text-stone-400 hover:text-red-600 rounded-full p-0.5"
                    title={`Remove ${u}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddUnit} className="flex gap-2 pt-2 border-t border-stone-200">
              <input
                type="text"
                value={newUnitInput}
                onChange={(e) => setNewUnitInput(e.target.value)}
                placeholder="Naya unit likhein (e.g. mtr, doz, roll, bundle)..."
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-xl outline-none focus:border-[#7B001C]"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Unit
              </button>
            </form>
          </div>

          {/* 3. Manage Payment Modes */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <span className="font-bold text-stone-800 text-xs block">
              Bhugtan Ke Tarike / Payment Modes ({formData.paymentMethods.length}):
            </span>
            <div className="flex flex-wrap gap-2">
              {formData.paymentMethods.map((pm) => (
                <div
                  key={pm}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-stone-800 shadow-2xs"
                >
                  <span>{pm}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePaymentMethod(pm)}
                    className="text-stone-400 hover:text-red-600 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddPaymentMethod} className="flex gap-2 pt-2 border-t border-stone-200">
              <input
                type="text"
                value={newPayInput}
                onChange={(e) => setNewPayInput(e.target.value)}
                placeholder="Naya Payment Method (e.g. PhonePe QR, Paytm Soundbox, Cheque)..."
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-xl outline-none focus:border-[#7B001C]"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#FFC107] hover:bg-amber-400 text-stone-900 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Payment Mode
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 3: LOW STOCK ALERT SETTINGS & RESTOCK
         ======================================================== */}
      {activeSubSection === 'lowstock' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-amber-500 border-stone-200 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Low Stock Alert Settings (कम स्टॉक चेतावनी)
              </h2>
              <p className="text-xs text-stone-500">
                Item khatam hone se pehle alert pane ke niyam set karein.
              </p>
            </div>
            <button
              onClick={() => handleSaveAll()}
              className="px-4 py-2 bg-[#7B001C] hover:bg-[#560013] text-[#FFC107] font-bold text-xs rounded-xl shadow-xs"
            >
              Settings Save Karein
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <span className="font-bold text-stone-800 text-xs block">
                Alert Preferences:
              </span>

              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={formData.lowStock?.enabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lowStock: { ...formData.lowStock, enabled: e.target.checked },
                    })
                  }
                  className="rounded text-[#7B001C] focus:ring-[#7B001C]"
                />
                <span className="font-semibold text-stone-800">Low Stock Alerts Enable</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={formData.lowStock?.soundAlert}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lowStock: { ...formData.lowStock, soundAlert: e.target.checked },
                    })
                  }
                  className="rounded text-[#7B001C] focus:ring-[#7B001C]"
                />
                <span className="text-stone-700 flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-stone-500" />
                  Billing par item kam hone par Audio Warning Beep bajayein
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={formData.lowStock?.highlightRows}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lowStock: { ...formData.lowStock, highlightRows: e.target.checked },
                    })
                  }
                  className="rounded text-[#7B001C] focus:ring-[#7B001C]"
                />
                <span className="text-stone-700">Stock Table me kam pieces wale item ko Red highlight karein</span>
              </label>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Default Low Stock Alert Quantity (Pieces):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.lowStock?.defaultThreshold || 5}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lowStock: {
                          ...formData.lowStock,
                          defaultThreshold: parseInt(e.target.value, 10) || 5,
                        },
                      })
                    }
                    className="w-24 px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-center font-bold text-sm outline-none focus:border-[#7B001C]"
                  />
                  <span className="text-xs text-stone-500">
                    piece se kam hone par warning alert aayega
                  </span>
                </div>
              </div>
            </div>

            {/* Current Low Stock Items Card */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  Abhi Khatam Hone Wale Items ({lowStockItems.length}):
                </span>
              </div>

              {lowStockItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-emerald-700 font-medium">
                  Badhai ho! Sabhi items ka stock surakshit (safe) hai.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {lowStockItems.map((p) => (
                    <div
                      key={p.id}
                      className="p-2 bg-white rounded-lg border border-amber-200 flex items-center justify-between text-xs"
                    >
                      <div className="truncate mr-2">
                        <div className="font-semibold text-stone-800 truncate">{p.name}</div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          Remaining: <strong className="text-red-700">{p.stock} {p.unit}</strong> (Min: {p.minStock})
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleQuickRestock(p.id, 10)}
                          className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded font-bold text-[10px]"
                        >
                          +10 pcs
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickRestock(p.id, 25)}
                          className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-bold text-[10px]"
                        >
                          +25 pcs
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 4: PHONE VS COMPUTER VIEW (DEVICE LAYOUT)
         ======================================================== */}
      {activeSubSection === 'device' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-blue-600 border-stone-200 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                Phone & Computer POS Display Settings
              </h2>
              <p className="text-xs text-stone-500">
                Aap is app ko mobile phone par bhi chala sakte hain aur computer par bhi.
              </p>
            </div>
            <button
              onClick={toggleFullScreen}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold"
            >
              <Maximize2 className="w-3.5 h-3.5" /> Fullscreen Mode
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'auto',
                label: 'Auto Detect (Automatic)',
                desc: 'Screen size dekhkar phone ya desktop layout apne aap set karega.',
                icon: RefreshCw,
              },
              {
                id: 'phone',
                label: 'Mobile / Phone Optimized',
                desc: 'Badi buttons, compact tables aur mobile thumb-friendly navigation bar.',
                icon: Smartphone,
              },
              {
                id: 'desktop',
                label: 'Computer / Desktop POS',
                desc: 'Dual-column cashier screen, hardware shortcuts aur full receipt pane.',
                icon: Monitor,
              },
            ].map((m) => {
              const Icon = m.icon;
              const isSel = formData.layoutMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    const updated = { ...formData, layoutMode: m.id as DeviceLayoutMode };
                    setFormData(updated);
                    onSaveSettings(updated);
                  }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSel
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 ${isSel ? 'text-blue-600' : 'text-stone-500'}`} />
                    {isSel && <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">Active</span>}
                  </div>
                  <div className="font-bold text-xs text-stone-900">{m.label}</div>
                  <div className="text-[11px] text-stone-500 mt-1 leading-relaxed">{m.desc}</div>
                </button>
              );
            })}
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-stone-800 block">Compact Screen Density:</span>
              <span className="text-stone-500 text-[11px]">Tables aur rows ki spacing kam karke zyada items screen par dikhayein.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.compactDensity}
                onChange={(e) => {
                  const updated = { ...formData, compactDensity: e.target.checked };
                  setFormData(updated);
                  onSaveSettings(updated);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7B001C]"></div>
            </label>
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 5: INVOICE & PRINT CUSTOMIZATION
         ======================================================== */}
      {activeSubSection === 'invoice' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-[#7B001C] border-stone-200 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#7B001C]" />
                Bill & Invoice Customization
              </h2>
              <p className="text-xs text-stone-500">
                Aap bill ke template, terms, bank details aur QR code options yahan se badal sakte hain.
              </p>
            </div>
            <button
              onClick={() => handleSaveAll()}
              className="px-4 py-2 bg-[#7B001C] hover:bg-[#560013] text-[#FFC107] font-bold text-xs rounded-xl shadow-xs"
            >
              Save Settings
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Default Invoice Template (8 Styles):
              </label>
              <select
                value={formData.invoiceTemplate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    invoiceTemplate: e.target.value as InvoiceStyle,
                  })
                }
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:border-[#7B001C] font-semibold text-[#7B001C]"
              >
                <option value="modern">1. Royal Maroon & Gold (Modern Signature)</option>
                <option value="classic">2. Classic Clean Receipt</option>
                <option value="thermal80">3. Thermal POS 80mm (3-Inch Roll)</option>
                <option value="thermal58">4. Thermal POS 58mm (2-Inch Mini Bluetooth)</option>
                <option value="gst">5. Official GST Tax Invoice (Detailed A4)</option>
                <option value="festive">6. Dulhan / Bridal Boutique Style</option>
                <option value="monochrome">7. Minimalist Modern Monochrome</option>
                <option value="khata">8. Desi Bahi-Khata (Shubh-Laabh)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Invoice Number Prefix (Bill Code):
              </label>
              <input
                type="text"
                value={formData.invoiceConfig.prefix}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    invoiceConfig: { ...formData.invoiceConfig, prefix: e.target.value },
                  })
                }
                placeholder="e.g. KCC-, BILL-, INV-"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:border-[#7B001C] font-mono"
              />
            </div>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.invoiceConfig.showLogo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    invoiceConfig: { ...formData.invoiceConfig, showLogo: e.target.checked },
                  })
                }
                className="rounded text-[#7B001C] focus:ring-[#7B001C]"
              />
              <span className="font-semibold text-stone-700">Show Shop Logo on Bill</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.invoiceConfig.showBarcode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    invoiceConfig: { ...formData.invoiceConfig, showBarcode: e.target.checked },
                  })
                }
                className="rounded text-[#7B001C] focus:ring-[#7B001C]"
              />
              <span className="font-semibold text-stone-700">Show Bill Barcode</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.invoiceConfig.showUpiQr}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    invoiceConfig: { ...formData.invoiceConfig, showUpiQr: e.target.checked },
                  })
                }
                className="rounded text-[#7B001C] focus:ring-[#7B001C]"
              />
              <span className="font-semibold text-stone-700">Show UPI Payment QR</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Custom Terms & Conditions (Bill Ke Niyam):
            </label>
            <textarea
              rows={3}
              value={formData.invoiceConfig.termsText}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  invoiceConfig: { ...formData.invoiceConfig, termsText: e.target.value },
                })
              }
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none focus:border-[#7B001C]"
            />
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 6: STORE PROFILE & GST
         ======================================================== */}
      {activeSubSection === 'store' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-[#FFC107] border-stone-200 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-[#7B001C]" />
                Dukan Ki Jankari (Store Profile)
              </h2>
            </div>
            <button
              onClick={() => handleSaveAll()}
              className="px-4 py-2 bg-[#FFC107] hover:bg-amber-400 text-stone-900 font-bold text-xs rounded-xl shadow-xs"
            >
              Update Profile
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Dukan Ka Naam *</label>
              <input
                type="text"
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:border-[#7B001C]"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:border-[#7B001C]"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Phone / Mobile *</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Doosra Phone</label>
              <input
                type="text"
                value={formData.secondaryPhone}
                onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Dukan Ka Pata (Address) *</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none focus:border-[#7B001C]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">GSTIN Number</label>
              <input
                type="text"
                value={formData.gst}
                onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">UPI ID (QR Payment)</label>
              <input
                type="text"
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 7: BACKUP, RESTORE & PURGE
         ======================================================== */}
      {activeSubSection === 'backup' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 space-y-4">
          <div>
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-[#7B001C]" />
              Data Backup, Export & Restore
            </h2>
            <p className="text-xs text-stone-500">
              Aap apne dukan ke sabhi products, categories, grahak aur bills ka poora backup JSON me le sakte hain.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={handleExportBackup}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Download className="w-4 h-4" /> Full Backup Download Karein (JSON)
            </button>

            <label className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold cursor-pointer border border-stone-300">
              <Upload className="w-4 h-4" />
              Backup File Upload Karein (Restore)
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>

            <button
              onClick={handleReloadSampleData}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-semibold"
            >
              <RefreshCw className="w-4 h-4 text-amber-700" />
              Sample Catalog Dobara Load Karein
            </button>

            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-semibold ml-auto"
            >
              <Trash2 className="w-4 h-4" />
              Sab Clear Karein (Reset)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
