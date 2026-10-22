import React, { useState } from 'react';
import { StoreSettings, Product, Customer, Invoice } from '../types';
import {
  Settings,
  Store,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  CheckCircle2,
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
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  products,
  customers,
  invoices,
  onSaveSettings,
  onRestoreAllData,
}) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [savedAlert, setSavedAlert] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  // Export all shop data as JSON file
  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
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
    a.download = `kamakhya_backup_${new Date().toISOString().split('T')[0]}.json`;
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

  return (
    <div className="space-y-6">
      {savedAlert && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Settings safaltapoorvak update ho gayi!
        </div>
      )}

      {/* 1. Store Details Form */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-[#FFC107] border-stone-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-[#7B001C]" />
            Dukan Ki Settings (Store Profile)
          </h2>
          <span className="text-xs text-stone-400">Ye details sabhi bills aur print par aayengi</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Dukan Ka Naam (Shop Name) *</label>
              <input
                type="text"
                required
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:border-[#7B001C]"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Tagline / Subtitle</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g. Complete Fashion & Beauty Collection"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:border-[#7B001C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Mobile Number / Phone *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:border-[#7B001C] font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Alternate Phone (Doosra Number)</label>
              <input
                type="text"
                value={formData.secondaryPhone}
                onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:border-[#7B001C] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Dukan Ka Pata (Address) *</label>
            <textarea
              rows={2}
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:border-[#7B001C]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">GSTIN Number (Optional)</label>
              <input
                type="text"
                value={formData.gst}
                onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                placeholder="Agar GST registration hai"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:border-[#7B001C] font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">UPI ID (QR Payment)</label>
              <input
                type="text"
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                placeholder="e.g. kamakhya@upi"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:border-[#7B001C] font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Default Bill Template</label>
              <select
                value={formData.invoiceTemplate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    invoiceTemplate: e.target.value as 'modern' | 'classic' | 'thermal',
                  })
                }
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:border-[#7B001C]"
              >
                <option value="modern">Royal Maroon (Modern)</option>
                <option value="classic">Classic Clean</option>
                <option value="thermal">Thermal POS (58mm/80mm)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Bill Footer Message / Sandesh</label>
            <input
              type="text"
              value={formData.footerMessage}
              onChange={(e) => setFormData({ ...formData, footerMessage: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:border-[#7B001C]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#FFC107] hover:bg-amber-400 text-stone-900 font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Settings Update Karein
            </button>
          </div>
        </form>
      </div>

      {/* 2. Data Backup & Reset */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 mb-2">
          <Download className="w-5 h-5 text-[#7B001C]" />
          Data Backup, Restore & Reset
        </h2>
        <p className="text-xs text-stone-500 mb-4">
          Aap apne poore data (products, grahak, aur bills) ka backup download kar sakte hain ya doosre computer par le jaa sakte hain.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportBackup}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" /> Backup Download Karein (Export JSON)
          </button>

          <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold cursor-pointer border border-stone-300 transition-colors">
            <Upload className="w-4 h-4" />
            Backup Upload Karein (Restore JSON)
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            onClick={handleReloadSampleData}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-amber-700" />
            Sample Products Dobara Dalein
          </button>

          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-semibold ml-auto transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Sab Clear Karein (Reset)
          </button>
        </div>
      </div>
    </div>
  );
};
