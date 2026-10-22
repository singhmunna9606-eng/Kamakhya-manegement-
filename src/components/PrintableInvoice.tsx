import React, { useState } from 'react';
import { Invoice, StoreSettings, InvoiceStyle } from '../types';
import { Printer, Share2, Copy, Check, X, QrCode, Sparkles, Building2, Heart } from 'lucide-react';
import { BarcodeRenderer } from './BarcodeRenderer';

interface PrintableInvoiceProps {
  invoice: Invoice;
  settings: StoreSettings;
  templateStyle?: InvoiceStyle;
  onClose?: () => void;
  onStyleChange?: (style: InvoiceStyle) => void;
}

// Helper to convert number to Indian words
function numberToIndianWords(num: number): string {
  const a = [
    '',
    'One ',
    'Two ',
    'Three ',
    'Four ',
    'Five ',
    'Six ',
    'Seven ',
    'Eight ',
    'Nine ',
    'Ten ',
    'Eleven ',
    'Twelve ',
    'Thirteen ',
    'Fourteen ',
    'Fifteen ',
    'Sixteen ',
    'Seventeen ',
    'Eighteen ',
    'Nineteen ',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if ((num = num || 0) === 0) return 'Zero Rupees Only';

  const n = ('000000000' + Math.floor(num)).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';

  let str = '';
  str += Number(n[1]) !== 0 ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + 'Crore ' : '';
  str += Number(n[2]) !== 0 ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + 'Lakh ' : '';
  str += Number(n[3]) !== 0 ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + 'Thousand ' : '';
  str += Number(n[4]) !== 0 ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + 'Hundred ' : '';
  str +=
    Number(n[5]) !== 0
      ? (str !== '' ? 'and ' : '') +
        (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) +
        'Rupees Only'
      : 'Rupees Only';

  return str.trim();
}

export const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({
  invoice,
  settings,
  templateStyle = 'modern',
  onClose,
  onStyleChange,
}) => {
  const [copied, setCopied] = useState(false);

  // Normalize legacy style names
  const activeStyle: InvoiceStyle =
    templateStyle === ('thermal' as unknown as InvoiceStyle) ? 'thermal80' : templateStyle;

  const handlePrint = () => {
    window.print();
  };

  const getWhatsAppMessage = (): string => {
    const itemLines = invoice.items
      .map(
        (it, idx) =>
          `${idx + 1}. ${it.name} x ${it.quantity} = ₹${it.total.toLocaleString('en-IN')}`
      )
      .join('\n');

    return `*--- ${settings.shopName.toUpperCase()} ---*
_Fashion & Cosmetics Management_
📍 ${settings.address}
📞 Phone: ${settings.phone}

*INVOICE / BILL:* ${invoice.invoiceNumber}
*Date:* ${invoice.date} | *Time:* ${invoice.time}
*Customer:* ${invoice.customerName} (${invoice.customerPhone || 'N/A'})
--------------------------------
${itemLines}
--------------------------------
Subtotal: ₹${invoice.subtotal.toLocaleString('en-IN')}
${invoice.discountAmount > 0 ? `Discount: -₹${invoice.discountAmount.toLocaleString('en-IN')}\n` : ''}${invoice.taxAmount > 0 ? `Tax/GST: +₹${invoice.taxAmount.toLocaleString('en-IN')}\n` : ''}*Net Total:* ₹${invoice.grandTotal.toLocaleString('en-IN')}
*Payment Mode:* ${invoice.paymentMode} (${invoice.status})
${settings.upiId ? `Pay via UPI: ${settings.upiId}\n` : ''}
_${settings.footerMessage}_`;
  };

  const handleWhatsAppShare = () => {
    const msg = encodeURIComponent(getWhatsAppMessage());
    let phone = invoice.customerPhone.replace(/[^0-9]/g, '');
    if (phone.length === 10) phone = '91' + phone;
    const url = phone ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(url, '_blank');
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(getWhatsAppMessage());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden my-4 print:m-0 print:border-none print:shadow-none">
      {/* Top action bar - Hidden during print */}
      <div className="bg-stone-50 border-b border-stone-200 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-600">Bill Style:</span>
          <select
            value={activeStyle}
            onChange={(e) => onStyleChange && onStyleChange(e.target.value as InvoiceStyle)}
            className="text-xs bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-bold text-[#7B001C] shadow-sm outline-none focus:border-[#7B001C]"
          >
            <option value="modern">1. Royal Maroon & Gold (Modern Signature)</option>
            <option value="classic">2. Classic Clean Receipt</option>
            <option value="thermal80">3. Thermal POS 80mm (3-Inch Roll)</option>
            <option value="thermal58">4. Thermal POS 58mm (2-Inch Mini Bluetooth)</option>
            <option value="gst">5. Official GST Tax Invoice (Detailed A4)</option>
            <option value="festive">6. Dulhan / Bridal Boutique Style (Pink & Gold)</option>
            <option value="monochrome">7. Minimalist Modern Monochrome (Studio)</option>
            <option value="khata">8. Desi Bahi-Khata (Shubh-Laabh Vyapar Slip)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyText}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-medium shadow-sm transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-sm transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            WhatsApp
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FFC107] hover:bg-amber-400 text-stone-900 text-xs font-bold shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Receipt
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div id="printableInvoice" className="p-4 sm:p-6 print:p-2 max-w-3xl mx-auto">
        {/* STYLE 1: ROYAL MAROON & GOLD (MODERN) */}
        {activeStyle === 'modern' && (
          <div className="border-2 border-[#7B001C] rounded-xl overflow-hidden bg-white shadow-sm print:border-stone-800">
            <div className="bg-gradient-to-r from-[#7B001C] to-[#560013] text-white p-5 text-center relative border-b-4 border-[#FFC107]">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#560013] border-2 border-[#FFC107] text-[#FFC107] font-serif font-black text-2xl shadow mb-2">
                K
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide text-[#FFC107] uppercase">
                {settings.shopName}
              </h2>
              <p className="text-xs text-amber-100 font-medium tracking-wide mt-0.5">
                {settings.tagline}
              </p>
              <div className="mt-2 text-[11px] text-stone-200 space-y-0.5">
                <p>{settings.address}</p>
                <p>
                  Contact: <span className="font-semibold text-white">{settings.phone}</span>
                  {settings.secondaryPhone && ` / ${settings.secondaryPhone}`}
                </p>
                {settings.gst && <p className="font-mono text-amber-200 text-[10px]">GSTIN: {settings.gst}</p>}
              </div>
            </div>

            <div className="bg-amber-50/70 border-b border-amber-200 px-4 py-2.5 flex flex-wrap justify-between items-center text-xs text-stone-700">
              <div>
                <span className="text-stone-500">Bill No:</span>{' '}
                <strong className="font-mono text-stone-900">{invoice.invoiceNumber}</strong>
              </div>
              <div>
                <span className="text-stone-500">Date:</span>{' '}
                <strong>{invoice.date}</strong> <span className="text-stone-400">({invoice.time})</span>
              </div>
              <div>
                <span className="text-stone-500">Payment:</span>{' '}
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#7B001C] text-white">
                  {invoice.paymentMode} - {invoice.status}
                </span>
              </div>
            </div>

            <div className="p-4 bg-stone-50/50 border-b border-stone-200 flex flex-wrap justify-between gap-2 text-xs">
              <div>
                <span className="text-stone-500 block text-[10px] uppercase font-bold tracking-wider">
                  Grahak / Customer
                </span>
                <span className="font-bold text-stone-900 text-sm">
                  {invoice.customerName || 'Walk-in Customer'}
                </span>
              </div>
              {invoice.customerPhone && (
                <div className="text-right">
                  <span className="text-stone-500 block text-[10px] uppercase font-bold tracking-wider">
                    Mobile Number
                  </span>
                  <span className="font-mono font-semibold text-stone-800">{invoice.customerPhone}</span>
                </div>
              )}
            </div>

            <div className="p-4 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b-2 border-[#7B001C] text-[#7B001C] font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2 px-1 text-center w-8">#</th>
                    <th className="py-2 px-2">Item Description</th>
                    <th className="py-2 px-2 text-center">Qty</th>
                    <th className="py-2 px-2 text-right">Rate</th>
                    <th className="py-2 px-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/50">
                      <td className="py-2 px-1 text-center text-stone-500 font-mono text-[11px]">{idx + 1}</td>
                      <td className="py-2 px-2">
                        <div className="font-semibold text-stone-900">{item.name}</div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          {item.category} {item.barcode && `| ${item.barcode}`}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center font-medium">
                        {item.quantity} {item.unit || 'pcs'}
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-stone-600">
                        ₹{item.price.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-stone-900">
                        ₹{item.total.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 pt-3 border-t-2 border-stone-300 flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {invoice.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount:</span>
                      <span className="font-mono">-₹{invoice.discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {invoice.taxAmount > 0 && (
                    <div className="flex justify-between text-stone-600">
                      <span>GST ({invoice.taxPercent}%):</span>
                      <span className="font-mono">+₹{invoice.taxAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-extrabold text-[#7B001C] pt-2 border-t-2 border-[#7B001C]">
                    <span>Net Amount:</span>
                    <span>₹{invoice.grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-dashed border-stone-300 flex items-center justify-between text-[11px] text-stone-600">
                <div>
                  {settings.upiId && (
                    <div className="text-left">
                      <span className="text-[10px] text-stone-500 uppercase font-bold flex items-center gap-1">
                        <QrCode className="w-3 h-3 text-[#7B001C]" /> Pay via UPI:
                      </span>
                      <span className="font-mono font-semibold text-stone-800 bg-amber-100/70 px-1.5 py-0.5 rounded">
                        {settings.upiId}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <BarcodeRenderer value={invoice.invoiceNumber} width={1.2} height={28} displayValue={false} />
                  <div className="text-center font-mono text-[9px] text-stone-500">{invoice.invoiceNumber}</div>
                </div>
              </div>

              <div className="mt-4 text-center pt-3 border-t border-stone-200 text-stone-500 text-xs">
                <p className="font-medium text-stone-700">{settings.footerMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* STYLE 2: CLASSIC CLEAN RECEIPT */}
        {activeStyle === 'classic' && (
          <div className="border border-stone-500 p-6 bg-white font-serif text-stone-900">
            <div className="text-center border-b-2 border-stone-800 pb-4">
              <h1 className="text-2xl font-bold tracking-tight uppercase">{settings.shopName}</h1>
              <p className="text-xs italic text-stone-600">{settings.tagline}</p>
              <p className="text-xs text-stone-700 mt-1">{settings.address}</p>
              <p className="text-xs text-stone-700">Phone: {settings.phone}</p>
            </div>

            <div className="my-3 flex justify-between text-xs border-b border-stone-300 pb-2">
              <div>
                <p><strong>INVOICE NO:</strong> {invoice.invoiceNumber}</p>
                <p><strong>CUSTOMER:</strong> {invoice.customerName}</p>
              </div>
              <div className="text-right">
                <p><strong>DATE:</strong> {invoice.date} {invoice.time}</p>
                <p><strong>PAYMENT:</strong> {invoice.paymentMode}</p>
              </div>
            </div>

            <table className="w-full text-xs my-4 border-collapse">
              <thead>
                <tr className="border-b border-t border-stone-800 font-bold uppercase text-[11px]">
                  <th className="py-1 text-left">Item</th>
                  <th className="py-1 text-center">Qty</th>
                  <th className="py-1 text-right">Rate</th>
                  <th className="py-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {invoice.items.map((it, idx) => (
                  <tr key={idx} className="py-1">
                    <td className="py-1.5">{it.name}</td>
                    <td className="py-1.5 text-center">{it.quantity}</td>
                    <td className="py-1.5 text-right font-mono">₹{it.price}</td>
                    <td className="py-1.5 text-right font-mono font-semibold">₹{it.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t-2 border-stone-800 pt-2 flex justify-end text-xs">
              <div className="w-56 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{invoice.subtotal}</span>
                </div>
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span className="font-mono">-₹{invoice.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm border-t border-stone-800 pt-1">
                  <span>GRAND TOTAL:</span>
                  <span className="font-mono">₹{invoice.grandTotal}</span>
                </div>
              </div>
            </div>

            <div className="text-center mt-6 text-xs text-stone-600 border-t border-stone-300 pt-3">
              <p>{settings.footerMessage}</p>
            </div>
          </div>
        )}

        {/* STYLE 3: THERMAL POS 80MM (3-INCH ROLL) */}
        {activeStyle === 'thermal80' && (
          <div className="max-w-[340px] mx-auto p-4 bg-white font-mono text-[11px] text-black border border-dashed border-stone-400">
            <div className="text-center">
              <h2 className="font-bold text-base uppercase leading-tight">{settings.shopName}</h2>
              <p className="text-[10px] mt-0.5">{settings.address}</p>
              <p className="text-[10px]">Ph: {settings.phone}</p>
              {settings.gst && <p className="text-[10px]">GST: {settings.gst}</p>}
              <p className="my-1">================================</p>
            </div>

            <div className="space-y-0.5 text-[10px]">
              <div>INVOICE : {invoice.invoiceNumber}</div>
              <div>DATE    : {invoice.date} {invoice.time}</div>
              <div>CUSTOMER: {invoice.customerName}</div>
              {invoice.customerPhone && <div>PHONE   : {invoice.customerPhone}</div>}
              <div>PAY MODE: {invoice.paymentMode} ({invoice.status})</div>
            </div>

            <p className="my-1">--------------------------------</p>

            <table className="w-full text-[10px]">
              <thead>
                <tr className="text-left border-b border-black">
                  <th className="py-0.5">ITEM</th>
                  <th className="text-center py-0.5">QTY</th>
                  <th className="text-right py-0.5">PRICE</th>
                  <th className="text-right py-0.5">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="truncate max-w-[120px] py-0.5">{it.name}</td>
                    <td className="text-center py-0.5">{it.quantity}</td>
                    <td className="text-right py-0.5">₹{it.price}</td>
                    <td className="text-right py-0.5 font-bold">₹{it.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="my-1">--------------------------------</p>

            <div className="space-y-0.5 text-right text-[10px]">
              <div>SUBTOTAL: ₹{invoice.subtotal}</div>
              {invoice.discountAmount > 0 && <div>DISCOUNT: -₹{invoice.discountAmount}</div>}
              {invoice.taxAmount > 0 && <div>TAX: +₹{invoice.taxAmount}</div>}
              <div className="font-bold text-xs pt-0.5 border-t border-black">
                NET TOTAL: ₹{invoice.grandTotal}
              </div>
            </div>

            <div className="mt-3 text-center">
              <BarcodeRenderer value={invoice.invoiceNumber} width={1} height={26} fontSize={9} displayValue={true} />
              <p className="mt-2 text-[9px] leading-tight">{settings.footerMessage}</p>
              <p className="text-[9px] font-bold mt-1">*** THANK YOU - VISIT AGAIN ***</p>
              <p className="text-[8px] text-stone-400 mt-1">-- [ CUT PAPER HERE ] --</p>
            </div>
          </div>
        )}

        {/* STYLE 4: THERMAL POS 58MM (2-INCH MINI BLUETOOTH) */}
        {activeStyle === 'thermal58' && (
          <div className="max-w-[260px] mx-auto p-3 bg-white font-mono text-[10px] text-black border border-stone-300">
            <div className="text-center">
              <h3 className="font-black text-xs uppercase">{settings.shopName}</h3>
              <p className="text-[8px] truncate">{settings.address}</p>
              <p className="text-[9px]">M: {settings.phone}</p>
              <p className="my-0.5">---------------------</p>
            </div>

            <div className="text-[9px] space-y-0.5">
              <div>INV: {invoice.invoiceNumber}</div>
              <div>DT : {invoice.date} {invoice.time}</div>
              <div>CS : {invoice.customerName}</div>
            </div>

            <p className="my-0.5">---------------------</p>

            <div className="space-y-1">
              {invoice.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-[9px]">
                  <span className="truncate max-w-[140px]">
                    {it.name} x{it.quantity}
                  </span>
                  <span className="font-bold">₹{it.total}</span>
                </div>
              ))}
            </div>

            <p className="my-0.5">---------------------</p>

            <div className="text-right text-[10px] space-y-0.5">
              {invoice.discountAmount > 0 && <div>DISC: -₹{invoice.discountAmount}</div>}
              <div className="font-extrabold text-xs">TOTAL: ₹{invoice.grandTotal}</div>
              <div className="text-[8px]">{invoice.paymentMode} - {invoice.status}</div>
            </div>

            <div className="mt-2 text-center text-[8px]">
              <BarcodeRenderer value={invoice.invoiceNumber} width={0.9} height={20} displayValue={false} />
              <p className="mt-1">** DHANYAWAD **</p>
            </div>
          </div>
        )}

        {/* STYLE 5: OFFICIAL GST TAX INVOICE (DETAILED A4 B2B/B2C) */}
        {activeStyle === 'gst' && (
          <div className="border-2 border-stone-800 p-6 bg-white text-stone-900 font-sans text-xs">
            {/* Header */}
            <div className="text-center border-b-2 border-stone-800 pb-3">
              <span className="inline-block uppercase tracking-widest text-[10px] font-bold border border-stone-800 px-3 py-0.5 mb-1">
                Tax Invoice / कर बीजक
              </span>
              <h1 className="text-2xl font-black uppercase text-stone-900">{settings.shopName}</h1>
              <p className="text-xs font-medium text-stone-600">{settings.tagline}</p>
              <p className="text-xs text-stone-700">{settings.address}</p>
              <div className="flex justify-center gap-4 text-xs font-semibold mt-1">
                <span>Phone: {settings.phone}</span>
                <span className="font-mono">GSTIN: {settings.gst || '07AAAAA0000A1Z5'}</span>
                <span>State: Delhi (07)</span>
              </div>
            </div>

            {/* Invoice & Buyer meta grid */}
            <div className="grid grid-cols-2 border-b-2 border-stone-800 divide-x-2 divide-stone-800">
              <div className="p-3 space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Buyer (Details of Receiver):</span>
                <div className="font-bold text-sm">{invoice.customerName || 'Cash / Retail Buyer'}</div>
                <div>Phone: <span className="font-mono font-medium">{invoice.customerPhone || 'N/A'}</span></div>
                <div>Place of Supply: State (07) / Local</div>
              </div>
              <div className="p-3 space-y-1">
                <div>Invoice No: <strong className="font-mono text-sm">{invoice.invoiceNumber}</strong></div>
                <div>Dated: <strong className="font-mono">{invoice.date}</strong> at {invoice.time}</div>
                <div>Payment Mode: <strong className="font-mono">{invoice.paymentMode}</strong> ({invoice.status})</div>
                <div>Reverse Charge: No</div>
              </div>
            </div>

            {/* GST Items Table */}
            <table className="w-full text-xs border-collapse mt-3">
              <thead>
                <tr className="border-b-2 border-t-2 border-stone-800 bg-stone-100 font-bold uppercase text-[10px]">
                  <th className="py-2 px-1 text-center w-8">#</th>
                  <th className="py-2 px-2 text-left">Description of Goods</th>
                  <th className="py-2 px-2 text-center">HSN/SAC</th>
                  <th className="py-2 px-2 text-center">Qty</th>
                  <th className="py-2 px-2 text-right">Rate (₹)</th>
                  <th className="py-2 px-2 text-right">Discount</th>
                  <th className="py-2 px-2 text-right">Taxable Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-300">
                {invoice.items.map((it, idx) => {
                  const hsn = it.category === 'Clothes' ? '5407' : it.category === 'Cosmetics' ? '3304' : '7117';
                  return (
                    <tr key={idx}>
                      <td className="py-2 px-1 text-center font-mono">{idx + 1}</td>
                      <td className="py-2 px-2">
                        <div className="font-bold">{it.name}</div>
                        <div className="text-[10px] text-stone-500">{it.category}</div>
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-[11px]">{hsn}</td>
                      <td className="py-2 px-2 text-center font-mono">{it.quantity} {it.unit || 'pcs'}</td>
                      <td className="py-2 px-2 text-right font-mono">₹{it.price.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right font-mono text-stone-500">₹0.00</td>
                      <td className="py-2 px-2 text-right font-mono font-bold">₹{it.total.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* GST Tax Calculation Breakdown */}
            <div className="mt-4 border-t-2 border-stone-800 pt-3 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Amount Chargeable (in words):</span>
                  <div className="font-bold text-xs italic text-stone-800">
                    INR {numberToIndianWords(invoice.grandTotal)}
                  </div>
                </div>

                <div className="p-2.5 bg-stone-50 border border-stone-300 rounded text-[10px] space-y-1">
                  <span className="font-bold uppercase block">Bank Details for Direct Payment:</span>
                  <div>Bank Name: State Bank of India (SBI)</div>
                  <div>A/C Name: {settings.shopName}</div>
                  <div>UPI ID: <span className="font-mono font-bold">{settings.upiId}</span></div>
                </div>
              </div>

              <div className="space-y-1.5 text-right font-mono text-xs">
                <div className="flex justify-between">
                  <span className="font-sans">Total Taxable Amount:</span>
                  <span>₹{invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-800">
                    <span className="font-sans">Discount:</span>
                    <span>-₹{invoice.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span className="font-sans">CGST @ 2.5%:</span>
                  <span>₹{(invoice.taxAmount / 2 || (invoice.grandTotal * 0.025)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span className="font-sans">SGST @ 2.5%:</span>
                  <span>₹{(invoice.taxAmount / 2 || (invoice.grandTotal * 0.025)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-black border-t-2 border-b-2 border-stone-800 py-1.5">
                  <span className="font-sans">Total Amount (₹):</span>
                  <span>₹{invoice.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Declaration & Signatures */}
            <div className="mt-8 pt-4 border-t border-stone-400 grid grid-cols-2 gap-4 items-end">
              <div className="text-[10px] text-stone-500 space-y-1">
                <p className="font-bold">Terms & Conditions:</p>
                <p>1. Goods once sold will not be taken back without receipt.</p>
                <p>2. Subject to local jurisdiction only.</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase">For {settings.shopName}</p>
                <div className="h-12 flex items-center justify-end">
                  <span className="font-serif italic text-xs text-stone-400">Authorized Signatory</span>
                </div>
                <div className="border-t border-dashed border-stone-400 pt-1 text-[10px]">Authorised Signature</div>
              </div>
            </div>
          </div>
        )}

        {/* STYLE 6: DULHAN / FESTIVE BOUTIQUE STYLE (ROSE-GOLD & PINK) */}
        {activeStyle === 'festive' && (
          <div className="border-4 border-rose-300 rounded-2xl p-6 bg-gradient-to-b from-rose-50/60 via-white to-pink-50/40 text-stone-900 font-sans shadow-sm relative overflow-hidden">
            {/* Ornate corner floral elements */}
            <div className="absolute top-2 left-2 text-rose-300 text-lg">❀</div>
            <div className="absolute top-2 right-2 text-rose-300 text-lg">❀</div>
            <div className="absolute bottom-2 left-2 text-rose-300 text-lg">❀</div>
            <div className="absolute bottom-2 right-2 text-rose-300 text-lg">❀</div>

            <div className="text-center pb-4 border-b-2 border-rose-200">
              <div className="text-xs font-serif tracking-widest text-rose-700 font-semibold mb-1">
                ✦ Shubh Vivah • Bridal • Fashion Boutique ✦
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-rose-950 tracking-wide uppercase">
                {settings.shopName}
              </h1>
              <p className="text-xs text-rose-800 italic mt-0.5">Exclusive Sarees, Lehengas & Beauty Cosmetics</p>
              <p className="text-xs text-stone-600 mt-1">{settings.address}</p>
              <p className="text-xs font-medium text-rose-900">Contact: {settings.phone}</p>
            </div>

            <div className="my-3 p-3 rounded-xl bg-rose-100/60 border border-rose-200 flex justify-between items-center text-xs text-rose-950">
              <div>
                <span className="text-rose-700">Privileged Guest:</span>{' '}
                <strong className="text-sm">{invoice.customerName}</strong>
                {invoice.customerPhone && <span className="ml-1 text-stone-500">({invoice.customerPhone})</span>}
              </div>
              <div className="text-right">
                <span className="text-rose-700">Bill No:</span> <strong className="font-mono">{invoice.invoiceNumber}</strong>
                <div className="text-[11px] text-stone-600">{invoice.date} {invoice.time}</div>
              </div>
            </div>

            <table className="w-full text-xs my-3">
              <thead>
                <tr className="border-b-2 border-rose-300 text-rose-900 font-bold uppercase text-[10px]">
                  <th className="py-2 text-left">Selected Apparel & Beauty Item</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-100">
                {invoice.items.map((it, idx) => (
                  <tr key={idx} className="hover:bg-rose-50/50">
                    <td className="py-2">
                      <div className="font-semibold text-stone-900">{it.name}</div>
                      <div className="text-[10px] text-rose-700">{it.category} Collection</div>
                    </td>
                    <td className="py-2 text-center font-medium">{it.quantity}</td>
                    <td className="py-2 text-right font-mono">₹{it.price.toLocaleString('en-IN')}</td>
                    <td className="py-2 text-right font-mono font-bold text-rose-950">₹{it.total.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 pt-3 border-t-2 border-rose-200 flex justify-end">
              <div className="w-60 space-y-1 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-700 font-medium">
                    <span>Festive Privileged Discount:</span>
                    <span className="font-mono">-₹{invoice.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-rose-950 pt-2 border-t-2 border-rose-300">
                  <span>Total Payable:</span>
                  <span>₹{invoice.grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-rose-800 font-serif border-t border-rose-200 pt-3">
              <p>May your celebration be filled with joy, grace, and beauty! 🌸</p>
              <p className="text-[10px] text-stone-500 mt-0.5">{settings.footerMessage}</p>
            </div>
          </div>
        )}

        {/* STYLE 7: MINIMALIST MODERN MONOCHROME (STUDIO) */}
        {activeStyle === 'monochrome' && (
          <div className="border border-stone-200 p-8 bg-white text-stone-900 font-mono text-xs shadow-xs">
            <div className="flex justify-between items-start border-b border-black pb-6">
              <div>
                <h1 className="text-xl font-black uppercase tracking-widest">{settings.shopName}</h1>
                <p className="text-stone-500 mt-1">{settings.address}</p>
                <p className="text-stone-500">T: {settings.phone}</p>
              </div>
              <div className="text-right">
                <div className="text-base font-bold">{invoice.invoiceNumber}</div>
                <div className="text-stone-500">{invoice.date}</div>
              </div>
            </div>

            <div className="py-4 border-b border-stone-200 flex justify-between">
              <div>
                <span className="text-stone-400 uppercase text-[10px] block">Customer</span>
                <span className="font-bold">{invoice.customerName}</span>
                {invoice.customerPhone && <span className="text-stone-500 ml-2">[{invoice.customerPhone}]</span>}
              </div>
              <div className="text-right">
                <span className="text-stone-400 uppercase text-[10px] block">Payment</span>
                <span className="font-bold uppercase">{invoice.paymentMode} // {invoice.status}</span>
              </div>
            </div>

            <table className="w-full my-6 text-left">
              <thead>
                <tr className="border-b border-black text-[10px] uppercase tracking-wider">
                  <th className="py-2">Item</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {invoice.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5">
                      <span className="font-bold">{it.name}</span>
                      <span className="text-stone-400 text-[10px] ml-2">({it.category})</span>
                    </td>
                    <td className="py-2.5 text-center">{it.quantity}</td>
                    <td className="py-2.5 text-right">₹{it.price}</td>
                    <td className="py-2.5 text-right font-bold">₹{it.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-black pt-4 flex justify-end">
              <div className="w-56 space-y-1 text-right">
                <div className="flex justify-between">
                  <span className="text-stone-500">Subtotal</span>
                  <span>₹{invoice.subtotal}</span>
                </div>
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Discount</span>
                    <span>-₹{invoice.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm border-t border-black pt-2">
                  <span>TOTAL</span>
                  <span>₹{invoice.grandTotal}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-stone-200 flex justify-between items-center text-[10px] text-stone-400">
              <span>{settings.footerMessage}</span>
              <span>AUTHENTIC RECEIPT</span>
            </div>
          </div>
        )}

        {/* STYLE 8: DESI BAHI-KHATA (SHUBH-LAABH VYAPAR PARCHAA) */}
        {activeStyle === 'khata' && (
          <div className="border-2 border-red-700 p-6 bg-[#FFFDF5] text-red-950 font-serif text-xs shadow-xs">
            <div className="text-center border-b-2 border-red-700 pb-3">
              <div className="flex justify-between items-center text-red-800 font-bold text-xs px-4">
                <span>॥ श्री गणेशाय नमः ॥</span>
                <span>॥ शुभ - लाभ ॥</span>
              </div>
              <h1 className="text-2xl font-black text-red-800 uppercase mt-1">{settings.shopName}</h1>
              <p className="text-xs text-amber-900 font-sans">थोक एवं फुटकर विक्रेता: फैंसी साड़ियां, सूट, लहंगा एवं कॉस्मेटिक्स</p>
              <p className="text-xs text-stone-700 mt-0.5">{settings.address}</p>
              <p className="text-xs font-semibold text-red-900">मोबाईल: {settings.phone}</p>
            </div>

            <div className="my-3 flex justify-between text-xs border-b border-red-300 pb-2">
              <div>
                <p><strong>श्रीमान/श्रीमती:</strong> {invoice.customerName}</p>
                {invoice.customerPhone && <p><strong>मोबाईल:</strong> {invoice.customerPhone}</p>}
              </div>
              <div className="text-right">
                <p><strong>रसीद क्र.:</strong> {invoice.invoiceNumber}</p>
                <p><strong>दिनांक:</strong> {invoice.date}</p>
              </div>
            </div>

            <table className="w-full text-xs my-4 border-collapse">
              <thead>
                <tr className="border-b-2 border-t-2 border-red-700 bg-red-100/50 font-bold text-[11px] text-red-900">
                  <th className="py-1 text-center w-8">क्र.</th>
                  <th className="py-1 text-left">माल का विवरण</th>
                  <th className="py-1 text-center">नग (Qty)</th>
                  <th className="py-1 text-right">भाव (दर)</th>
                  <th className="py-1 text-right">कुल रकम</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-200">
                {invoice.items.map((it, idx) => (
                  <tr key={idx} className="py-1">
                    <td className="py-1.5 text-center font-mono">{idx + 1}</td>
                    <td className="py-1.5 font-bold">{it.name}</td>
                    <td className="py-1.5 text-center">{it.quantity} {it.unit || 'नग'}</td>
                    <td className="py-1.5 text-right font-mono">₹{it.price}</td>
                    <td className="py-1.5 text-right font-mono font-bold">₹{it.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t-2 border-red-700 pt-2 flex justify-end text-xs">
              <div className="w-56 space-y-1">
                <div className="flex justify-between">
                  <span>जोड़ (Subtotal):</span>
                  <span className="font-mono">₹{invoice.subtotal}</span>
                </div>
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-800">
                    <span>छूट (Discount):</span>
                    <span className="font-mono">-₹{invoice.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm border-t-2 border-red-700 pt-1 text-red-900">
                  <span>कुल शुद्ध देय:</span>
                  <span className="font-mono text-base">₹{invoice.grandTotal}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-3 border-t border-red-300 flex justify-between items-end text-xs text-red-900">
              <div className="text-[11px] text-stone-600">
                <p>• भूल-चूक लेनी-देनी (E. & O.E.)</p>
                <p>• बिका हुआ माल वापस नहीं होगा, 7 दिनों में बदल सकते हैं।</p>
              </div>
              <div className="text-right">
                <p className="font-bold">हस्ताक्षर विक्रेता</p>
                <p className="text-[10px] text-stone-500">वास्ते: {settings.shopName}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
