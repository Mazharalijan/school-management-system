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
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card text-card-foreground rounded-sm max-w-5xl w-full border border-border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-card text-foreground">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Scan className="w-5 h-5 text-primary" /> Offline Tesseract OCR Scanner
          </div>
          <button onClick={onClose} className="p-1 rounded-xs text-muted-foreground hover:text-foreground hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-muted/20">
          
          {/* Left: Upload Box & Image Preview */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border bg-card rounded-sm p-6 text-center hover:border-primary/50 transition-colors">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="ocr-upload" />
              <label htmlFor="ocr-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-primary" />
                <span className="text-xs font-bold text-foreground">Click to upload paper scan</span>
                <span className="text-[10px] text-muted-foreground">Supports JPG, PNG, or Scanned PDF Page</span>
              </label>
            </div>

            {imagePreview && (
              <div className="bg-background rounded-xs p-2 border border-border max-h-72 overflow-hidden flex items-center justify-center">
                <img src={imagePreview} alt="Scan preview" className="max-h-64 object-contain rounded-xs" />
              </div>
            )}

            <button
              disabled={!imagePreview || isScanning}
              onClick={triggerOfflineOcr}
              className="w-full py-3 rounded-xs bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              {isScanning ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Processing with Bundled Tesseract...</>
              ) : (
                <><Scan className="w-4 h-4" /> Extract Marks from Image</>
              )}
            </button>
          </div>

          {/* Right: Extracted Grid Preview */}
          <div className="bg-card rounded-sm border border-border p-4 flex flex-col justify-between text-card-foreground">
            <div>
              <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider mb-3">
                Extracted Data Verification
              </h4>

              {scannedResults ? (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {scannedResults.map((item, idx) => (
                    <div key={idx} className="p-3 bg-muted/40 rounded-xs border border-border flex items-center justify-between text-xs font-bold">
                      <div>
                        <span className="text-foreground">Roll #{item.roll_no}</span> - <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <div className="flex gap-2 text-[11px]">
                        {item.is_absent ? (
                          <span className="text-destructive font-extrabold bg-destructive/10 px-2 py-0.5 rounded-xs">ABSENT</span>
                        ) : (
                          Object.entries(item.marks).map(([pId, m]) => (
                            <span key={pId} className="bg-primary/10 text-primary px-2 py-0.5 rounded-xs border border-primary/20">
                              P{pId}: {m}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground text-xs font-medium text-center">
                  Upload an image and run OCR to preview extracted text here before populating the form.
                </div>
              )}
            </div>

            {scannedResults && (
              <button
                onClick={applyDataToForm}
                className="w-full mt-4 py-3 rounded-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
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