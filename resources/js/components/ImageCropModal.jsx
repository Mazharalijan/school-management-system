import React, { useState, useRef, useEffect, useCallback } from 'react';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    ZoomIn,
    ZoomOut,
    RotateCw,
    RotateCcw,
    Maximize2,
    Crop,
    Check,
    Palette,
    Sliders,
    Sparkles,
    Circle,
    Square,
    RefreshCw
} from 'lucide-react';

export const PRESET_BG_COLORS = [
    { id: 'original', name: 'Original', hex: 'transparent', border: 'border-slate-300' },
    { id: 'white', name: 'Pure White', hex: '#FFFFFF', border: 'border-slate-300' },
    { id: 'green', name: 'Passport Green', hex: '#166534', border: 'border-emerald-600' },
    { id: 'blue', name: 'Official Blue', hex: '#1D4ED8', border: 'border-blue-600' },
];

export default function ImageCropModal({
    isOpen,
    imageSrc,
    onClose,
    onApply,
    initialBgColor = 'original',
}) {
    const canvasRef = useRef(null);
    const [imageObj, setImageObj] = useState(null);

    // Transform State
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const [aspectRatio, setAspectRatio] = useState('1:1'); // '1:1' or '3:4'

    // Background State
    const [bgColor, setBgColor] = useState(initialBgColor);
    const [bgMode, setBgMode] = useState('smart_replace'); // 'smart_replace' or 'fill_fit'
    const [tolerance, setTolerance] = useState(32);
    const [showCircleGuide, setShowCircleGuide] = useState(true);

    // Drag tracking
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });

    // Load source image
    useEffect(() => {
        if (!imageSrc) {
            setImageObj(null);
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            setImageObj(img);
            // Reset transforms on new image
            setZoom(1);
            setOffset({ x: 0, y: 0 });
            setRotation(0);
            setBgColor(initialBgColor || 'original');
        };
        img.src = imageSrc;
    }, [imageSrc, initialBgColor, isOpen]);

    // Color distance helper (Euclidean in RGB space)
    const colorDist = (r1, g1, b1, r2, g2, b2) => {
        return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
    };

    // Convert hex to RGB
    const hexToRgb = (hex) => {
        if (hex === '#FFFFFF') return { r: 255, g: 255, b: 255 };
        if (hex === '#166534') return { r: 22, g: 101, b: 52 };
        if (hex === '#1D4ED8') return { r: 29, g: 78, b: 216 };
        return null;
    };

    // Render interactive preview
    const drawPreview = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !imageObj) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // 1. Determine active crop frame
        let cropW = width - 40;
        let cropH = height - 40;
        if (aspectRatio === '1:1') {
            const side = Math.min(cropW, cropH);
            cropW = side;
            cropH = side;
        } else if (aspectRatio === '3:4') {
            cropW = Math.min(cropW, (cropH * 3) / 4);
            cropH = (cropW * 4) / 3;
        }

        const cropX = (width - cropW) / 2;
        const cropY = (height - cropH) / 2;

        // 2. Offscreen rendering for crop area
        const offCanvas = document.createElement('canvas');
        offCanvas.width = cropW;
        offCanvas.height = cropH;
        const offCtx = offCanvas.getContext('2d');

        // Fill background color if requested
        const targetRgb = hexToRgb(
            PRESET_BG_COLORS.find((c) => c.id === bgColor)?.hex
        );

        if (targetRgb) {
            offCtx.fillStyle = `rgb(${targetRgb.r}, ${targetRgb.g}, ${targetRgb.b})`;
            offCtx.fillRect(0, 0, cropW, cropH);
        } else {
            offCtx.fillStyle = '#f8fafc';
            offCtx.fillRect(0, 0, cropW, cropH);
        }

        // Draw transformed image
        offCtx.save();
        offCtx.translate(cropW / 2 + offset.x, cropH / 2 + offset.y);
        offCtx.rotate((rotation * Math.PI) / 180);
        offCtx.scale(zoom, zoom);

        // Center draw
        const imgW = imageObj.naturalWidth || imageObj.width;
        const imgH = imageObj.naturalHeight || imageObj.height;
        // Base scale to fit inside crop frame
        const baseScale = Math.max(cropW / imgW, cropH / imgH);
        const renderW = imgW * baseScale;
        const renderH = imgH * baseScale;

        offCtx.drawImage(
            imageObj,
            -renderW / 2,
            -renderH / 2,
            renderW,
            renderH
        );
        offCtx.restore();

        // 3. Smart Background Color Replacement (if active)
        if (targetRgb && bgMode === 'smart_replace') {
            try {
                const imgData = offCtx.getImageData(0, 0, cropW, cropH);
                const data = imgData.data;

                // Sample corners for backdrop color
                const sampleRadius = 4;
                let sumR = 0, sumG = 0, sumB = 0, count = 0;
                const samplePoints = [
                    [sampleRadius, sampleRadius],
                    [cropW - sampleRadius - 1, sampleRadius],
                    [sampleRadius, cropH - sampleRadius - 1],
                    [cropW - sampleRadius - 1, cropH - sampleRadius - 1],
                ];

                samplePoints.forEach(([sx, sy]) => {
                    const idx = (Math.floor(sy) * cropW + Math.floor(sx)) * 4;
                    sumR += data[idx];
                    sumG += data[idx + 1];
                    sumB += data[idx + 2];
                    count++;
                });

                const bgR = sumR / count;
                const bgG = sumG / count;
                const bgB = sumB / count;

                const feather = 18;

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const a = data[i + 3];

                    if (a < 10) {
                        // Transparent pixel: fill target color
                        data[i] = targetRgb.r;
                        data[i + 1] = targetRgb.g;
                        data[i + 2] = targetRgb.b;
                        data[i + 3] = 255;
                        continue;
                    }

                    const dist = colorDist(r, g, b, bgR, bgG, bgB);

                    if (dist < tolerance) {
                        data[i] = targetRgb.r;
                        data[i + 1] = targetRgb.g;
                        data[i + 2] = targetRgb.b;
                    } else if (dist < tolerance + feather) {
                        // Smooth blend ratio
                        const t = (dist - tolerance) / feather;
                        data[i] = Math.round(targetRgb.r * (1 - t) + r * t);
                        data[i + 1] = Math.round(targetRgb.g * (1 - t) + g * t);
                        data[i + 2] = Math.round(targetRgb.b * (1 - t) + b * t);
                    }
                }

                offCtx.putImageData(imgData, 0, 0);
            } catch (e) {
                // Ignore if security blocks getImageData on tainted canvas
            }
        }

        // 4. Render to main canvas
        ctx.drawImage(offCanvas, cropX, cropY);

        // 5. Darkened overlay outside crop area
        ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
        ctx.fillRect(0, 0, width, cropY); // top
        ctx.fillRect(0, cropY + cropH, width, height - (cropY + cropH)); // bottom
        ctx.fillRect(0, cropY, cropX, cropH); // left
        ctx.fillRect(cropX + cropW, cropY, width - (cropX + cropW), cropH); // right

        // 6. Border & Grid Guides
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(cropX, cropY, cropW, cropH);

        // Subtle rule of thirds lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cropX + cropW / 3, cropY);
        ctx.lineTo(cropX + cropW / 3, cropY + cropH);
        ctx.moveTo(cropX + (cropW * 2) / 3, cropY);
        ctx.lineTo(cropX + (cropW * 2) / 3, cropY + cropH);
        ctx.moveTo(cropX, cropY + cropH / 3);
        ctx.lineTo(cropX + cropW, cropY + cropH / 3);
        ctx.moveTo(cropX, cropY + (cropH * 2) / 3);
        ctx.lineTo(cropX + cropW, cropY + (cropH * 2) / 3);
        ctx.stroke();

        // 7. Circular Avatar Guide (if enabled and 1:1)
        if (showCircleGuide && aspectRatio === '1:1') {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(cropX + cropW / 2, cropY + cropH / 2, cropW / 2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }, [
        imageObj,
        zoom,
        offset,
        rotation,
        aspectRatio,
        bgColor,
        bgMode,
        tolerance,
        showCircleGuide,
    ]);

    useEffect(() => {
        drawPreview();
    }, [drawPreview]);

    // Mouse drag controls for panning
    const handleMouseDown = (e) => {
        isDraggingRef.current = true;
        dragStartRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    };

    const handleMouseMove = (e) => {
        if (!isDraggingRef.current) return;
        setOffset({
            x: e.clientX - dragStartRef.current.x,
            y: e.clientY - dragStartRef.current.y,
        });
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
    };

    // Wheel zoom
    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.08 : -0.08;
        setZoom((prev) => Math.min(3, Math.max(0.5, prev + delta)));
    };

    // Reset crop & transforms
    const handleReset = () => {
        setZoom(1);
        setOffset({ x: 0, y: 0 });
        setRotation(0);
        setTolerance(32);
        setBgColor('original');
    };

    // Final High-Res Export
    const handleApply = () => {
        if (!imageObj) return;

        const targetW = aspectRatio === '1:1' ? 500 : 450;
        const targetH = aspectRatio === '1:1' ? 500 : 600;

        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = targetW;
        exportCanvas.height = targetH;
        const ctx = exportCanvas.getContext('2d');

        const targetRgb = hexToRgb(
            PRESET_BG_COLORS.find((c) => c.id === bgColor)?.hex
        );

        // Fill target background
        if (targetRgb) {
            ctx.fillStyle = `rgb(${targetRgb.r}, ${targetRgb.g}, ${targetRgb.b})`;
            ctx.fillRect(0, 0, targetW, targetH);
        } else {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, targetW, targetH);
        }

        ctx.save();
        // Scale ratio from preview canvas crop to target
        const previewCanvas = canvasRef.current;
        let cropW = previewCanvas ? previewCanvas.width - 40 : 360;
        let cropH = previewCanvas ? previewCanvas.height - 40 : 360;
        if (aspectRatio === '1:1') {
            const side = Math.min(cropW, cropH);
            cropW = side;
            cropH = side;
        } else {
            cropW = Math.min(cropW, (cropH * 3) / 4);
            cropH = (cropW * 4) / 3;
        }

        const scaleRatio = targetW / cropW;

        ctx.translate(targetW / 2 + offset.x * scaleRatio, targetH / 2 + offset.y * scaleRatio);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom * scaleRatio, zoom * scaleRatio);

        const imgW = imageObj.naturalWidth || imageObj.width;
        const imgH = imageObj.naturalHeight || imageObj.height;
        const baseScale = Math.max(cropW / imgW, cropH / imgH);
        const renderW = imgW * baseScale;
        const renderH = imgH * baseScale;

        ctx.drawImage(imageObj, -renderW / 2, -renderH / 2, renderW, renderH);
        ctx.restore();

        // Apply Smart Background Replacement at high-res
        if (targetRgb && bgMode === 'smart_replace') {
            try {
                const imgData = ctx.getImageData(0, 0, targetW, targetH);
                const data = imgData.data;

                const sampleRadius = 6;
                let sumR = 0, sumG = 0, sumB = 0, count = 0;
                const samplePoints = [
                    [sampleRadius, sampleRadius],
                    [targetW - sampleRadius - 1, sampleRadius],
                    [sampleRadius, targetH - sampleRadius - 1],
                    [targetW - sampleRadius - 1, targetH - sampleRadius - 1],
                ];

                samplePoints.forEach(([sx, sy]) => {
                    const idx = (Math.floor(sy) * targetW + Math.floor(sx)) * 4;
                    sumR += data[idx];
                    sumG += data[idx + 1];
                    sumB += data[idx + 2];
                    count++;
                });

                const bgR = sumR / count;
                const bgG = sumG / count;
                const bgB = sumB / count;
                const feather = 20;

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const a = data[i + 3];

                    if (a < 10) {
                        data[i] = targetRgb.r;
                        data[i + 1] = targetRgb.g;
                        data[i + 2] = targetRgb.b;
                        data[i + 3] = 255;
                        continue;
                    }

                    const dist = colorDist(r, g, b, bgR, bgG, bgB);

                    if (dist < tolerance) {
                        data[i] = targetRgb.r;
                        data[i + 1] = targetRgb.g;
                        data[i + 2] = targetRgb.b;
                    } else if (dist < tolerance + feather) {
                        const t = (dist - tolerance) / feather;
                        data[i] = Math.round(targetRgb.r * (1 - t) + r * t);
                        data[i + 1] = Math.round(targetRgb.g * (1 - t) + g * t);
                        data[i + 2] = Math.round(targetRgb.b * (1 - t) + b * t);
                    }
                }

                ctx.putImageData(imgData, 0, 0);
            } catch (e) {
                // Fallback
            }
        }

        exportCanvas.toBlob(
            (blob) => {
                if (!blob) return;
                const file = new File([blob], 'profile_photo.jpg', {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });
                const previewUrl = URL.createObjectURL(blob);
                onApply({
                    file,
                    previewUrl,
                    backgroundColor: bgColor,
                });
                onClose();
            },
            'image/jpeg',
            0.92
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Crop & Customize Profile Photo"
            maxWidth="sm:max-w-3xl"
            footer={
                <div className="flex items-center justify-between w-full">
                    <Button type="button" variant="ghost" onClick={handleReset} className="text-xs text-slate-500">
                        <RefreshCw className="w-3.5 h-3.5 mr-1" />
                        Reset Adjustments
                    </Button>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleApply}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Check className="w-4 h-4 mr-1.5" />
                            Apply & Use Photo
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Viewport Canvas */}
                <div className="md:col-span-7 flex flex-col items-center">
                    <div
                        className="relative border-2 border-slate-800 bg-slate-900 rounded-lg overflow-hidden cursor-move select-none shadow-inner"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onWheel={handleWheel}
                    >
                        <canvas
                            ref={canvasRef}
                            width={380}
                            height={380}
                            className="block"
                        />
                        <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-[11px] text-white px-2 py-0.5 rounded border border-slate-700">
                            Drag to reposition &bull; Scroll to zoom
                        </div>
                    </div>

                    {/* Quick Canvas Controls */}
                    <div className="flex items-center gap-3 mt-3 w-full max-w-[380px]">
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200">
                            <button
                                type="button"
                                onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                                title="Zoom Out"
                                className="p-1 hover:bg-white rounded text-slate-700 transition"
                            >
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <input
                                type="range"
                                min={0.5}
                                max={3}
                                step={0.05}
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="w-24 h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <button
                                type="button"
                                onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                                title="Zoom In"
                                className="p-1 hover:bg-white rounded text-slate-700 transition"
                            >
                                <ZoomIn className="w-4 h-4" />
                            </button>
                            <span className="text-[11px] font-mono text-slate-600 px-1 font-semibold">
                                {zoom.toFixed(1)}x
                            </span>
                        </div>

                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200 ml-auto">
                            <button
                                type="button"
                                onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                                title="Rotate Left 90°"
                                className="p-1.5 hover:bg-white rounded text-slate-700 transition"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setRotation((r) => (r + 90) % 360)}
                                title="Rotate Right 90°"
                                className="p-1.5 hover:bg-white rounded text-slate-700 transition"
                            >
                                <RotateCw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="md:col-span-5 space-y-4">
                    {/* Aspect Ratio Correction */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                            Aspect Ratio Format
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setAspectRatio('1:1')}
                                className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-md border transition ${
                                    aspectRatio === '1:1'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                <Square className="w-3.5 h-3.5" />
                                1:1 Square (Avatar)
                            </button>
                            <button
                                type="button"
                                onClick={() => setAspectRatio('3:4')}
                                className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-md border transition ${
                                    aspectRatio === '3:4'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                <Crop className="w-3.5 h-3.5" />
                                3:4 (Passport)
                            </button>
                        </div>
                        {aspectRatio === '1:1' && (
                            <label className="flex items-center gap-2 mt-2.5 text-[11px] text-slate-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showCircleGuide}
                                    onChange={(e) => setShowCircleGuide(e.target.checked)}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                                />
                                Show circular avatar guideline
                            </label>
                        )}
                    </div>

                    {/* Background Color Customization */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                <Palette className="w-3.5 h-3.5 text-blue-600" />
                                Background Color
                            </Label>
                            {bgColor !== 'original' && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase">
                                    Active
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {PRESET_BG_COLORS.map((preset) => (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => setBgColor(preset.id)}
                                    className={`flex items-center gap-2 p-2 rounded-md border text-left transition ${
                                        bgColor === preset.id
                                            ? 'border-blue-600 ring-2 ring-blue-100 bg-white shadow-sm'
                                            : 'border-slate-200 bg-white hover:bg-slate-100'
                                    }`}
                                >
                                    <span
                                        className={`w-5 h-5 rounded-full border shadow-inner flex items-center justify-center shrink-0 ${preset.border}`}
                                        style={{ backgroundColor: preset.hex === 'transparent' ? '#cbd5e1' : preset.hex }}
                                    >
                                        {bgColor === preset.id && (
                                            <Check className={`w-3 h-3 ${preset.id === 'white' ? 'text-slate-900' : 'text-white'}`} />
                                        )}
                                    </span>
                                    <span className="text-xs font-medium text-slate-800 leading-tight">
                                        {preset.name}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {bgColor !== 'original' && (
                            <div className="mt-3 pt-3 border-t border-slate-200 space-y-2.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600 font-medium">Smart Backdrop Tolerance:</span>
                                    <span className="font-mono text-slate-800 font-bold">{tolerance}%</span>
                                </div>
                                <input
                                    type="range"
                                    min={10}
                                    max={65}
                                    step={1}
                                    value={tolerance}
                                    onChange={(e) => setTolerance(parseInt(e.target.value, 10))}
                                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <p className="text-[11px] text-slate-400 leading-tight">
                                    Increases or decreases edge detection sensitivity to replace uneven wall backdrops with clean {bgColor}.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
