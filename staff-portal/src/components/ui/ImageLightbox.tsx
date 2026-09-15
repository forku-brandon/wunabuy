import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download, RefreshCcw } from 'lucide-react';

export interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUri: string;
  title?: string;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  onClose,
  imageUri,
  title,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Reset zoom & rotation when opening a new document
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
    }
  }, [isOpen, imageUri]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUri;
    a.download = (title || 'document').toLowerCase().replace(/\s+/g, '_') + '.webp';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/92 backdrop-blur-md flex flex-col animate-in fade-in duration-150">
      {/* Lightbox Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 text-white bg-slate-900/80">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-sm text-slate-100">{title || 'Document Inspection Lightbox'}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            {Math.round(zoom * 100)}% • {rotation}°
          </span>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.25, 3.5))}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleRotate}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Rotate 90° Clockwise"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Reset View"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors"
            title="Download Document"
          >
            <Download className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-slate-700 mx-1" />
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-red-600/90 hover:bg-red-600 text-white transition-colors"
            title="Close Lightbox (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Lightbox Canvas */}
      <div 
        className="flex-1 flex items-center justify-center p-8 overflow-auto cursor-grab active:cursor-grabbing"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <img
          src={imageUri}
          alt={title || 'Inspection document'}
          className="max-h-[82vh] max-w-[88vw] object-contain transition-transform duration-200 shadow-2xl rounded-lg select-none border border-slate-700/50 bg-slate-900"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
          }}
        />
      </div>
    </div>
  );
};
