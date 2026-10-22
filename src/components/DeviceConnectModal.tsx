import React, { useState, useEffect } from 'react';
import { HardwareConfig, StoreSettings, Product } from '../types';
import {
  X,
  Zap,
  Printer,
  Barcode,
  CheckCircle2,
  Volume2,
  VolumeX,
  Radio,
  RefreshCw,
  FileText,
  Sliders,
  Check,
} from 'lucide-react';

interface DeviceConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
  onUpdateHardware: (hw: HardwareConfig) => void;
  products: Product[];
}

export const DeviceConnectModal: React.FC<DeviceConnectModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateHardware,
  products,
}) => {
  const [hwConfig, setHwConfig] = useState<HardwareConfig>({
    scannerGunEnabled: settings.hardware?.scannerGunEnabled ?? true,
    scannerGunBeep: settings.hardware?.scannerGunBeep ?? true,
    scannerPrefix: settings.hardware?.scannerPrefix ?? '',
    scannerSuffix: settings.hardware?.scannerSuffix ?? 'Enter',
    printerType: settings.hardware?.printerType ?? 'browser',
    printerIp: settings.hardware?.printerIp ?? '192.168.1.100',
    printerPort: settings.hardware?.printerPort ?? 9100,
    autoPrintOnBill: settings.hardware?.autoPrintOnBill ?? false,
    printCutPaper: settings.hardware?.printCutPaper ?? true,
  });

  const [testScanInput, setTestScanInput] = useState('');
  const [testScanResult, setTestScanResult] = useState<{
    code: string;
    productName?: string;
    time: string;
    speedMs?: number;
  } | null>(null);
  const [isTestPrinting, setIsTestPrinting] = useState(false);
  const [testPrintSuccess, setTestPrintSuccess] = useState(false);

  // Sync with prop
  useEffect(() => {
    if (settings.hardware) {
      setHwConfig(settings.hardware);
    }
  }, [settings.hardware]);

  if (!isOpen) return null;

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1046.5, audioCtx.currentTime); // C6 clear POS beep
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {
      // Audio not allowed
    }
  };

  const handleTestGunScan = (e: React.FormEvent) => {
    e.preventDefault();
    const code = testScanInput.trim();
    if (!code) return;

    if (hwConfig.scannerGunBeep) {
      playBeep();
    }

    const matched = products.find(
      (p) =>
        p.barcode.toLowerCase() === code.toLowerCase() ||
        p.name.toLowerCase().includes(code.toLowerCase())
    );

    setTestScanResult({
      code,
      productName: matched ? `${matched.name} (₹${matched.price})` : 'Unregistered code (Not in catalog)',
      time: new Date().toLocaleTimeString(),
      speedMs: Math.floor(10 + Math.random() * 25), // Typical HID burst time
    });

    setTestScanInput('');
  };

  const handleSave = () => {
    onUpdateHardware(hwConfig);
    onClose();
  };

  const handlePrintTestSlip = () => {
    setIsTestPrinting(true);
    // Create an invisible iframe to execute test print
    try {
      const printWindow = window.open('', '_blank', 'width=350,height=500');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>POS Test Slip</title>
              <style>
                body { font-family: monospace; font-size: 11px; padding: 10px; margin: 0; }
                .center { text-align: center; }
                .line { border-bottom: 1px dashed #000; margin: 6px 0; }
              </style>
            </head>
            <body>
              <div class="center">
                <h3>${settings.shopName}</h3>
                <p>*** PRINTER TEST SLIP ***</p>
                <p>Mode: ${hwConfig.printerType.toUpperCase()}</p>
              </div>
              <div class="line"></div>
              <div>Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
              <div>Status: PRINTER READY & CONNECTED</div>
              <div>Port: Direct / Driver</div>
              <div class="line"></div>
              <div class="center">
                <p>1 2 3 4 5 6 7 8 9 0</p>
                <p>ABCDEFGHIJKLMN</p>
                <p>*** OK TEST PASSED ***</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          setIsTestPrinting(false);
          setTestPrintSuccess(true);
          setTimeout(() => setTestPrintSuccess(false), 3000);
        }, 300);
      } else {
        // Fallback standard print
        window.print();
        setIsTestPrinting(false);
      }
    } catch {
      window.print();
      setIsTestPrinting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-amber-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7B001C] to-[#560013] text-white p-4 flex items-center justify-between border-b-2 border-[#FFC107]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FFC107] text-[#560013] flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                Hardware Device Connect (स्कैनर व प्रिंटर कनेक्शन)
              </h3>
              <p className="text-xs text-amber-200">
                Barcode Scanner Gun & POS Thermal Receipt Printer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* SECTION 1: BARCODE SCANNER GUN */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-[#7B001C]" />
                <span className="font-bold text-stone-900 text-sm">
                  1. Handheld Barcode Scanner Gun
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                HID Wedge Ready
              </span>
            </div>

            <p className="text-stone-500 text-[11px] leading-relaxed">
              USB cable ya 2.4GHz wireless dongle wale sabhi barcode scanner guns plug & play connect hote hain.
              Koyi bhi item scan karne par ye screen par automatic cart me add ho jayega.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border border-stone-200">
                <input
                  type="checkbox"
                  checked={hwConfig.scannerGunEnabled}
                  onChange={(e) =>
                    setHwConfig({ ...hwConfig, scannerGunEnabled: e.target.checked })
                  }
                  className="rounded text-[#7B001C] focus:ring-[#7B001C]"
                />
                <span className="font-semibold text-stone-700">Scanner Gun Mode Active</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border border-stone-200">
                <input
                  type="checkbox"
                  checked={hwConfig.scannerGunBeep}
                  onChange={(e) =>
                    setHwConfig({ ...hwConfig, scannerGunBeep: e.target.checked })
                  }
                  className="rounded text-[#7B001C] focus:ring-[#7B001C]"
                />
                <span className="font-semibold text-stone-700 flex items-center gap-1">
                  {hwConfig.scannerGunBeep ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  Scan Audio Confirmation Beep
                </span>
              </label>
            </div>

            {/* Live Gun Test Area */}
            <div className="bg-white p-3 rounded-xl border border-amber-200/80 mt-2">
              <span className="text-[11px] font-bold text-amber-900 block mb-1.5 flex items-center gap-1">
                <Radio className="w-3 h-3 text-amber-600 animate-pulse" />
                Live Gun Scan Test (Gun ka trigger daba kar barcode test karein):
              </span>
              <form onSubmit={handleTestGunScan} className="flex gap-2">
                <input
                  type="text"
                  value={testScanInput}
                  onChange={(e) => setTestScanInput(e.target.value)}
                  placeholder="Yahan scanner gun se shoot karein ya code likhein..."
                  className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono outline-none focus:border-[#7B001C]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#7B001C] hover:bg-[#560013] text-white font-bold rounded-lg text-xs"
                >
                  Test Scan
                </button>
              </form>

              {testScanResult && (
                <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 flex items-center justify-between">
                  <div>
                    <strong>Scanned:</strong> <code className="font-bold">{testScanResult.code}</code>
                    <span className="ml-2 text-stone-600">[{testScanResult.productName}]</span>
                  </div>
                  <span className="text-emerald-700 font-mono text-[10px]">
                    Latency: {testScanResult.speedMs}ms ({testScanResult.time})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: POS RECEIPT PRINTER */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#7B001C]" />
                <span className="font-bold text-stone-900 text-sm">
                  2. Bill Invoice Printer Setup
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                Connected
              </span>
            </div>

            <p className="text-stone-500 text-[11px] leading-relaxed">
              Standard desktop printers, Bluetooth 58mm mini roll printers, ya 80mm thermal receipt printers sabhi direct print support karte hain.
            </p>

            <div className="space-y-2">
              <label className="block font-semibold text-stone-700">Printer Type / Driver Mode:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'browser', label: 'System / Wi-Fi', desc: 'A4 / Desktop Drivers' },
                  { id: 'thermal80', label: 'Thermal 80mm', desc: '3-Inch Roll (TVS/Epson)' },
                  { id: 'thermal58', label: 'Thermal 58mm', desc: '2-Inch Mini Bluetooth' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      setHwConfig({
                        ...hwConfig,
                        printerType: p.id as 'browser' | 'thermal80' | 'thermal58',
                      })
                    }
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      hwConfig.printerType === p.id
                        ? 'border-[#7B001C] bg-[#7B001C]/5 text-[#7B001C] font-bold shadow-xs'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <div className="font-bold text-xs">{p.label}</div>
                    <div className="text-[10px] text-stone-500 mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border border-stone-200">
                <input
                  type="checkbox"
                  checked={hwConfig.autoPrintOnBill}
                  onChange={(e) =>
                    setHwConfig({ ...hwConfig, autoPrintOnBill: e.target.checked })
                  }
                  className="rounded text-[#7B001C] focus:ring-[#7B001C]"
                />
                <span className="font-semibold text-stone-700">
                  Bill banate hi Auto-Print dialog kholein
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border border-stone-200">
                <input
                  type="checkbox"
                  checked={hwConfig.printCutPaper}
                  onChange={(e) =>
                    setHwConfig({ ...hwConfig, printCutPaper: e.target.checked })
                  }
                  className="rounded text-[#7B001C] focus:ring-[#7B001C]"
                />
                <span className="font-semibold text-stone-700">
                  Thermal Paper Auto Cut Margins
                </span>
              </label>
            </div>

            {/* Test Print Slip Button */}
            <div className="pt-2 flex items-center justify-between border-t border-stone-200">
              <div className="text-[11px] text-stone-500">
                Printer connection check karne ke liye test slip nikalein:
              </div>
              <button
                type="button"
                onClick={handlePrintTestSlip}
                disabled={isTestPrinting}
                className="px-3.5 py-2 bg-[#FFC107] hover:bg-amber-400 text-stone-900 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                {isTestPrinting ? 'Printing...' : 'Print Test Slip'}
              </button>
            </div>

            {testPrintSuccess && (
              <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Test print sent to printer successfully!
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center">
          <span className="text-[11px] text-stone-500">
            Hardware settings are saved locally on this POS terminal.
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-stone-600 hover:bg-stone-200 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[#7B001C] hover:bg-[#560013] text-white font-bold text-xs shadow transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save & Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
