import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Product,
  CartItem,
  Invoice,
  StoreSettings,
  Customer,
  ParkedBill,
  HardwareConfig,
  InvoiceStyle,
} from '../types';
import {
  Barcode,
  Camera,
  Plus,
  Trash2,
  Receipt,
  RotateCcw,
  User,
  Phone,
  QrCode,
  Sparkles,
  ShoppingBag,
  Zap,
  Printer,
  PauseCircle,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CameraScannerModal } from './CameraScannerModal';
import { PrintableInvoice } from './PrintableInvoice';
import { UpiQrModal } from './UpiQrModal';
import { QuickActionsModal } from './QuickActionsModal';
import { DeviceConnectModal } from './DeviceConnectModal';

interface BillingTabProps {
  products: Product[];
  customers: Customer[];
  settings: StoreSettings;
  onInvoiceGenerated: (invoice: Invoice, updatedProducts: Product[]) => void;
  onAddOrUpdateCustomer: (customer: Customer) => void;
  onAddProduct: (product: Product) => void;
  onUpdateHardware: (hw: HardwareConfig) => void;
}

const PARKED_BILLS_KEY = 'kamakhya_parked_bills';

export const BillingTab: React.FC<BillingTabProps> = ({
  products,
  customers,
  settings,
  onInvoiceGenerated,
  onAddProduct,
  onUpdateHardware,
}) => {
  // Customer info
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qtyInput, setQtyInput] = useState<number>(1);
  const [barcodeSearchFeedback, setBarcodeSearchFeedback] = useState<string | null>(null);

  // Bill calculations
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>('flat');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(settings.defaultTaxPercent || 0);
  const [paymentMode, setPaymentMode] = useState<string>('Cash');
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Modals & previews
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [invoiceTemplate, setInvoiceTemplate] = useState<InvoiceStyle>(
    settings.invoiceTemplate || 'modern'
  );

  // Parked Bills state
  const [parkedBills, setParkedBills] = useState<ParkedBill[]>(() => {
    try {
      const stored = localStorage.getItem(PARKED_BILLS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Save parked bills to localStorage
  useEffect(() => {
    localStorage.setItem(PARKED_BILLS_KEY, JSON.stringify(parkedBills));
  }, [parkedBills]);

  // Audio beep player
  const playBeepSound = useCallback(() => {
    if (!settings.hardware?.scannerGunBeep) return;
    try {
      const audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, audioCtx.currentTime); // B5 crisp scanner beep
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {
      // Audio not permitted
    }
  }, [settings.hardware?.scannerGunBeep]);

  // Calculations
  const subtotal = cart.reduce((acc, it) => acc + it.total, 0);

  const calculatedDiscount =
    discountType === 'percent'
      ? Math.round((subtotal * (discountValue || 0)) / 100)
      : Math.min(subtotal, discountValue || 0);

  const taxableAmount = Math.max(0, subtotal - calculatedDiscount);
  const calculatedTax = Math.round((taxableAmount * (taxPercent || 0)) / 100);
  const grandTotal = Math.max(0, taxableAmount + calculatedTax);
  const changeDue = Math.max(0, (amountReceived || 0) - grandTotal);

  // Auto-focus barcode scanner on load for cashier speed
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Filter existing customers based on phone or name
  const filteredCustomers = customers.filter(
    (c) =>
      (custPhone && c.phone.includes(custPhone)) ||
      (custName && c.name.toLowerCase().includes(custName.toLowerCase()))
  );

  const selectExistingCustomer = (c: Customer) => {
    setCustName(c.name);
    setCustPhone(c.phone);
    setShowCustomerSuggestions(false);
  };

  // Add product to cart helper
  const addProductToCart = useCallback(
    (product: Product, quantityToAdd: number = 1) => {
      if (product.stock <= 0) {
        setBarcodeSearchFeedback(`Warning: "${product.name}" stock me nahi hai!`);
        setTimeout(() => setBarcodeSearchFeedback(null), 3000);
      }

      setCart((prev) => {
        const existingIndex = prev.findIndex((item) => item.productId === product.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          const newQty = updated[existingIndex].quantity + quantityToAdd;
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newQty,
            total: newQty * updated[existingIndex].price,
          };
          return updated;
        } else {
          const newItem: CartItem = {
            productId: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            quantity: quantityToAdd,
            barcode: product.barcode,
            unit: product.unit || 'pcs',
            total: product.price * quantityToAdd,
            hsnCode: product.hsnCode,
          };
          return [...prev, newItem];
        }
      });

      playBeepSound();
      setBarcodeSearchFeedback(`🔫 Added: ${product.name} (₹${product.price})`);
      setTimeout(() => setBarcodeSearchFeedback(null), 2500);
    },
    [playBeepSound]
  );

  // HARDWARE BARCODE SCANNER GUN GLOBAL KEYBOARD LISTENER
  // Scanners type rapid characters (< 40ms interval) terminated by Enter
  useEffect(() => {
    if (!settings.hardware?.scannerGunEnabled) return;

    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

      // If user is focused on customer name / search input, let standard input handle it
      // unless it's an ultra-fast burst from a physical scanner gun!
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime;
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 3 && timeDiff < 60) {
          // Scanner burst detected!
          e.preventDefault();
          const scannedCode = buffer.trim();
          buffer = '';

          const matched = products.find(
            (p) =>
              p.barcode.toLowerCase() === scannedCode.toLowerCase() ||
              p.id.toLowerCase() === scannedCode.toLowerCase()
          );

          if (matched) {
            addProductToCart(matched, 1);
          } else {
            setBarcodeSearchFeedback(`Gun Scanned code "${scannedCode}" not found in stock!`);
            setTimeout(() => setBarcodeSearchFeedback(null), 3500);
          }
        } else {
          buffer = '';
        }
        return;
      }

      // Record key if it's printable character
      if (e.key.length === 1) {
        if (timeDiff > 70) {
          // Reset buffer if typed slowly by human hand
          buffer = e.key;
        } else {
          buffer += e.key;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [products, addProductToCart, settings.hardware?.scannerGunEnabled]);

  // Barcode search / scan handler
  const handleBarcodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = barcodeInput.trim();
    if (!query) return;

    const found = products.find(
      (p) =>
        p.barcode.toLowerCase() === query.toLowerCase() ||
        p.id.toLowerCase() === query.toLowerCase()
    );

    if (found) {
      addProductToCart(found, qtyInput);
      setBarcodeInput('');
      setQtyInput(1);
    } else {
      setBarcodeSearchFeedback(`Barcode "${query}" nahi mila!`);
      setTimeout(() => setBarcodeSearchFeedback(null), 3500);
    }
  };

  // Direct dropdown item select
  const handleDropdownSelectAndAdd = () => {
    if (!selectedProductId) return;
    const prod = products.find((p) => p.id === selectedProductId);
    if (prod) {
      addProductToCart(prod, qtyInput);
      setSelectedProductId('');
      setQtyInput(1);
    }
  };

  // Update item quantity in cart
  const updateCartQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((it) =>
        it.productId === productId
          ? { ...it, quantity: newQty, total: newQty * it.price }
          : it
      )
    );
  };

  // Remove single item
  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((it) => it.productId !== productId));
  };

  // Clear entire cart
  const clearCart = () => {
    if (cart.length > 0 && !window.confirm('Kya aap cart khali karna chahte hain?')) return;
    setCart([]);
    setDiscountValue(0);
    setAmountReceived(0);
    setNotes('');
  };

  // Hold / Park Current Bill
  const handleParkCurrentBill = () => {
    if (cart.length === 0) {
      alert('Hold karne ke liye cart me item hona chahiye!');
      return;
    }

    const newParked: ParkedBill = {
      id: 'parked-' + Date.now(),
      customerName: custName.trim() || 'Walk-in Customer',
      customerPhone: custPhone.trim(),
      items: [...cart],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes,
    };

    setParkedBills((prev) => [newParked, ...prev]);
    setCart([]);
    setCustName('');
    setCustPhone('');
    setDiscountValue(0);
    setAmountReceived(0);
    setBarcodeSearchFeedback('Bill hold par rakh diya gaya! Aap naya bill bana sakte hain.');
    setTimeout(() => setBarcodeSearchFeedback(null), 3000);
  };

  // Resume Parked Bill
  const handleResumeParkedBill = (pb: ParkedBill) => {
    if (cart.length > 0) {
      if (
        !window.confirm(
          'Current cart me items hain. Kya aap unhe hata kar hold kiya hua bill load karna chahte hain?'
        )
      ) {
        return;
      }
    }

    setCart(pb.items);
    setCustName(pb.customerName === 'Walk-in Customer' ? '' : pb.customerName);
    setCustPhone(pb.customerPhone);
    setNotes(pb.notes || '');
    setParkedBills((prev) => prev.filter((b) => b.id !== pb.id));
    setBarcodeSearchFeedback(`Parked bill resumed: ${pb.customerName} (${pb.items.length} items)`);
    setTimeout(() => setBarcodeSearchFeedback(null), 2500);
  };

  // Delete Parked Bill
  const handleDeleteParkedBill = (billId: string) => {
    setParkedBills((prev) => prev.filter((b) => b.id !== billId));
  };

  // Add Custom Item On The Fly (from Quick Actions floating modal)
  const handleAddCustomItem = (newItem: CartItem, saveToCatalog: boolean) => {
    setCart((prev) => [...prev, newItem]);
    playBeepSound();

    if (saveToCatalog) {
      const newProduct: Product = {
        id: newItem.productId,
        name: newItem.name,
        category: newItem.category,
        price: newItem.price,
        costPrice: Math.round(newItem.price * 0.7),
        stock: 50,
        minStock: 5,
        barcode: newItem.barcode,
        unit: newItem.unit,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onAddProduct(newProduct);
      setBarcodeSearchFeedback(`Added custom item & saved to catalog: ${newItem.name}`);
    } else {
      setBarcodeSearchFeedback(`Custom item added to bill: ${newItem.name}`);
    }
    setTimeout(() => setBarcodeSearchFeedback(null), 2500);
  };

  // Apply Quick Preset Discount
  const handleApplyDiscount = (type: 'flat' | 'percent', val: number) => {
    setDiscountType(type);
    setDiscountValue(val);
  };

  // Generate Invoice
  const handleGenerateInvoice = () => {
    if (cart.length === 0) {
      alert('Pehle cart me koi item jodein! (Please add items to cart first)');
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const invoiceNum = `KCC-${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInvoice: Invoice = {
      id: 'inv-' + Date.now(),
      invoiceNumber: invoiceNum,
      date: dateStr,
      time: timeStr,
      customerName: custName.trim() || 'Cash Customer',
      customerPhone: custPhone.trim(),
      items: [...cart],
      subtotal,
      discountAmount: calculatedDiscount,
      discountPercent: discountType === 'percent' ? discountValue : 0,
      taxAmount: calculatedTax,
      taxPercent,
      grandTotal,
      paymentMode,
      amountReceived: amountReceived > 0 ? amountReceived : grandTotal,
      changeDue: paymentMode === 'Cash' ? changeDue : 0,
      status: paymentMode === 'Due' ? 'Due' : 'Paid',
      notes,
    };

    // Calculate updated stock inventory
    const updatedProducts = products.map((prod) => {
      const cartMatch = cart.find((c) => c.productId === prod.id);
      if (cartMatch) {
        return {
          ...prod,
          stock: Math.max(0, prod.stock - cartMatch.quantity),
        };
      }
      return prod;
    });

    onInvoiceGenerated(newInvoice, updatedProducts);
    setCurrentInvoice(newInvoice);

    // Auto-Print check
    if (settings.hardware?.autoPrintOnBill) {
      setTimeout(() => {
        window.print();
      }, 400);
    }

    // Celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#7B001C', '#FFC107', '#FFE082', '#000000'],
      });
    } catch {
      // ignore
    }

    // Reset current cart for next customer
    setCart([]);
    setDiscountValue(0);
    setAmountReceived(0);
    setNotes('');
    setCustName('');
    setCustPhone('');
  };

  return (
    <div className="space-y-5 relative">
      {/* 0. HARDWARE STATUS & SHORTCUTS TOOLBAR */}
      <div className="bg-gradient-to-r from-amber-50 to-stone-50 rounded-2xl p-3 border border-amber-200/80 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Barcode Gun indicator */}
          <button
            type="button"
            onClick={() => setIsDeviceModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-800 text-xs font-semibold hover:border-amber-400 hover:shadow-xs transition-all"
            title="Click to test or configure Barcode Scanner Gun"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-[#7B001C]">🔫 Scanner Gun:</span>
            <span className="text-emerald-700 font-medium">Ready (Auto-Detect)</span>
          </button>

          {/* Printer indicator */}
          <button
            type="button"
            onClick={() => setIsDeviceModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-800 text-xs font-semibold hover:border-amber-400 hover:shadow-xs transition-all"
            title="Click to test receipt printer connection"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-bold text-stone-800">🖨️ Printer:</span>
            <span className="text-blue-700 font-medium">
              {settings.hardware?.printerType === 'thermal80'
                ? 'Thermal 80mm'
                : settings.hardware?.printerType === 'thermal58'
                ? 'Thermal 58mm'
                : 'System / Wi-Fi'}
            </span>
          </button>

          {/* Parked bills badge */}
          {parkedBills.length > 0 && (
            <button
              type="button"
              onClick={() => setIsQuickActionsOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-100/80 text-amber-900 border border-amber-300 text-xs font-bold animate-pulse"
            >
              <PauseCircle className="w-3.5 h-3.5 text-amber-700" />
              <span>{parkedBills.length} Bill On Hold</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDeviceModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#7B001C] hover:bg-[#560013] text-[#FFC107] text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
          >
            <Zap className="w-3.5 h-3.5" /> Hardware Connect
          </button>
        </div>
      </div>

      {/* 1. Customer Info & Quick Autocomplete Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-[#7B001C] border-stone-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[#7B001C] flex items-center gap-2">
            <User className="w-4 h-4 text-amber-500" />
            Grahak Ki Jankari (Customer Details)
          </h2>
          <span className="text-[11px] text-stone-400">Optional for fast billing</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Grahak Ka Naam (Customer Name)
            </label>
            <input
              type="text"
              value={custName}
              onChange={(e) => {
                setCustName(e.target.value);
                setShowCustomerSuggestions(true);
              }}
              onFocus={() => setShowCustomerSuggestions(true)}
              placeholder="e.g. Pooja Sharma, Anita Ji..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm outline-none focus:border-[#7B001C] focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Mobile Number (WhatsApp Bill)
            </label>
            <input
              type="tel"
              value={custPhone}
              onChange={(e) => {
                setCustPhone(e.target.value);
                setShowCustomerSuggestions(true);
              }}
              onFocus={() => setShowCustomerSuggestions(true)}
              placeholder="10-digit mobile number"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm outline-none focus:border-[#7B001C] focus:bg-white transition-colors font-mono"
            />
          </div>

          {/* Autocomplete Suggestions */}
          {showCustomerSuggestions && (custName || custPhone) && filteredCustomers.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-30 bg-white border border-stone-200 rounded-xl shadow-xl mt-1 p-2 max-h-48 overflow-y-auto">
              <div className="text-[10px] uppercase font-bold text-stone-400 px-2 py-1 flex justify-between">
                <span>Existing Customers ({filteredCustomers.length})</span>
                <button
                  type="button"
                  onClick={() => setShowCustomerSuggestions(false)}
                  className="text-stone-500 hover:text-stone-800"
                >
                  Close
                </button>
              </div>
              {filteredCustomers.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectExistingCustomer(c)}
                  className="w-full text-left p-2 rounded-lg hover:bg-amber-50 flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <span className="font-semibold text-stone-800">{c.name}</span>
                    <span className="text-stone-400 ml-2 font-mono">{c.phone}</span>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Visits: <strong className="text-[#7B001C]">{c.visitCount}</strong>
                    {c.balanceDue > 0 && (
                      <span className="ml-2 bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                        Due: ₹{c.balanceDue}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Barcode Scan & Item Selector Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-[#FFC107] border-stone-200">
        <h2 className="text-base font-bold text-stone-800 flex items-center gap-2 mb-3">
          <Barcode className="w-5 h-5 text-[#7B001C]" />
          Item Chuniye ya Barcode Gun Se Scan Karein
        </h2>

        {/* Barcode Search Bar & Camera Trigger */}
        <form onSubmit={handleBarcodeSubmit} className="flex flex-col sm:flex-row gap-2 mb-3">
          <div className="relative flex-1">
            <input
              ref={barcodeInputRef}
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Barcode gun trigger karein ya code likhein (e.g. KCC100201)..."
              className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-mono outline-none focus:border-[#7B001C] focus:bg-white transition-colors"
            />
            <Barcode className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#7B001C] hover:bg-[#560013] text-[#FFC107] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Code
            </button>

            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="px-4 py-2.5 bg-[#FFC107] hover:bg-amber-400 text-stone-900 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              title="Open camera to scan barcode"
            >
              <Camera className="w-4 h-4" /> Camera Scan
            </button>
          </div>
        </form>

        {barcodeSearchFeedback && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2 font-medium shadow-xs animate-in fade-in">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{barcodeSearchFeedback}</span>
          </div>
        )}

        {/* Dropdown Selector for Manual Selection */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-stone-100">
          <div className="flex-1">
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none focus:border-[#7B001C]"
            >
              <option value="">-- Katalog Se Item Chunein (Select from Catalog) --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                  {p.name} [{p.category}] - ₹{p.price} ({p.stock} pcs bache)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-stone-100 rounded-xl border border-stone-300 px-2 py-1">
              <span className="text-[11px] text-stone-500 font-semibold mr-1">Qty:</span>
              <input
                type="number"
                min="1"
                value={qtyInput}
                onChange={(e) => setQtyInput(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-14 bg-transparent text-center font-bold text-xs outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleDropdownSelectAndAdd}
              disabled={!selectedProductId}
              className="px-4 py-2 bg-stone-800 disabled:opacity-40 hover:bg-stone-900 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Cart Me Daalein
            </button>
          </div>
        </div>
      </div>

      {/* 3. Current Cart & Billing Table */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#7B001C]" />
            <h2 className="text-base font-bold text-stone-900">
              Cart Items ({cart.reduce((a, b) => a + b.quantity, 0)})
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={handleParkCurrentBill}
                className="text-amber-800 hover:text-amber-950 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Hold current cart for another customer"
              >
                <PauseCircle className="w-3.5 h-3.5 text-amber-600" /> Hold Bill
              </button>
            )}
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-stone-400 hover:text-red-600 text-xs flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50">
            <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-stone-600 text-sm font-semibold">Cart abhi khali hai</p>
            <p className="text-stone-400 text-xs mt-1">
              Barcode gun se scan karein ya niche <strong>'+ Quick Actions'</strong> dabakar custom
              item jodein!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-semibold bg-stone-50">
                  <th className="py-2.5 px-3">Item</th>
                  <th className="py-2.5 px-2">Category</th>
                  <th className="py-2.5 px-2 text-right">Price</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-2 text-center w-10">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {cart.map((item) => (
                  <tr key={item.productId} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-stone-800">{item.name}</div>
                      <div className="text-[10px] text-stone-400 font-mono">{item.barcode}</div>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-600">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-medium text-stone-700">
                      ₹{item.price.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => updateCartQty(item.productId, item.quantity - 1)}
                          className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-xs font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.productId, item.quantity + 1)}
                          className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                      ₹{item.total.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="p-1 text-stone-400 hover:text-red-600 rounded transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bill Calculations & Payment Modes */}
        {cart.length > 0 && (
          <div className="mt-5 pt-4 border-t-2 border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Discounts, GST, & Payment Mode */}
            <div className="space-y-3">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <span className="text-xs font-semibold text-stone-700 block">
                  Chhoot / Discount & Tax
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex bg-white rounded-lg border border-stone-300 p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setDiscountType('flat')}
                      className={`px-2 py-1 rounded font-medium transition-colors ${
                        discountType === 'flat' ? 'bg-[#7B001C] text-white' : 'text-stone-600'
                      }`}
                    >
                      Flat ₹
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('percent')}
                      className={`px-2 py-1 rounded font-medium transition-colors ${
                        discountType === 'percent' ? 'bg-[#7B001C] text-white' : 'text-stone-600'
                      }`}
                    >
                      % Percent
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    placeholder={discountType === 'flat' ? '₹ Discount' : '% Discount'}
                    value={discountValue || ''}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-28 px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs outline-none font-mono"
                  />
                  <div className="flex items-center gap-1 text-xs ml-auto">
                    <span className="text-stone-500 font-medium">GST:</span>
                    <select
                      value={taxPercent}
                      onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                      className="bg-white border border-stone-300 rounded-lg px-2 py-1.5 text-xs outline-none"
                    >
                      <option value={0}>0%</option>
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18%</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  Payment Mode (Bhugtan Ka Madhyam)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(settings.paymentMethods || ['Cash', 'UPI', 'Card', 'Due']).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        setPaymentMode(mode);
                        if (mode === 'UPI' || mode.toLowerCase().includes('qr') || mode.toLowerCase().includes('upi')) {
                          setIsUpiModalOpen(true);
                        }
                      }}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center ${
                        paymentMode === mode
                          ? 'bg-[#7B001C] border-[#7B001C] text-white shadow-sm'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {mode === 'Cash' && '💵 Cash'}
                      {mode === 'UPI' && '📱 UPI'}
                      {mode === 'Card' && '💳 Card'}
                      {mode === 'Due' && '📝 Udhar'}
                      {!['Cash', 'UPI', 'Card', 'Due'].includes(mode) && `💳 ${mode}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash Tender & Change Calculator */}
              {paymentMode === 'Cash' && (
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-700">Cash Received (Grahak se mila):</span>
                    <input
                      type="number"
                      value={amountReceived || ''}
                      onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                      placeholder={`₹${grandTotal}`}
                      className="w-28 px-2 py-1 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold text-stone-800 text-right outline-none"
                    />
                  </div>

                  <div className="flex gap-1.5 justify-end">
                    {[grandTotal, Math.ceil(grandTotal / 100) * 100, Math.ceil(grandTotal / 500) * 500].filter(
                      (v, i, a) => v >= grandTotal && a.indexOf(v) === i
                    ).map((amt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAmountReceived(amt)}
                        className="px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-mono text-[10px] font-bold"
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>

                  {amountReceived > 0 && (
                    <div className="flex justify-between items-center pt-1 border-t border-amber-200 text-xs">
                      <span className="font-bold text-amber-900">Change Returned (Vapas Karein):</span>
                      <span className="font-mono font-extrabold text-sm text-[#7B001C]">
                        ₹{changeDue.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {paymentMode === 'UPI' && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-emerald-900 block">UPI QR Ready</span>
                    <span className="text-emerald-700 text-[11px] font-mono">{settings.upiId}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsUpiModalOpen(true)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs"
                  >
                    <QrCode className="w-3.5 h-3.5" /> Show QR
                  </button>
                </div>
              )}
            </div>

            {/* Right: Grand Total Box & Action Button */}
            <div className="flex flex-col justify-between bg-stone-50 p-4 rounded-xl border border-stone-200">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {calculatedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span className="font-mono font-semibold">-₹{calculatedDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {calculatedTax > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>GST ({taxPercent}%):</span>
                    <span className="font-mono">+₹{calculatedTax.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="pt-2 border-t-2 border-stone-300 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-stone-800">Kul Rakam (Total):</span>
                  <span className="text-2xl font-black text-[#7B001C] font-mono">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200 space-y-2">
                <button
                  type="button"
                  onClick={handleGenerateInvoice}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#7B001C] to-[#560013] hover:from-[#560013] hover:to-[#3b000d] text-[#FFC107] font-extrabold text-sm tracking-wide shadow-lg shadow-red-950/20 flex items-center justify-center gap-2 transition-all transform active:scale-98"
                >
                  <Receipt className="w-5 h-5 text-[#FFC107]" />
                  BILL GENERATE KAREIN (Generate Bill)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Bill Preview & Action Section */}
      {currentInvoice && (
        <div className="mt-6">
          <PrintableInvoice
            invoice={currentInvoice}
            settings={settings}
            templateStyle={invoiceTemplate}
            onClose={() => setCurrentInvoice(null)}
            onStyleChange={(st) => setInvoiceTemplate(st)}
          />
        </div>
      )}

      {/* 5. FLOATING QUICK ACTIONS BUTTON (Requested by user) */}
      <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40 no-print">
        <button
          type="button"
          onClick={() => setIsQuickActionsOpen(true)}
          className="group relative inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#FFC107] via-amber-400 to-[#FFB300] hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs sm:text-sm rounded-full shadow-2xl shadow-amber-950/30 border-2 border-amber-200 transform hover:scale-105 active:scale-95 transition-all"
        >
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
          </span>
          <div className="w-6 h-6 rounded-full bg-[#7B001C] text-[#FFC107] flex items-center justify-center font-bold">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span>+ Quick Actions (कस्टम आइटम)</span>
        </button>
      </div>

      {/* Modals */}
      <QuickActionsModal
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
        onAddCustomItemToCart={handleAddCustomItem}
        onApplyDiscount={handleApplyDiscount}
        cart={cart}
        customerName={custName}
        customerPhone={custPhone}
        parkedBills={parkedBills}
        onParkCurrentBill={handleParkCurrentBill}
        onResumeParkedBill={handleResumeParkedBill}
        onDeleteParkedBill={handleDeleteParkedBill}
        categories={settings.categories}
        units={settings.units}
      />

      <DeviceConnectModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        settings={settings}
        onUpdateHardware={onUpdateHardware}
        products={products}
      />

      <CameraScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onScan={(code) => {
          setBarcodeInput(code);
          const found = products.find((p) => p.barcode.toLowerCase() === code.toLowerCase());
          if (found) {
            addProductToCart(found, qtyInput);
            setBarcodeInput('');
          }
        }}
        products={products}
      />

      <UpiQrModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        amount={grandTotal}
        invoiceNo="NEW BILL"
        settings={settings}
        onPaymentReceived={() => {
          setPaymentMode('UPI');
          setAmountReceived(grandTotal);
        }}
      />
    </div>
  );
};
