import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeRendererProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  lineColor?: string;
  className?: string;
}

export const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({
  value,
  width = 1.8,
  height = 42,
  displayValue = true,
  fontSize = 12,
  lineColor = '#000000',
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !value || !value.trim()) return;

    try {
      JsBarcode(svgRef.current, value.trim(), {
        format: 'CODE128',
        width,
        height,
        displayValue,
        fontSize,
        textMargin: 3,
        font: 'Poppins, sans-serif',
        lineColor,
        background: 'transparent',
      });
    } catch {
      // In case of unsupported character or format glitch, fallback cleanly
      if (svgRef.current) {
        svgRef.current.innerHTML = '';
      }
    }
  }, [value, width, height, displayValue, fontSize, lineColor]);

  if (!value || !value.trim()) {
    return (
      <div className="text-xs text-stone-400 italic py-2 text-center">
        No barcode provided
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg ref={svgRef} className="max-w-full h-auto overflow-visible" />
    </div>
  );
};
