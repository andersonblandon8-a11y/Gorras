import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, MessageSquare, Tag, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { formatCOP } from '../utils/currencyFormatter';
import { buildWhatsAppLink } from '../utils/whatsappHelper';

export const ImageLightbox = ({ cap, phone, onClose }) => {
  const imagesList = Array.isArray(cap?.imagenes) && cap.imagenes.length > 0 
    ? cap.imagenes 
    : (cap?.imagen_url ? [cap.imagen_url] : []);
  const [currentIndex, setCurrentIndex] = useState(cap?.activeImageIndex || 0);

  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Soporte para gestos táctiles y swipe en móvil
  const touchStartX = React.useRef(0);
  const touchStartY = React.useRef(0);
  const touchMoved = React.useRef(false);

  const handleTouchStart = (e) => {
    if (zoomLevel > 1) {
      if (e.touches.length === 1) {
        setIsDragging(true);
        setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
      }
      return;
    }
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchMoved.current = false;
  };

  const handleTouchMove = (e) => {
    if (zoomLevel > 1 && isDragging) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
      return;
    }
    const diffX = Math.abs(e.touches[0].clientX - touchStartX.current);
    const diffY = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (diffX > 10 || diffY > 10) {
      touchMoved.current = true;
    }
  };

  const handleTouchEnd = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(false);
      return;
    }
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - touchStartX.current;
    const diffY = endY - touchStartY.current;

    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        handleNextPhoto();
      } else {
        handlePrevPhoto();
      }
    }
  };

  const handleSwitchPhoto = (newIdx) => {
    setCurrentIndex(newIdx);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handlePrevPhoto = (e) => {
    e?.stopPropagation();
    if (imagesList.length <= 1) return;
    handleSwitchPhoto(currentIndex > 0 ? currentIndex - 1 : imagesList.length - 1);
  };

  const handleNextPhoto = (e) => {
    e?.stopPropagation();
    if (imagesList.length <= 1) return;
    handleSwitchPhoto(currentIndex < imagesList.length - 1 ? currentIndex + 1 : 0);
  };

  // Atajos de teclado: Flechas para navegar fotos, Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (imagesList.length > 1) {
        if (e.key === 'ArrowLeft') handlePrevPhoto();
        if (e.key === 'ArrowRight') handleNextPhoto();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, imagesList.length]);

  if (!cap) return null;

  const currentPhoto = imagesList[currentIndex] || cap.imagen_url;

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
      <div className="p-3 sm:p-5 flex items-center justify-between z-20 border-b border-white/10 bg-slate-950/90 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Tag className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-bold text-xs sm:text-base font-outfit truncate">{cap.nombre}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-400 font-mono font-bold">{formatCOP(cap.precio)}</span>
              {imagesList.length > 1 && (
                <span className="text-[11px] text-slate-400">
                  • Foto {currentIndex + 1} de {imagesList.length}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Barra de Herramientas Zoom */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-0.5 sm:p-1 flex items-center gap-0.5 sm:gap-1">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30 transition-all active:scale-95"
              title="Alejar (-)"
              aria-label="Alejar"
            >
              <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <span className="text-[11px] sm:text-xs font-mono text-amber-400 px-1 sm:px-2 font-bold min-w-[36px] sm:min-w-[45px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3.5}
              className="p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30 transition-all active:scale-95"
              title="Acercar (+)"
              aria-label="Acercar"
            >
              <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            {zoomLevel > 1 && (
              <button
                onClick={handleReset}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all border-l border-slate-800 active:scale-95"
                title="Restablecer tamaño"
                aria-label="Restablecer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition-all ml-1 sm:ml-2 active:scale-95"
            title="Cerrar (Esc)"
            aria-label="Cerrar visor"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* ÁREA PRINCIPAL VISOR DE IMAGEN (ZOOM + PAN + NAVEGACIÓN + TOUCH SWIPE) */}
      <div 
        className={`flex-1 relative overflow-hidden flex items-center justify-center p-2 sm:p-4 touch-none ${
          zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (!touchMoved.current && zoomLevel === 1) {
            handleZoomIn();
          }
        }}
      >
        {/* Flechas flotantes si hay múltiples fotos */}
        {imagesList.length > 1 && zoomLevel === 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevPhoto}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/85 hover:bg-amber-500 hover:text-black text-white flex items-center justify-center border border-slate-700 backdrop-blur-md shadow-2xl transition-all active:scale-95"
              title="Foto anterior (←)"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              type="button"
              onClick={handleNextPhoto}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/85 hover:bg-amber-500 hover:text-black text-white flex items-center justify-center border border-slate-700 backdrop-blur-md shadow-2xl transition-all active:scale-95"
              title="Foto siguiente (→)"
              aria-label="Foto siguiente"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        <div 
          className="transition-transform duration-200 ease-out max-w-full max-h-full flex items-center justify-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center'
          }}
        >
          <img
            src={currentPhoto}
            alt={cap.nombre}
            className="max-h-[70vh] sm:max-h-[75vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl pointer-events-none"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80';
            }}
          />
        </div>

        {/* Instrucción flotante adaptada para móvil y pc */}
        {zoomLevel === 1 && (
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 bg-slate-900/90 text-slate-300 text-[11px] sm:text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-slate-800 backdrop-blur-md shadow-xl pointer-events-none text-center max-w-[90%] truncate">
            {imagesList.length > 1
              ? '👆 Desliza ← → o pulsa las flechas para ver fotos'
              : '🔍 Pulsa para ampliar la foto'}
          </div>
        )}
      </div>

      {/* Footer con Miniaturas y Botón Pedir por WhatsApp */}
      <div className="p-3 sm:p-4 border-t border-white/10 bg-slate-950/95 flex flex-col sm:flex-row items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1 scroll-smooth">
          {imagesList.length > 1 && imagesList.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSwitchPhoto(idx)}
              className={`w-11 h-11 rounded-lg overflow-hidden border-2 bg-slate-900 shrink-0 transition-all active:scale-95 ${
                idx === currentIndex ? 'border-amber-400 scale-105 shadow-md shadow-amber-500/20' : 'border-slate-800 opacity-60 hover:opacity-100'
              }`}
              aria-label={`Foto ${idx + 1}`}
            >
              <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-contain p-0.5 pointer-events-none" />
            </button>
          ))}
          {imagesList.length <= 1 && (
            <div className="text-xs text-slate-400 truncate max-w-full">
              <span className="text-white font-semibold">{cap.nombre}</span> — {cap.color} • {cap.categoria}
            </div>
          )}
        </div>
        
        <a
          href={directWaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all shrink-0 active:scale-95"
        >
          <MessageSquare className="w-4 h-4 fill-slate-950" />
          <span>Pedir este Modelo por WhatsApp ({formatCOP(cap.precio)})</span>
        </a>
      </div>
    </div>
  );
};
