import React from 'react';
import { Invoice, Product, StoreSettings } from '../types';
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  ShoppingBag,
  AlertTriangle,
  Award,
  Calendar,
  Layers,
} from 'lucide-react';

interface ReportsTabProps {
  invoices: Invoice[];
  products: Product[];
  settings: StoreSettings;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ invoices, products }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const todayInvoices = invoices.filter((inv) => inv.date === todayStr);

  const todayRevenue = todayInvoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);

  // Cash vs UPI breakdown for today
  const todayCash = todayInvoices
    .filter((inv) => inv.paymentMode === 'Cash')
    .reduce((acc, inv) => acc + inv.grandTotal, 0);
  const todayUpi = todayInvoices
    .filter((inv) => inv.paymentMode === 'UPI')
    .reduce((acc, inv) => acc + inv.grandTotal, 0);
  const todayOther = todayRevenue - todayCash - todayUpi;

  // Items sold stats
  const itemsSoldMap: { [prodName: string]: { qty: number; revenue: number; category: string } } =
    {};
  invoices.forEach((inv) => {
    inv.items.forEach((item) => {
      if (!itemsSoldMap[item.name]) {
        itemsSoldMap[item.name] = { qty: 0, revenue: 0, category: item.category };
      }
      itemsSoldMap[item.name].qty += item.quantity;
      itemsSoldMap[item.name].revenue += item.total;
    });
  });

  const topSellingItems = Object.entries(itemsSoldMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Category sales breakdown
  let clothesRevenue = 0;
  let cosmeticsRevenue = 0;
  let otherRevenue = 0;

  invoices.forEach((inv) => {
    inv.items.forEach((item) => {
      if (item.category === 'Clothes') clothesRevenue += item.total;
      else if (item.category === 'Cosmetics') cosmeticsRevenue += item.total;
      else otherRevenue += item.total;
    });
  });

  const lowStockItems = products.filter((p) => p.stock <= p.minStock);

  return (
    <div className="space-y-6">
      {/* 1. Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Today's Sales */}
        <div className="bg-gradient-to-br from-[#7B001C] to-[#560013] text-white rounded-2xl p-5 shadow-md border-b-4 border-[#FFC107]">
          <div className="flex items-center justify-between text-amber-200 text-xs font-semibold uppercase tracking-wider">
            <span>Aaj Ki Bikri (Today's Sales)</span>
            <Calendar className="w-4 h-4 text-[#FFC107]" />
          </div>
          <div className="text-3xl font-black text-[#FFC107] font-mono mt-2">
            ₹{todayRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-amber-100/90 mt-1 flex items-center justify-between">
            <span>{todayInvoices.length} Bills Cut Today</span>
            <span className="font-mono">{todayStr}</span>
          </div>
        </div>

        {/* All-time Total Revenue */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase">
            <span>Total Sales (Kul Bikri)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-stone-900 font-mono mt-2">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-stone-500 mt-1">
            Total {invoices.length} Invoices Generated
          </div>
        </div>

        {/* Inventory Units */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase">
            <span>Dukan Ka Stock</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-stone-900 mt-2">
            {products.reduce((a, b) => a + b.stock, 0)}{' '}
            <span className="text-sm font-normal text-stone-500">pieces</span>
          </div>
          <div className="text-xs text-stone-500 mt-1">
            Across {products.length} distinct items
          </div>
        </div>
      </div>

      {/* 2. Evening Cash Tally (Daily Cash Hisab) */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200">
        <h3 className="text-sm font-bold text-stone-800 mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#7B001C]" />
          Aaj Ka Cash & UPI Hisab (Payment Summary)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-800 uppercase block">
              💵 Nagad Cash Collection
            </span>
            <span className="text-xl font-black text-emerald-900 font-mono mt-1 block">
              ₹{todayCash.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-700">Cash drawer me hona chahiye</span>
          </div>

          <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200">
            <span className="text-[11px] font-bold text-blue-800 uppercase block">
              📱 Online UPI Collection
            </span>
            <span className="text-xl font-black text-blue-900 font-mono mt-1 block">
              ₹{todayUpi.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-blue-700">Bank account me direct jama</span>
          </div>

          <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200">
            <span className="text-[11px] font-bold text-purple-800 uppercase block">
              💳 Card / Due / Other
            </span>
            <span className="text-xl font-black text-purple-900 font-mono mt-1 block">
              ₹{todayOther.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-purple-700">Swipe machine & udhar</span>
          </div>
        </div>
      </div>

      {/* 3. Category Split & Top Sellers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Split */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200">
          <h3 className="text-sm font-bold text-stone-800 mb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#7B001C]" />
            Category Bikri (Sales by Category)
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>👗 Clothes (Kapde)</span>
                <span className="font-mono">₹{clothesRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#7B001C] h-2.5 rounded-full"
                  style={{
                    width: `${totalRevenue ? Math.round((clothesRevenue / totalRevenue) * 100) : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>💄 Cosmetics (Makeup & Beauty)</span>
                <span className="font-mono">₹{cosmeticsRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#FFC107] h-2.5 rounded-full"
                  style={{
                    width: `${totalRevenue ? Math.round((cosmeticsRevenue / totalRevenue) * 100) : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>💍 Jewellery & General</span>
                <span className="font-mono">₹{otherRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-stone-500 h-2.5 rounded-full"
                  style={{
                    width: `${totalRevenue ? Math.round((otherRevenue / totalRevenue) * 100) : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200">
          <h3 className="text-sm font-bold text-stone-800 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#FFC107]" />
            Top Selling Items (Sabse Jyada Bikne Wale)
          </h3>
          {topSellingItems.length === 0 ? (
            <p className="text-xs text-stone-400 py-6 text-center">Bikri shuru hone par yahan ranking aayegi</p>
          ) : (
            <div className="space-y-2.5">
              {topSellingItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs p-2 rounded-xl bg-stone-50 border border-stone-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-[#7B001C] font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-stone-800">{item.name}</div>
                      <div className="text-[10px] text-stone-400">{item.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-stone-900 block font-mono">
                      {item.qty} sold
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      ₹{item.revenue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Kam Stock Wale Items (Order Again) - {lowStockItems.length} Products
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {lowStockItems.map((p) => (
              <div
                key={p.id}
                className="bg-white p-3 rounded-xl border border-amber-200 text-xs flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold text-stone-800 truncate max-w-[150px]">
                    {p.name}
                  </div>
                  <div className="text-[10px] text-stone-400 font-mono">{p.barcode}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold font-mono">
                    {p.stock} {p.unit} bache
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
