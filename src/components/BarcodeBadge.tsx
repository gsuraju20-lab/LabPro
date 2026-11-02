import React, { useState } from 'react';
import { Printer, X } from 'lucide-react';

interface BarcodeBadgeProps {
  barcode: string;
  patientName?: string;
  patientId?: string;
  specimenType?: string;
  testNames?: string[];
  date?: string;
}

export const BarcodeBadge: React.FC<BarcodeBadgeProps> = ({
  barcode,
  patientName,
  patientId,
  specimenType,
  testNames,
  date,
}) => {
  const [showPrintLabel, setShowPrintLabel] = useState(false);

  // Generate deterministic barcode bar heights and widths from barcode string
  const bars = Array.from(barcode).map((char, index) => {
    const code = char.charCodeAt(0);
    const width = (code % 3) + 1.5;
    const isGap = (code + index) % 4 === 0;
    return { width, isGap };
  });

  return (
    <>
      <div className="inline-flex items-center gap-2 group">
        <div
          onClick={() => setShowPrintLabel(true)}
          title="Click to preview/print specimen tube label"
          className="cursor-pointer flex flex-col items-center p-1.5 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 transition-colors"
        >
          {/* Simulated Barcode */}
          <div className="flex items-end h-6 gap-[1.5px] px-1 bg-white border border-slate-200">
            {bars.map((bar, i) => (
              <span
                key={i}
                style={{
                  width: `${bar.width}px`,
                  backgroundColor: bar.isGap ? '#f8fafc' : '#0f172a',
                }}
                className="h-full inline-block"
              />
            ))}
          </div>
          <span className="font-mono text-[10px] font-semibold text-slate-700 tracking-wider mt-0.5">
            {barcode}
          </span>
        </div>

        <button
          onClick={() => setShowPrintLabel(true)}
          className="text-slate-400 hover:text-teal-700 p-1 rounded hover:bg-teal-50 transition-colors"
          title="Print Tube Label"
        >
          <Printer className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Printable Specimen Tube Label Modal */}
      {showPrintLabel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
              <span className="text-sm font-semibold tracking-wide">Specimen Tube Label Preview</span>
              <button
                onClick={() => setShowPrintLabel(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center">
              {/* Actual Printable Label Dimensions (approx 50mm x 25mm standard cryo/vacutainer label) */}
              <div
                id="printable-tube-label"
                className="w-72 bg-white border-2 border-dashed border-slate-400 p-3 rounded shadow-xs text-slate-900 font-sans"
              >
                <div className="flex items-start justify-between border-b border-slate-200 pb-1.5 mb-1.5">
                  <div>
                    <p className="font-bold text-xs uppercase leading-tight truncate max-w-[170px]">
                      {patientName || 'PATIENT NAME'}
                    </p>
                    <p className="text-[10px] font-mono text-slate-600">
                      ID: {patientId || 'PAT-2026-XXXX'}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-slate-100 rounded text-slate-700">
                    {specimenType || 'BLOOD'}
                  </span>
                </div>

                <div className="flex flex-col items-center py-1">
                  <div className="flex items-end h-8 gap-[2px] px-2 bg-white">
                    {bars.map((bar, i) => (
                      <span
                        key={i}
                        style={{
                          width: `${bar.width + 0.5}px`,
                          backgroundColor: bar.isGap ? '#f8fafc' : '#000000',
                        }}
                        className="h-full inline-block"
                      />
                    ))}
                  </div>
                  <span className="font-mono text-xs font-bold tracking-widest mt-1 text-slate-950">
                    *{barcode}*
                  </span>
                </div>

                <div className="mt-1 pt-1 border-t border-slate-200 text-[9px] text-slate-600 flex justify-between">
                  <span className="truncate max-w-[140px]">
                    {testNames && testNames.length > 0 ? testNames.join(', ') : 'CLINICAL LAB TEST'}
                  </span>
                  <span>{date || new Date().toISOString().split('T')[0]}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-4 text-center">
                Standard 50mm x 25mm barcode label format compatible with thermal tube label printers (Zebra, Brady, Dymo).
              </p>

              <div className="flex gap-3 mt-5 w-full">
                <button
                  onClick={() => window.print()}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-700 text-white rounded text-sm font-medium hover:bg-teal-800 transition-colors shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  Print Label
                </button>
                <button
                  onClick={() => setShowPrintLabel(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
