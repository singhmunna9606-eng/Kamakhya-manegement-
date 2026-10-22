import React, { useState } from 'react';
import { Product, Category, StoreSettings } from '../types';
import {
  Boxes,
  Plus,
  Trash2,
  Edit2,
  Printer,
  Sparkles,
  Search,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { BarcodeRenderer } from './BarcodeRenderer';
import { BarcodePrintModal } from './BarcodePrintModal';

interface StockTabProps {
  products: Product[];
  settings: StoreSettings;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const StockTab: React.FC<StockTabProps> = ({
  products,
  settings,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  // Add item form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Clothes');
  const [price, setPrice] = useState<string>('');
  const [costPrice, setCostPrice] = useState<string>('');
  const [stock, setStock] = useState<string>('');
  const [minStock, setMinStock] = useState<string>('5');
  const [barcode, setBarcode] = useState<string>('');
  const [unit, setUnit] = useState<string>('pcs');

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | Category | 'LowStock'>('All');

  // Modals
  const [printingProduct, setPrintingProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Auto-generate barcode helper
  const handleAutoGenerateBarcode = () => {
    const randomCode = 'KCC' + Math.floor(100000 + Math.random() * 900000);
    setBarcode(randomCode);
  };

  // Save new product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Kripya item ka naam daalein!');
      return;
    }
    const numPrice = parseFloat(price);
    const numStock = parseInt(stock, 10);
    if (isNaN(numPrice) || numPrice < 0) {
      alert('Kripya sahi Bikri Mulya (Price) daalein!');
      return;
    }
    if (isNaN(numStock) || numStock < 0) {
      alert('Kripya sahi Stock quantity daalein!');
      return;
    }

    const finalBarcode = barcode.trim() || 'KCC' + Math.floor(100000 + Math.random() * 900000);

    const newProd: Product = {
      id: 'prod-' + Date.now(),
      name: name.trim(),
      category,
      price: numPrice,
      costPrice: parseFloat(costPrice) || Math.round(numPrice * 0.7),
      stock: numStock,
      minStock: parseInt(minStock, 10) || 5,
      barcode: finalBarcode,
      unit: unit || 'pcs',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddProduct(newProd);

    // Reset Form
    setName('');
    setPrice('');
    setCostPrice('');
    setStock('');
    setBarcode('');
  };

  // Save edited product
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    onUpdateProduct(editingProduct);
    setEditingProduct(null);
  };

  // Adjust stock count quickly
  const handleQuickStockAdjust = (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    onUpdateProduct({ ...product, stock: newStock });
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'LowStock') return p.stock <= p.minStock;
    return p.category === selectedFilter;
  });

  // Inventory stats
  const totalItemsCount = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const totalInventoryValue = products.reduce((acc, p) => acc + p.stock * p.price, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  return (
    <div className="space-y-6">
      {/* 1. Quick Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3.5 border border-stone-200 shadow-xs">
          <div className="text-[11px] font-semibold text-stone-500 uppercase">Total Items</div>
          <div className="text-xl font-bold text-stone-900 mt-1 flex items-baseline gap-1">
            {totalItemsCount} <span className="text-xs font-normal text-stone-400">kinds</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-stone-200 shadow-xs">
          <div className="text-[11px] font-semibold text-stone-500 uppercase">Total Pieces</div>
          <div className="text-xl font-bold text-stone-900 mt-1 flex items-baseline gap-1">
            {totalStockUnits} <span className="text-xs font-normal text-stone-400">units</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-stone-200 shadow-xs">
          <div className="text-[11px] font-semibold text-stone-500 uppercase">Stock Value</div>
          <div className="text-xl font-bold text-[#7B001C] mt-1 font-mono">
            ₹{totalInventoryValue.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-stone-200 shadow-xs">
          <div className="text-[11px] font-semibold text-stone-500 uppercase">Low Stock Alert</div>
          <div className={`text-xl font-bold mt-1 flex items-center gap-1.5 ${lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {lowStockCount > 0 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {lowStockCount} items
          </div>
        </div>
      </div>

      {/* 2. Add New Product Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-[#7B001C] border-stone-200">
        <h2 className="text-base font-bold text-[#7B001C] flex items-center gap-2 mb-3">
          <Boxes className="w-5 h-5 text-amber-500" />
          Naya Item Jodein (Add Stock Item)
        </h2>

        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Item Name (Kapda / Beauty Product / Jewellery) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pure Silk Banarasi Saree, Matte Lipstick, Kurti..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm outline-none focus:border-[#7B001C] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none focus:border-[#7B001C]"
              >
                {(settings.categories || ['Clothes', 'Cosmetics', 'Jewellery', 'General']).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Bikri Mulya"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono outline-none focus:border-[#7B001C]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Cost Price (Khareed ₹)
              </label>
              <input
                type="number"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="Purchase rate"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono outline-none focus:border-[#7B001C]"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Qty (Piece) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="Pieces"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono outline-none focus:border-[#7B001C]"
                />
              </div>

              <div className="w-20">
                <label className="block text-xs font-semibold text-stone-600 mb-1">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-2 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none"
                >
                  {(settings.units || ['pcs', 'set', 'box', 'pair', 'mtr']).map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Barcode Generation & Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-stone-100 items-center">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Barcode Number (Auto Code ya Khud Daalein)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="e.g. KCC100201 or scan existing barcode"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono outline-none focus:border-[#7B001C]"
                />
                <button
                  type="button"
                  onClick={handleAutoGenerateBarcode}
                  className="px-3 py-2 bg-[#FFC107] hover:bg-amber-400 text-stone-900 rounded-xl text-xs font-bold shrink-0 transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Auto Code
                </button>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Aap Kapde ke tag ka barcode scan bhi kar sakte hain ya Auto Code se naya bana sakte hain.
              </p>
            </div>

            {/* Live Barcode Render Preview */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col items-center justify-center min-h-[75px]">
              {barcode.trim() ? (
                <BarcodeRenderer value={barcode} width={1.4} height={36} fontSize={10} />
              ) : (
                <span className="text-xs text-stone-400 italic">
                  Barcode preview yahan dikhega
                </span>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-[#7B001C] hover:bg-[#560013] text-white font-bold text-sm rounded-xl shadow transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Stock Save Karein (Save Product)
            </button>
          </div>
        </form>
      </div>

      {/* 3. Stock List & Inventory Table */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#7B001C]" />
            Stock Inventory List ({filteredProducts.length})
          </h2>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Khojein (Search name, barcode)..."
              className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none focus:border-[#7B001C]"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button
            onClick={() => setSelectedFilter('All')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedFilter === 'All'
                ? 'bg-[#7B001C] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Sabhi (All)
          </button>

          {(settings.categories || ['Clothes', 'Cosmetics', 'Jewellery', 'General']).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedFilter === cat
                  ? 'bg-[#7B001C] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}

          <button
            onClick={() => setSelectedFilter('LowStock')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedFilter === 'LowStock'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            ⚠️ Kam Stock ({lowStockCount})
          </button>
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-semibold bg-stone-50">
                <th className="py-2.5 px-3">Item Details</th>
                <th className="py-2.5 px-2">Category</th>
                <th className="py-2.5 px-2 text-right">Selling Price</th>
                <th className="py-2.5 px-2 text-right">Cost Price</th>
                <th className="py-2.5 px-2 text-center">In Stock</th>
                <th className="py-2.5 px-2 text-center">Barcode</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((p) => {
                const isLow = p.stock <= p.minStock;
                return (
                  <tr key={p.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-stone-900">{p.name}</div>
                      <div className="text-[10px] text-stone-400">Added: {p.createdAt}</div>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-700">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-stone-900">
                      ₹{p.price.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-stone-500">
                      ₹{p.costPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleQuickStockAdjust(p, -1)}
                          className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-[10px]"
                          title="-1 piece"
                        >
                          -
                        </button>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                            isLow
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {p.stock} {p.unit}
                        </span>
                        <button
                          onClick={() => handleQuickStockAdjust(p, 1)}
                          className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-[10px]"
                          title="+1 piece"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono text-[11px] text-stone-600">
                      <code>{p.barcode}</code>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPrintingProduct(p)}
                          className="p-1.5 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                          title="Print Barcode Tag / Sticker"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="p-1.5 rounded-lg text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                          title="Edit Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Kya aap "${p.name}" ko stock se hatana chahte hain?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Barcode Print Modal */}
      {printingProduct && (
        <BarcodePrintModal
          product={printingProduct}
          settings={settings}
          isOpen={Boolean(printingProduct)}
          onClose={() => setPrintingProduct(null)}
        />
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 border border-stone-200">
            <h3 className="font-bold text-sm text-[#7B001C] mb-3">Item Edit Karein</h3>
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-600 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-600 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-600 mb-1">Stock (Pieces)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stock: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-600 mb-1">Barcode</label>
                <input
                  type="text"
                  value={editingProduct.barcode}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, barcode: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-3 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#7B001C] text-white font-bold"
                >
                  Update Karein
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
