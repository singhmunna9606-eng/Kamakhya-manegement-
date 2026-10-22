import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, RefreshCw, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
  products?: Product[];
}

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  products = [],
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'html5qr-camera-stream';

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880Hz A5 beep
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // Audio not permitted or supported
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    let isMounted = true;
    setErrorMsg(null);
    setLastScanned(null);

    const startScanner = async () => {
      try {
        // Wait briefly for modal DOM mount
        await new Promise((r) => setTimeout(r, 200));
        if (!isMounted) return;

        const html5QrCode = new Html5Qrcode(readerElementId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode },
          {
            fps: 12,
            qrbox: { width: 280, height: 180 },
            aspectRatio: 1.333,
          },
          (decodedText) => {
            playBeep();
            setLastScanned(decodedText);
            onScan(decodedText);
            // Brief delay then close
            setTimeout(() => {
              onClose();
            }, 600);
          },
          () => {
            // Frame scanned with no barcode - ignore
          }
        );

        if (isMounted) setIsScanning(true);
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
          setErrorMsg('Camera permission denied. Please allow camera access in your browser or select a test barcode below.');
        } else {
          setErrorMsg('Unable to access camera. You can also pick from existing products below to simulate a scan:');
        }
        setIsScanning(false);
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [isOpen, facingMode]);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch {
        // Ignore stop error
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const toggleCamera = () => {
    stopScanner().then(() => {
      setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-amber-200/50 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7B001C] to-[#560013] text-white p-4 flex items-center justify-between border-b-2 border-amber-400">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-[#560013] flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Barcode & QR Scanner</h3>
              <p className="text-xs text-amber-200">Live Camera Barcode Reader</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleCamera}
              title="Switch Camera (Front/Back)"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-200 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scanner View Area */}
        <div className="p-4 flex-1 overflow-y-auto">
          {lastScanned && (
            <div className="mb-3 p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-emerald-800 text-sm animate-pulse">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong>Scanned Barcode:</strong> <span className="font-mono">{lastScanned}</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-3 p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* HTML5 QR Container */}
          <div className="relative rounded-xl overflow-hidden bg-stone-900 min-h-[220px] flex flex-col items-center justify-center border-2 border-stone-800">
            <div id={readerElementId} className="w-full"></div>
            {!isScanning && !errorMsg && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                <span className="text-xs font-medium">Starting camera feed...</span>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-stone-500 mt-2">
            Center barcode or QR inside the red frame. Barcode will scan automatically.
          </p>

          {/* Fast Test Barcode Picker (Very helpful if camera isn't available or for quick testing) */}
          <div className="mt-4 pt-3 border-t border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Quick Barcode Click Test:
              </span>
              <span className="text-[10px] text-stone-400">{products.length} Items</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {products.slice(0, 8).map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    playBeep();
                    setLastScanned(p.barcode);
                    onScan(p.barcode);
                    setTimeout(onClose, 300);
                  }}
                  className="text-left p-2 rounded-lg bg-stone-50 hover:bg-amber-50 hover:border-amber-400 border border-stone-200 transition-colors flex flex-col text-xs"
                >
                  <span className="font-medium text-stone-800 truncate">{p.name}</span>
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mt-0.5">
                    <span className="font-mono text-amber-900 bg-amber-100/60 px-1 rounded">{p.barcode}</span>
                    <span className="font-bold text-[#7B001C]">₹{p.price}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
          >
            Band Karein (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
