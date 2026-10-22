import React from 'react';
import { Invoice, StoreSettings } from '../types';
import { Printer, Share2, Copy, Check, X, QrCode } from 'lucide-react';
import { BarcodeRenderer } from './BarcodeRenderer';

interface PrintableInvoiceProps {
  invoice: Invoice;
  settings: StoreSettings;
  templateStyle?: 'modern' | 'classic' | 'thermal';
  onClose?: () => void;
  onStyleChange?: (style: 'modern' | 'classic' | 'thermal') => void;
}

export const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({
  invoice,
  settings,
  templateStyle = 'modern',
  onClose,
  onStyleChange,
}) => {
  const [copied, setCopied] = React.useState(false);

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

    const msg = `*--- ${settings.shopName.toUpperCase()} ---*
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

    return msg;
  };

  const handleWhatsAppShare = () => {
    const msg = encodeURIComponent(getWhatsAppMessage());
    let phone = invoice.customerPhone.replace(/[^0-9]/g, '');
    if (phone.length === 10) {
      phone = '91' + phone;
    }
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
          <span className="text-xs font-semibold text-stone-600">Bill Template:</span>
          <select
            value={templateStyle}
            onChange={(e) =>
              onStyleChange &&
              onStyleChange(e.target.value as 'modern' | 'classic' | 'thermal')
            }
            className="text-xs bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-medium text-stone-800 shadow-sm outline-none focus:border-[#7B001C]"
          >
            <option value="modern">Royal Maroon (Modern)</option>
            <option value="classic">Classic Clean</option>
            <option value="thermal">Thermal POS (58mm/80mm)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyText}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-medium shadow-sm transition-colors"
            title="Copy text bill for SMS / WhatsApp"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Bill'}
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-sm transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            WhatsApp Share
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
      <div id="printableInvoice" className="p-4 sm:p-6 print:p-2 max-w-2xl mx-auto">
        {/* TEMPLATE 1: MODERN MAROON */}
        {templateStyle === 'modern' && (
          <div className="border-2 border-[#7B001C] rounded-xl overflow-hidden bg-white shadow-sm print:border-stone-800">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-[#7B001C] to-[#560013] text-white p-5 print:bg-[#7B001C] text-center relative border-b-4 border-[#FFC107]">
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
                {settings.gst && (
                  <p className="font-mono text-amber-200 text-[10px]">
                    GSTIN: {settings.gst}
                  </p>
                )}
              </div>
            </div>

            {/* Bill metadata strip */}
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

            {/* Customer Details */}
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
                  <span className="font-mono font-semibold text-stone-800">
                    {invoice.customerPhone}
                  </span>
                </div>
              )}
            </div>

            {/* Items Table */}
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
                      <td className="py-2 px-1 text-center text-stone-500 font-mono text-[11px]">
                        {idx + 1}
                      </td>
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

              {/* Total calculations */}
              <div className="mt-4 pt-3 border-t-2 border-stone-300 flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal (Kul Rakam):</span>
                    <span className="font-mono">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {invoice.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount (Chhoot):</span>
                      <span className="font-mono">-₹{invoice.discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {invoice.taxAmount > 0 && (
                    <div className="flex justify-between text-stone-600">
                      <span>GST / Tax ({invoice.taxPercent}%):</span>
                      <span className="font-mono">+₹{invoice.taxAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-extrabold text-[#7B001C] pt-2 border-t-2 border-[#7B001C]">
                    <span>Net Amount:</span>
                    <span>₹{invoice.grandTotal.toLocaleString('en-IN')}</span>
                  </div>

                  {invoice.amountReceived > 0 && (
                    <div className="pt-2 text-[11px] text-stone-500 space-y-0.5 border-t border-stone-200">
                      <div className="flex justify-between">
                        <span>Paid:</span>
                        <span className="font-mono">₹{invoice.amountReceived.toLocaleString('en-IN')}</span>
                      </div>
                      {invoice.changeDue > 0 && (
                        <div className="flex justify-between text-amber-800">
                          <span>Change Returned:</span>
                          <span className="font-mono font-semibold">₹{invoice.changeDue.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* UPI & Barcode Section */}
              <div className="mt-6 pt-4 border-t border-dashed border-stone-300 flex items-center justify-between text-[11px] text-stone-600">
                <div className="flex items-center gap-2">
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
                  <BarcodeRenderer
                    value={invoice.invoiceNumber}
                    width={1.2}
                    height={30}
                    fontSize={10}
                    displayValue={false}
                  />
                  <div className="text-center font-mono text-[9px] text-stone-500">
                    {invoice.invoiceNumber}
                  </div>
                </div>
              </div>

              {/* Footer Blessing / Note */}
              <div className="mt-4 text-center pt-3 border-t border-stone-200 text-stone-500 text-xs">
                <p className="font-medium text-stone-700">{settings.footerMessage}</p>
                <p className="text-[10px] text-stone-400 mt-1">
                  *Goods once sold can be exchanged within 7 days with original bill.*
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TEMPLATE 2: CLASSIC CLEAN RECEIPT */}
        {templateStyle === 'classic' && (
          <div className="border border-stone-400 p-6 bg-white font-serif text-stone-900">
            <div className="text-center border-b-2 border-stone-800 pb-4">
              <h1 className="text-2xl font-bold tracking-tight uppercase">
                {settings.shopName}
              </h1>
              <p className="text-xs italic text-stone-600">{settings.tagline}</p>
              <p className="text-xs text-stone-700 mt-1">{settings.address}</p>
              <p className="text-xs text-stone-700">Phone: {settings.phone}</p>
              {settings.gst && (
                <p className="text-[11px] font-mono mt-0.5">GSTIN: {settings.gst}</p>
              )}
            </div>

            <div className="my-3 flex justify-between text-xs border-b border-stone-300 pb-2">
              <div>
                <p>
                  <strong>INVOICE NO:</strong> {invoice.invoiceNumber}
                </p>
                <p>
                  <strong>CUSTOMER:</strong> {invoice.customerName}
                </p>
                {invoice.customerPhone && <p><strong>PHONE:</strong> {invoice.customerPhone}</p>}
              </div>
              <div className="text-right">
                <p>
                  <strong>DATE:</strong> {invoice.date}
                </p>
                <p>
                  <strong>TIME:</strong> {invoice.time}
                </p>
                <p>
                  <strong>PAYMENT:</strong> {invoice.paymentMode}
                </p>
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
                {invoice.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>GST ({invoice.taxPercent}%):</span>
                    <span className="font-mono">+₹{invoice.taxAmount}</span>
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

        {/* TEMPLATE 3: THERMAL POS (58mm / 80mm) */}
        {templateStyle === 'thermal' && (
          <div className="max-w-[320px] mx-auto p-4 bg-white font-mono text-[11px] text-black border border-dashed border-stone-400">
            <div className="text-center">
              <h2 className="font-bold text-sm uppercase">{settings.shopName}</h2>
              <p className="text-[10px]">{settings.address}</p>
              <p className="text-[10px]">Ph: {settings.phone}</p>
              {settings.gst && <p className="text-[10px]">GST: {settings.gst}</p>}
              <p className="my-1">--------------------------------</p>
            </div>

            <div className="space-y-0.5 text-[10px]">
              <div>RCPT: {invoice.invoiceNumber}</div>
              <div>DATE: {invoice.date} {invoice.time}</div>
              <div>CUST: {invoice.customerName}</div>
              {invoice.customerPhone && <div>MOB: {invoice.customerPhone}</div>}
              <div>PAY: {invoice.paymentMode}</div>
            </div>

            <p className="my-1">--------------------------------</p>

            <table className="w-full text-[10px]">
              <thead>
                <tr className="text-left">
                  <th>ITEM</th>
                  <th className="text-center">QTY</th>
                  <th className="text-right">AMT</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="truncate max-w-[140px]">{it.name}</td>
                    <td className="text-center">{it.quantity}</td>
                    <td className="text-right">₹{it.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="my-1">--------------------------------</p>

            <div className="space-y-0.5 text-right text-[10px]">
              <div>SUBTOTAL: ₹{invoice.subtotal}</div>
              {invoice.discountAmount > 0 && <div>DISCOUNT: -₹{invoice.discountAmount}</div>}
              {invoice.taxAmount > 0 && <div>TAX: +₹{invoice.taxAmount}</div>}
              <div className="font-bold text-xs pt-0.5">NET TOTAL: ₹{invoice.grandTotal}</div>
            </div>

            <div className="mt-3 text-center">
              <BarcodeRenderer
                value={invoice.invoiceNumber}
                width={1}
                height={26}
                fontSize={9}
                displayValue={true}
              />
              <p className="mt-2 text-[9px] leading-tight">{settings.footerMessage}</p>
              <p className="text-[8px] mt-1">*** THANK YOU ***</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
