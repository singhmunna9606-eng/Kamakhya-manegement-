import React, { useState } from 'react';
import { Customer, Invoice, StoreSettings } from '../types';
import {
  Users,
  Search,
  Phone,
  MessageCircle,
  Receipt,
  Eye,
  Calendar,
  DollarSign,
  Plus,
  X,
  CreditCard,
} from 'lucide-react';
import { PrintableInvoice } from './PrintableInvoice';

interface CustomersTabProps {
  customers: Customer[];
  invoices: Invoice[];
  settings: StoreSettings;
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
}

export const CustomersTab: React.FC<CustomersTabProps> = ({
  customers,
  invoices,
  settings,
  onAddCustomer,
  onUpdateCustomer,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'customers' | 'invoices'>('customers');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  // New Customer Form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newDue, setNewDue] = useState('0');

  // Filter customers
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter invoices
  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerPhone.includes(searchQuery)
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      alert('Kripya grahak ka naam aur mobile number daalein!');
      return;
    }

    const created: Customer = {
      id: 'cust-' + Date.now(),
      name: newName.trim(),
      phone: newPhone.trim(),
      address: newAddress.trim() || undefined,
      totalSpent: 0,
      visitCount: 0,
      lastVisit: new Date().toISOString().split('T')[0],
      balanceDue: parseFloat(newDue) || 0,
    };

    onAddCustomer(created);
    setNewName('');
    setNewPhone('');
    setNewAddress('');
    setNewDue('0');
    setIsAddCustomerOpen(false);
  };

  const openWhatsAppToCustomer = (phone: string, name: string) => {
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
    const msg = encodeURIComponent(
      `Namaste ${name} ji! 🙏\n${settings.shopName} se baat kar rahe hain. Aapka dukan aane ke liye dhanyawad!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs: Customers Directory vs Invoices Ledger */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('customers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'customers'
                ? 'bg-[#7B001C] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Users className="w-4 h-4" /> Grahak List ({customers.length})
          </button>
          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'invoices'
                ? 'bg-[#7B001C] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Receipt className="w-4 h-4" /> Pichle Bill / Invoices ({invoices.length})
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search naam ya mobile..."
              className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none focus:border-[#7B001C]"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          </div>

          {activeSubTab === 'customers' && (
            <button
              onClick={() => setIsAddCustomerOpen(true)}
              className="px-3 py-1.5 bg-[#FFC107] hover:bg-amber-400 text-stone-900 font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Grahak
            </button>
          )}
        </div>
      </div>

      {/* 1. CUSTOMERS DIRECTORY */}
      {activeSubTab === 'customers' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-stone-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#7B001C]" />
              Customer Details (Grahak Directory)
            </h2>
            <span className="text-xs text-stone-400">
              Total {filteredCustomers.length} Customers
            </span>
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              Koi grahak nahi mila. Upar se naya add karein.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 font-semibold bg-stone-50">
                    <th className="py-2.5 px-3">Grahak Ka Naam</th>
                    <th className="py-2.5 px-2">Mobile Number</th>
                    <th className="py-2.5 px-2">Address</th>
                    <th className="py-2.5 px-2 text-center">Visits</th>
                    <th className="py-2.5 px-2 text-right">Kul Kharidari</th>
                    <th className="py-2.5 px-2 text-center">Udhar (Due)</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-stone-900">
                        {c.name}
                        <div className="text-[10px] text-stone-400">Last: {c.lastVisit}</div>
                      </td>
                      <td className="py-2.5 px-2 font-mono text-stone-700">{c.phone}</td>
                      <td className="py-2.5 px-2 text-stone-500 truncate max-w-[140px]">
                        {c.address || '—'}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-stone-100 font-bold text-stone-700">
                          {c.visitCount}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-[#7B001C]">
                        ₹{c.totalSpent.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        {c.balanceDue > 0 ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700 font-mono">
                            ₹{c.balanceDue}
                          </span>
                        ) : (
                          <span className="text-stone-400 font-mono">₹0</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openWhatsAppToCustomer(c.phone, c.name)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Send WhatsApp message"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. INVOICES / BILLS LEDGER */}
      {activeSubTab === 'invoices' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-stone-800 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#7B001C]" />
              Sabhi Bills & Bikri Ledger ({filteredInvoices.length})
            </h2>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              Koi invoice nahi mili. Billing tab me naya bill banayein!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 font-semibold bg-stone-50">
                    <th className="py-2.5 px-3">Bill Number</th>
                    <th className="py-2.5 px-2">Date & Time</th>
                    <th className="py-2.5 px-2">Customer Name</th>
                    <th className="py-2.5 px-2 text-center">Items</th>
                    <th className="py-2.5 px-2">Payment</th>
                    <th className="py-2.5 px-2 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-stone-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-2.5 px-2 text-stone-600">
                        <div>{inv.date}</div>
                        <div className="text-[10px] text-stone-400">{inv.time}</div>
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="font-semibold text-stone-800">{inv.customerName}</div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          {inv.customerPhone || 'Walk-in'}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono">
                        {inv.items.reduce((a, b) => a + b.quantity, 0)} pcs
                      </td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {inv.paymentMode} - {inv.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-[#7B001C] text-sm">
                        ₹{inv.grandTotal.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Dekhein / Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Selected Invoice View Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="max-w-2xl w-full">
            <PrintableInvoice
              invoice={selectedInvoice}
              settings={settings}
              templateStyle={settings.invoiceTemplate}
              onClose={() => setSelectedInvoice(null)}
            />
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 border border-stone-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[#7B001C]">Naya Grahak Jodein</h3>
              <button
                onClick={() => setIsAddCustomerOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-600 mb-1">Grahak Ka Naam *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Sangeeta Gupta"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl outline-none focus:border-[#7B001C]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-600 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl outline-none focus:border-[#7B001C] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-600 mb-1">Address / Pata</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Ghar ya Mohalle ka naam"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl outline-none focus:border-[#7B001C]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-600 mb-1">
                  Starting Udhar / Balance Due (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newDue}
                  onChange={(e) => setNewDue(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-3 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#7B001C] text-white font-bold"
                >
                  Save Grahak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
