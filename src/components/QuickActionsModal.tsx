import React, { useState } from 'react';
import { Product, Category, CartItem, ParkedBill } from '../types';
import {
  X,
  Plus,
  Sparkles,
  PauseCircle,
  PlayCircle,
  Percent,
  Scissors,
  Tag,
  Clock,
  Layers,
  Check,
} from 'lucide-react';

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomItemToCart: (item: CartItem, saveToCatalog: boolean) => void;
  onApplyDiscount: (type: 'flat' | 'percent', val: number) => void;
  cart: CartItem[];
  customerName: string;
  customerPhone: string;
  parkedBills: ParkedBill[];
  onParkCurrentBill: () => void;
  onResumeParkedBill: (bill: ParkedBill) => void;
  onDeleteParkedBill: (billId: string) => void;
  categories?: string[];
  units?: string[];
}

export const QuickActionsModal: React.FC<QuickActionsModalProps> = ({
  isOpen,
  onClose,
  onAddCustomItemToCart,
  onApplyDiscount,
  cart,
  customerName,
  customerPhone,
  parkedBills,
  onParkCurrentBill,
  onResumeParkedBill,
  onDeleteParkedBill,
  categories,
  units,
}) => {
  const [activeTab, setActiveTab] = useState<'custom_item' | 'parked_bills' | 'discounts'>('custom_item');

  // Custom Item Form
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<Category>('Clothes');
  const [customPrice, setCustomPrice] = useState('');
  const [customQty, setCustomQty] = useState('1');
  const [customUnit, setCustomUnit] = useState('pcs');
  const [saveToCatalog, setSaveToCatalog] = useState(false);

  if (!isOpen) return null;

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      alert('Kripya item ka naam daalein!');
      return;
    }
    const priceNum = parseFloat(customPrice);
    const qtyNum = parseInt(customQty, 10) || 1;
    if (isNaN(priceNum) || priceNum < 0) {
      alert('Kripya sahi Price daalein!');
      return;
    }

    const uniqueCode = 'CUST-' + Math.floor(10000 + Math.random() * 90000);

    const newItem: CartItem = {
      productId: 'custom-' + Date.now(),
      name: customName.trim(),
      category: customCategory,
      price: priceNum,
      quantity: qtyNum,
      barcode: uniqueCode,
      unit: customUnit,
      total: priceNum * qtyNum,
    };

    onAddCustomItemToCart(newItem, saveToCatalog);
    setCustomName('');
    setCustomPrice('');
    setCustomQty('1');
    setSaveToCatalog(false);
    onClose();
  };

  // Instant pre-set common garment & cosmetic services
  const quickTemplates = [
    { name: 'Fall & Pico Work (Saree)', price: 80, cat: 'Clothes' as Category },
    { name: 'Blouse Alteration & Stitching', price: 250, cat: 'Clothes' as Category },
    { name: 'Gift Packing & Box Wrapping', price: 50, cat: 'General' as Category },
    { name: 'Extra Premium Dupatta Matching', price: 199, cat: 'Clothes' as Category },
    { name: 'Bridal Bindi & Safety Pin Kit', price: 40, cat: 'Cosmetics' as Category },
    { name: 'Emergency Hair Spray / Styling', price: 150, cat: 'Cosmetics' as Category },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-amber-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7B001C] to-[#560013] text-white p-4 flex items-center justify-between border-b-2 border-[#FFC107]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FFC107] text-[#560013] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Quick Actions (त्वरित क्रियाएँ)</h3>
              <p className="text-xs text-amber-200">Billing shortcut tools & custom items</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-3 pt-2 gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('custom_item')}
            className={`px-3 py-2 rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'custom_item'
                ? 'bg-white text-[#7B001C] border-t-2 border-t-[#7B001C] shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> + Custom Item
          </button>

          <button
            onClick={() => setActiveTab('parked_bills')}
            className={`px-3 py-2 rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'parked_bills'
                ? 'bg-white text-[#7B001C] border-t-2 border-t-[#7B001C] shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <PauseCircle className="w-3.5 h-3.5" /> Hold / Park Bill ({parkedBills.length})
          </button>

          <button
            onClick={() => setActiveTab('discounts')}
            className={`px-3 py-2 rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'discounts'
                ? 'bg-white text-[#7B001C] border-t-2 border-t-[#7B001C] shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Percent className="w-3.5 h-3.5" /> Quick Discounts
          </button>
        </div>

        {/* Tab 1: Custom Item On The Fly */}
        {activeTab === 'custom_item' && (
          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
            {/* Quick Template chips */}
            <div>
              <span className="text-[11px] font-bold text-stone-600 block mb-1.5">
                Quick 1-Tap Service Items:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {quickTemplates.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCustomName(t.name);
                      setCustomPrice(t.price.toString());
                      setCustomCategory(t.cat);
                    }}
                    className="p-2 text-left rounded-lg bg-stone-50 hover:bg-amber-50 hover:border-amber-300 border border-stone-200 transition-colors flex justify-between items-center"
                  >
                    <span className="font-medium text-stone-800 truncate mr-1">{t.name}</span>
                    <span className="font-bold text-[#7B001C] font-mono shrink-0">₹{t.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Item Form */}
            <form onSubmit={handleAddCustom} className="space-y-3 pt-2 border-t border-stone-200">
              <span className="text-[11px] font-bold text-stone-800 block">
                Naya Custom Item Daalein (Add to Current Bill):
              </span>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  Item Description / Name *
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Silk Dupatta Matching, Alteration, Special Packing..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none focus:border-[#7B001C] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Category</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-2 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none"
                  >
                    {(categories || ['Clothes', 'Cosmetics', 'Jewellery', 'General']).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Rate (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="Price"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono outline-none focus:border-[#7B001C] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={customQty}
                    onChange={(e) => setCustomQty(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1 text-stone-700">
                <input
                  type="checkbox"
                  checked={saveToCatalog}
                  onChange={(e) => setSaveToCatalog(e.target.checked)}
                  className="rounded text-[#7B001C] focus:ring-[#7B001C]"
                />
                <span className="text-[11px]">
                  Is item ko store catalog (stock list) me bhi save karein
                </span>
              </label>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#7B001C] hover:bg-[#560013] text-[#FFC107] font-bold rounded-xl text-xs shadow transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Cart Me Jodein (Add to Bill)
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Park / Hold Bill */}
        {activeTab === 'parked_bills' && (
          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <PauseCircle className="w-4 h-4 text-amber-700" /> Current Bill Ko Hold Karein:
                </span>
                <span className="text-[11px] text-amber-800 font-mono">
                  {cart.length} items in cart
                </span>
              </div>
              <p className="text-[11px] text-stone-600 mb-2">
                Agar grahak aur kapde pasand kar raha hai aur line me doosra grahak khada hai, toh
                is bill ko hold par rakh kar doosra bill shuru kar sakte hain.
              </p>
              <button
                type="button"
                disabled={cart.length === 0}
                onClick={() => {
                  onParkCurrentBill();
                  onClose();
                }}
                className="w-full py-2 bg-amber-600 disabled:opacity-40 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <PauseCircle className="w-4 h-4" />
                Current Cart Hold / Park Karein
              </button>
            </div>

            <div>
              <span className="text-[11px] font-bold text-stone-700 block mb-2">
                Parked / On-Hold Bills ({parkedBills.length}):
              </span>

              {parkedBills.length === 0 ? (
                <div className="text-center py-6 text-stone-400">
                  Koi bhi bill hold par nahi hai.
                </div>
              ) : (
                <div className="space-y-2">
                  {parkedBills.map((pb) => (
                    <div
                      key={pb.id}
                      className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-stone-900">
                          {pb.customerName || 'Walk-in Customer'}
                        </div>
                        <div className="text-[10px] text-stone-500 font-mono">
                          {pb.items.length} items • Total: ₹
                          {pb.items.reduce((a, b) => a + b.total, 0)} • {pb.timestamp}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            onResumeParkedBill(pb);
                            onClose();
                          }}
                          className="px-2.5 py-1.5 bg-[#7B001C] hover:bg-[#560013] text-[#FFC107] font-bold rounded-lg text-xs flex items-center gap-1"
                        >
                          <PlayCircle className="w-3.5 h-3.5" /> Resume
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteParkedBill(pb.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Quick Discounts */}
        {activeTab === 'discounts' && (
          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
            <div>
              <span className="text-[11px] font-bold text-stone-700 block mb-2">
                Percentage (% Discount) Presets:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      onApplyDiscount('percent', pct);
                      onClose();
                    }}
                    className="py-3 px-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-sm text-center shadow-xs transition-colors"
                  >
                    {pct}% Off
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-stone-700 block mb-2">
                Flat Rupee (₹ Discount) Presets:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[50, 100, 200, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      onApplyDiscount('flat', amt);
                      onClose();
                    }}
                    className="py-3 px-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-[#7B001C] hover:text-[#FFC107] text-stone-800 font-bold text-sm text-center shadow-xs transition-colors"
                  >
                    -₹{amt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
          >
            Band Karein (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
