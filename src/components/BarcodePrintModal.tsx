import React, { useState } from 'react';
import { Product, StoreSettings } from '../types';
import { X, Printer, Tag } from 'lucide-react';
import { BarcodeRenderer } from './BarcodeRenderer';

interface BarcodePrintModalProps {
  product: Product;
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const BarcodePrintModal: React.FC<BarcodePrintModalProps> = ({
  product,
  settings,
  isOpen,
  onClose,
}) => {
  const [labelCount, setLabelCount] = useState<number>(12);
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showShopName, setShowShopName] = useState<boolean>(true);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-amber-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7B001C] to-[#560013] text-white p-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#FFC107]" />
            <div>
              <h3 className="font-bold text-base">Barcode Tag / Sticker Print</h3>
              <p className="text-xs text-amber-200">
                {product.name} ({product.barcode})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Bar - Hidden during print */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-4 text-xs">
            <div>
              <label className="font-semibold text-stone-700 mr-2">Quantity:</label>
              <select
                value={labelCount}
                onChange={(e) => setLabelCount(Number(e.target.value))}
                className="bg-white border border-stone-300 rounded px-2 py-1 outline-none font-medium"
              >
                <option value={1}>1 Label</option>
                <option value={4}>4 Labels</option>
                <option value={8}>8 Labels</option>
                <option value={12}>12 Labels (Sheet)</option>
                <option value={24}>24 Labels (Full Sheet)</option>
              </select>
            </div>

            <label className="inline-flex items-center gap-1.5 cursor-pointer text-stone-700">
              <input
                type="checkbox"
                checked={showPrice}
                onChange={(e) => setShowPrice(e.target.checked)}
                className="rounded text-[#7B001C] focus:ring-[#7B001C]"
              />
              Show Price
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer text-stone-700">
              <input
                type="checkbox"
                checked={showShopName}
                onChange={(e) => setShowShopName(e.target.checked)}
                className="rounded text-[#7B001C] focus:ring-[#7B001C]"
              />
              Show Shop Name
            </label>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFC107] hover:bg-amber-400 text-stone-900 font-bold text-xs rounded-lg shadow transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Stickers
          </button>
        </div>

        {/* Labels Printable Area */}
        <div id="printableBarcodeSheet" className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 print:grid-cols-3 print:gap-2">
            {Array.from({ length: labelCount }).map((_, index) => (
              <div
                key={index}
                className="border border-stone-300 rounded-lg p-2.5 flex flex-col items-center justify-center text-center bg-white shadow-xs print:border-black print:shadow-none"
              >
                {showShopName && (
                  <div className="text-[10px] font-extrabold uppercase tracking-tight text-[#7B001C] print:text-black truncate w-full">
                    {settings.shopName}
                  </div>
                )}
                <div className="text-[11px] font-semibold text-stone-800 print:text-black line-clamp-1 w-full my-0.5">
                  {product.name}
                </div>
                <div className="w-full flex justify-center my-1 scale-90 sm:scale-100">
                  <BarcodeRenderer
                    value={product.barcode}
                    width={1.2}
                    height={32}
                    fontSize={9}
                    displayValue={true}
                  />
                </div>
                {showPrice && (
                  <div className="text-xs font-black text-stone-900 print:text-black mt-0.5">
                    MRP: ₹{product.price}
                    <span className="text-[9px] font-normal text-stone-500 ml-1">
                      (Inc. Taxes)
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex justify-end no-print">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg"
          >
            Band Karein (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
