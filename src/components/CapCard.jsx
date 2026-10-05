import React, { useState } from 'react';
import { MessageSquare, Eye, Sparkles, Tag, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { formatCOP } from '../utils/currencyFormatter';
import { buildWhatsAppLink } from '../utils/whatsappHelper';

export const CapCard = ({ cap, phone, onSelectCap, onZoomImage }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const directWaLink = buildWhatsAppLink(phone, cap);

  const imagesList = Array.isArray(cap.imagenes) && cap.imagenes.length > 0 
    ? cap.imagenes 
    : (cap.imagen_url ? [cap.imagen_url] : []);
  const currentImage = imagesList[currentImgIndex] || cap.imagen_url;

  const handlePrevImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev > 0 ? prev - 1 : imagesList.length - 1));
  };

  const handleNextImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev < imagesList.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="glass-card rounded-3xl overflow-hidden flex flex-col group relative">
      
      {/* Badge de Destacada / Edición Especial */}
      {cap.destacada === 1 && (
        <div className="absolute top-3 left-3 z-20 bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-lg flex items-center gap-1 pointer-events-none">
          <Sparkles className="w-3 h-3 fill-black" />
          <span>Destacada</span>
        </div>
      )}

      {/* Badges de Fotos y Color */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 pointer-events-none">
        {imagesList.length > 1 && (
          <span className="bg-amber-500/90 backdrop-blur-md text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
            <Images className="w-3 h-3 fill-black" />
            <span>{imagesList.length} fotos</span>
          </span>
        )}
        <span className="bg-slate-950/80 backdrop-blur-md text-slate-300 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/10">
          {cap.color}
        </span>
      </div>

      {/* Imagen Limpia de la Gorra */}
      <div 
        className="relative aspect-[4/3] w-full overflow-hidden bg-[#0a0c12] cursor-pointer flex items-center justify-center border-b border-slate-800/60" 
        onClick={() => onSelectCap({ ...cap, activeImageIndex: currentImgIndex })}
      >
        {/* Imagen principal NÍTIDA */}
        <img
          src={currentImage}
          alt={cap.nombre}
          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500 ease-out z-10"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Flechas de navegación rápida en tarjeta si tiene más de 1 imagen */}
        {imagesList.length > 1 && (
          <>
            <button
              onClick={handlePrevImg}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-slate-950/80 text-white hover:bg-amber-500 hover:text-black flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md border border-slate-700"
              title="Foto anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImg}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-slate-950/80 text-white hover:bg-amber-500 hover:text-black flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md border border-slate-700"
              title="Foto siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Indicador de puntitos de fotos */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1 pointer-events-none">
              {imagesList.map((_, dotIdx) => (
                <span
                  key={dotIdx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    dotIdx === currentImgIndex ? 'bg-amber-400 w-3.5' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Hover overlay con botones: Ampliar Foto y Hacer Pedido */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col sm:flex-row items-center justify-center gap-2.5 z-10 p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onZoomImage({ ...cap, activeImageIndex: currentImgIndex });
            }}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-500/40 shadow-xl transition-transform hover:scale-105"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>🔍 Ampliar Detalle</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectCap({ ...cap, activeImageIndex: currentImgIndex });
            }}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xl transition-transform hover:scale-105"
          >
            <span>Ver Formulario</span>
          </button>
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Categoría & Estilo */}
          <div className="flex items-center gap-2 text-[11px] text-amber-400 font-medium mb-1.5">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {cap.categoria}
            </span>
            <span>•</span>
            <span className="text-slate-400">{cap.estilo}</span>
          </div>

          {/* Nombre de la gorra */}
          <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1 font-outfit">
            {cap.nombre}
          </h3>

          {/* Descripción corta */}
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {cap.descripcion}
          </p>
        </div>

        {/* Precio en COP & Acciones */}
        <div className="pt-3 border-t border-slate-800/80 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Precio COP:</span>
            <span className="text-lg font-black text-amber-400 font-mono tracking-tight">
              {formatCOP(cap.precio)}
            </span>
          </div>

          {/* Botones de Acción */}
          <div className="grid grid-cols-2 gap-2">
            {/* 1. Pedido rápido WhatsApp sin formulario */}
            <a
              href={directWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-center"
              title="Pedir directamente a WhatsApp sin llenar formulario"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-emerald-400/20" />
              <span>WhatsApp</span>
            </a>

            {/* 2. Formulario opcional / Ver detalle */}
            <button
              onClick={() => onSelectCap(cap)}
              className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-amber-500/10 transition-all text-center"
            >
              <span>Hacer Pedido</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
