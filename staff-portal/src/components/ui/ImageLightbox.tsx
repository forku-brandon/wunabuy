import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/90 backdrop-blur-md flex flex-col">
      {/* Lightbox Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 text-white">
        <span className="font-semibold text-sm">{title || 'Document Image Lightbox'}</span>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.5, 3))}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.5, 1))}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
            title="Close Lightbox"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Lightbox Image View */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <img
          src={imageUri}
          alt={title || 'Inspection document'}
          className="max-h-[85vh] max-w-[90vw] object-contain transition-transform duration-200 shadow-2xl rounded-lg"
          style={{ transform: `scale(${zoom})` }}
        />
      </div>
    </div>
  );
};

