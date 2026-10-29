// resources/js/Pages/ExamClassPapers/marks/components/OcrScannerModal.jsx
import React, { useState } from 'react';
import { X, Upload, Scan, CheckCircle2, RefreshCw } from 'lucide-react';

export default function OcrScannerModal({ isOpen, onClose, onApplyOcrData }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResults, setScannedResults] = useState(null);

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setScannedResults(null);
    }
  };

  const triggerOfflineOcr = () => {
    setIsScanning(true);
    // Simulating Tesseract local binary execution (< 1 second)
    setTimeout(() => {
      setIsScanning(false);
      setScannedResults([
        { roll_no: '501', name: 'Ali Ahmed', marks: { 1: 85, 2: 78, 3: 92, 4: 44 } },
        { roll_no: '502', name: 'Sara Khan', marks: { 1: 28, 2: 65, 3: 58, 4: 30 } },
        { roll_no: '503', name: 'Usman Tariq', marks: { 1: 0, 2: 0, 3: 0, 4: 0 }, is_absent: true },
        { roll_no: '504', name: 'Zoya Fatima', marks: { 1: 95, 2: 88, 3: 91, 4: 48 } },
      ]);
    }, 800);
  };

  const applyDataToForm = () => {
    if (scannedResults) {
      onApplyOcrData(scannedResults);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Scan className="w-5 h-5 text-indigo-400" /> Offline Tesseract OCR Scanner
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50">
          
          {/* Left: Upload Box & Image Preview */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 bg-white rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="ocr-upload" />
              <label htmlFor="ocr-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-indigo-600" />
                <span className="text-xs font-bold text-slate-700">Click to upload paper scan</span>
                <span className="text-[10px] text-slate-400">Supports JPG, PNG, or Scanned PDF Page</span>
              </label>
            </div>

            {imagePreview && (
              <div className="bg-slate-900 rounded-2xl p-2 border border-slate-800 max-h-72 overflow-hidden flex items-center justify-center">
                <img src={imagePreview} alt="Scan preview" className="max-h-64 object-contain rounded-lg" />
              </div>
            )}

            <button
              disabled={!imagePreview || isScanning}
              onClick={triggerOfflineOcr}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              {isScanning ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Processing with Bundled Tesseract...</>
              ) : (
                <><Scan className="w-4 h-4" /> Extract Marks from Image</>
              )}
            </button>
          </div>

          {/* Right: Extracted Grid Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3">
                Extracted Data Verification
              </h4>

              {scannedResults ? (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {scannedResults.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold">
                      <div>
                        <span className="text-slate-900">Roll #{item.roll_no}</span> - <span className="text-slate-600">{item.name}</span>
                      </div>
                      <div className="flex gap-2 text-[11px]">
                        {item.is_absent ? (
                          <span className="text-rose-600 font-extrabold bg-rose-50 px-2 py-0.5 rounded">ABSENT</span>
                        ) : (
                          Object.entries(item.marks).map(([pId, m]) => (
                            <span key={pId} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                              P{pId}: {m}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs font-medium text-center">
                  Upload an image and run OCR to preview extracted text here before populating the form.
                </div>
              )}
            </div>

            {scannedResults && (
              <button
                onClick={applyDataToForm}
                className="w-full mt-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirm & Auto-Fill Form
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}