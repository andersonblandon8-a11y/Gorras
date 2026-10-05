import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, MessageSquare, Tag } from 'lucide-react';
import { formatCOP } from '../utils/currencyFormatter';
import { buildWhatsAppLink } from '../utils/whatsappHelper';

export const ImageLightbox = ({ cap, phone, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (!cap) return null;

  const directWaLink = buildWhatsAppLink(phone, cap);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3.5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between select-none animate-modal"
      onMouseUp={handleMouseUp}
    >
      {/* Header con Controles de Zoom y Botón Cerrar */}
      <div className="p-4 sm:p-6 flex items-center justify-between z-20 border-b border-white/10 bg-slate-950/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm sm:text-base font-outfit line-clamp-1">{cap.nombre}</h3>
            <span className="text-xs text-amber-400 font-mono font-bold">{formatCOP(cap.precio)}</span>
          </div>
        </div>

        {/* Barra de Herramientas Zoom */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center gap-1">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30 transition-all"
              title="Alejar (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-amber-400 px-2 font-bold min-w-[45px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3.5}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30 transition-all"
              title="Acercar (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {zoomLevel > 1 && (
              <button
                onClick={handleReset}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all border-l border-slate-800"
                title="Restablecer tamaño"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition-all ml-2"
            title="Cerrar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ÁREA PRINCIPAL VISOR DE IMAGEN (ZOOM + PAN) */}
      <div 
        className={`flex-1 relative overflow-hidden flex items-center justify-center p-4 ${
          zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onClick={() => {
          if (zoomLevel === 1) handleZoomIn();
        }}
      >
        <div 
          className="transition-transform duration-200 ease-out max-w-full max-h-full flex items-center justify-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center'
          }}
        >
          <img
            src={cap.imagen_url}
            alt={cap.nombre}
            className="max-h-[80vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl pointer-events-none"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80';
            }}
          />
        </div>

        {/* Instrucción flotante */}
        {zoomLevel === 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-slate-900/90 text-slate-300 text-xs font-semibold px-4 py-2 rounded-full border border-slate-800 backdrop-blur-md shadow-xl pointer-events-none animate-bounce">
            🔍 Haz clic o usa los botones + / - para ampliar la imagen y ver los detalles
          </div>
        )}
      </div>

      {/* Footer con Botón Pedir por WhatsApp */}
      <div className="p-4 sm:p-5 border-t border-white/10 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
        <div className="text-xs text-slate-400 text-center sm:text-left">
          <span className="text-white font-semibold">{cap.nombre}</span> — {cap.color} • {cap.categoria}
        </div>
        
        <a
          href={directWaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
        >
          <MessageSquare className="w-4 h-4 fill-slate-950" />
          <span>Pedir este Modelo por WhatsApp ({formatCOP(cap.precio)})</span>
        </a>
      </div>
    </div>
  );
};
