import React, { useState } from 'react';
import { Eye, Download, AlertCircle, CheckCircle2, FileText, ExternalLink } from 'lucide-react';

export interface DocumentInspectionCardProps {
  title: string;
  subtitle?: string;
  documentUrl?: string | null;
  required?: boolean;
  onOpenLightbox: (url: string, title: string) => void;
}

export const DocumentInspectionCard: React.FC<DocumentInspectionCardProps> = ({
  title,
  subtitle,
  documentUrl,
  required = true,
  onOpenLightbox,
}) => {
  const [imgError, setImgError] = useState(false);
  const hasValidUrl = Boolean(documentUrl && documentUrl.trim().length > 0 && !imgError);

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-all">
      {/* Card Header with Title & Verification Pill */}
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            {title}
            {required && <span className="text-rose-500 font-bold">*</span>}
          </h5>
          {subtitle && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        {hasValidUrl ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Uploaded
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Missing
          </span>
        )}
      </div>

      {/* Visual Preview Stage */}
      <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center group">
        {hasValidUrl ? (
          <>
            <img
              src={documentUrl!}
              alt={title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={() => onOpenLightbox(documentUrl!, title)}
            />

            {/* Hover Action Overlay */}
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => onOpenLightbox(documentUrl!, title)}
                className="px-2.5 py-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 text-[11px] font-bold shadow-md hover:bg-white flex items-center gap-1 backdrop-blur-sm"
              >
                <Eye className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                Inspect
              </button>
              <a
                href={documentUrl!}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 text-[11px] font-bold shadow-md hover:bg-white flex items-center justify-center backdrop-blur-sm"
                title="Open in New Tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-3 text-slate-400 dark:text-slate-500">
            <FileText className="w-8 h-8 mb-1.5 opacity-40 text-slate-400" />
            <span className="text-[11px] font-medium">No document file submitted</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      {hasValidUrl && (
        <div className="mt-2.5 flex items-center justify-between text-[11px]">
          <button
            type="button"
            onClick={() => onOpenLightbox(documentUrl!, title)}
            className="text-teal-600 dark:text-teal-400 font-bold hover:underline inline-flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            Full Resolution Zoom
          </button>
          <a
            href={documentUrl!}
            download={`${title.toLowerCase().replace(/\s+/g, '_')}.webp`}
            target="_blank"
            rel="noreferrer"
            className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 font-medium inline-flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            Save File
          </a>
        </div>
      )}
    </div>
  );
};
