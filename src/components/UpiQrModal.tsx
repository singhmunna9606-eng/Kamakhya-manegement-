import React from 'react';
import { X, CheckCircle, Smartphone } from 'lucide-react';
import { StoreSettings } from '../types';

interface UpiQrModalProps {
  amount: number;
  invoiceNo?: string;
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  onPaymentReceived: () => void;
}

export const UpiQrModal: React.FC<UpiQrModalProps> = ({
  amount,
  invoiceNo,
  settings,
  isOpen,
  onClose,
  onPaymentReceived,
}) => {
  if (!isOpen) return null;

  const upiId = settings.upiId || 'kamakhya@upi';
  const shopNameEncoded = encodeURIComponent(settings.shopName);
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${shopNameEncoded}&am=${amount}&cu=INR&tn=${encodeURIComponent(invoiceNo || 'Bill Payment')}`;
  
  // Use reliable QR API for UPI URI
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiUri)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-amber-200">
        <div className="bg-gradient-to-r from-[#7B001C] to-[#560013] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#FFC107]" />
            <div>
              <h3 className="font-bold text-sm">UPI Payment QR</h3>
              <p className="text-[11px] text-amber-200">GPay, PhonePe, Paytm, BHIM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col items-center text-center">
          <div className="text-xs text-stone-500 mb-1">Total Bill Amount</div>
          <div className="text-3xl font-extrabold text-[#7B001C] mb-3">
            ₹{amount.toLocaleString('en-IN')}
          </div>

          <div className="p-3 bg-white border-2 border-stone-200 rounded-2xl shadow-inner mb-3">
            <img
              src={qrUrl}
              alt="UPI Payment QR Code"
              className="w-48 h-48 object-contain rounded-lg"
              loading="eager"
            />
          </div>

          <div className="text-xs text-stone-600 space-y-1">
            <p>
              UPI ID:{' '}
              <span className="font-mono font-semibold text-stone-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {upiId}
              </span>
            </p>
            <p className="text-[11px] text-stone-400">
              Grahak se kahein kisi bhi UPI App se scan karein
            </p>
          </div>

          <div className="mt-5 w-full flex flex-col gap-2">
            <button
              onClick={() => {
                onPaymentReceived();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Payment Ho Gaya (Mark as Paid)
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-stone-500 hover:text-stone-800 text-xs font-medium"
            >
              Radd Karein (Cancel)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
