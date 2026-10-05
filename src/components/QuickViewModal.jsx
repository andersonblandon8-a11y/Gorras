import React, { useState } from 'react';
import { X, MessageSquare, Send, Tag, Palette, CheckCircle2, User, Phone, MapPin, Building, FileText, Info, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { formatCOP } from '../utils/currencyFormatter';
import { buildWhatsAppLink } from '../utils/whatsappHelper';

export const QuickViewModal = ({ cap, phone, onClose, onZoomImage }) => {
  const imagesList = Array.isArray(cap?.imagenes) && cap.imagenes.length > 0 
    ? cap.imagenes 
    : (cap?.imagen_url ? [cap.imagen_url] : []);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(cap?.activeImageIndex || 0);

  // Sincronizar índice si cambia la gorra seleccionada
  React.useEffect(() => {
    setSelectedPhotoIndex(cap?.activeImageIndex || 0);
  }, [cap]);

  // Soporte para gestos táctiles (Swipe en móvil)
  const touchStartX = React.useRef(0);
  const touchStartY = React.useRef(0);
  const touchMoved = React.useRef(false);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchMoved.current = false;
  };

  const handleTouchMove = (e) => {
    const diffX = Math.abs(e.touches[0].clientX - touchStartX.current);
    const diffY = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (diffX > 10 || diffY > 10) {
      touchMoved.current = true;
    }
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - touchStartX.current;
    const diffY = endY - touchStartY.current;

    // Detectar swipe horizontal claro (mínimo 35px y más horizontal que vertical)
    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        // Swipe izquierda -> siguiente imagen
        handleNextPhoto();
      } else {
        // Swipe derecha -> imagen anterior
        handlePrevPhoto();
      }
    }
  };

  const handlePrevPhoto = (e) => {
    e?.stopPropagation();
    if (imagesList.length <= 1) return;
    setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : imagesList.length - 1));
  };

  const handleNextPhoto = (e) => {
    e?.stopPropagation();
    if (imagesList.length <= 1) return;
    setSelectedPhotoIndex((prev) => (prev < imagesList.length - 1 ? prev + 1 : 0));
  };

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    ciudad: '',
    direccion: '',
    notas: ''
  });

  if (!cap) return null;

  const currentPhoto = imagesList[selectedPhotoIndex] || cap.imagen_url;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Enlace con datos del formulario
  const linkWithForm = buildWhatsAppLink(phone, cap, formData);

  // Enlace directo sin formulario
  const linkDirect = buildWhatsAppLink(phone, cap, null);

  const hasFilledData = formData.nombre.trim() !== '' || formData.telefono.trim() !== '' || formData.direccion.trim() !== '';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex justify-center items-start sm:items-center p-2 sm:p-4">
      <div className="relative w-full max-w-3xl bg-[#0e1017] border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-modal my-2 sm:my-8">
        
        {/* Botón cerrar siempre visible y accesible en móvil */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center transition-all shadow-lg active:scale-95"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Lado izquierdo: Foto limpia desplegada, galería y especificaciones */}
          <div className="relative bg-slate-950 p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
            <div>
              {/* Imagen Principal con soporte Touch Swipe */}
              <div 
                className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#0a0c12] mb-3 border border-slate-800 flex items-center justify-center cursor-pointer select-none group touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={() => {
                  if (!touchMoved.current && onZoomImage) {
                    onZoomImage({ ...cap, activeImageIndex: selectedPhotoIndex });
                  }
                }}
              >
                <img
                  src={currentPhoto}
                  alt={cap.nombre}
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80';
                  }}
                />

                {/* Badge indicador de foto activa en móvil */}
                {imagesList.length > 1 && (
                  <div className="absolute top-2 left-2 z-20 bg-slate-950/80 backdrop-blur-md text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10 pointer-events-none flex items-center gap-1">
                    <Images className="w-3 h-3" />
                    <span>{selectedPhotoIndex + 1} / {imagesList.length}</span>
                  </div>
                )}

                {/* Flechas anterior / siguiente visibles tanto en móvil como en escritorio */}
                {imagesList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevPhoto}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-950/85 hover:bg-amber-500 hover:text-black text-white flex items-center justify-center border border-slate-700 transition-all shadow-lg z-20 active:scale-95"
                      title="Foto anterior"
                      aria-label="Foto anterior"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextPhoto}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-950/85 hover:bg-amber-500 hover:text-black text-white flex items-center justify-center border border-slate-700 transition-all shadow-lg z-20 active:scale-95"
                      title="Foto siguiente"
                      aria-label="Foto siguiente"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center text-amber-400 font-bold text-xs gap-1.5 backdrop-blur-[1px]">
                  <span>🔍 Ampliar Imagen</span>
                </div>
              </div>

              {/* Tira de Miniaturas interactiva con scroll táctil suave */}
              {imagesList.length > 1 && (
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-thin scroll-smooth">
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 bg-slate-900 shrink-0 transition-all active:scale-95 ${
                        idx === selectedPhotoIndex
                          ? 'border-amber-400 shadow-md shadow-amber-500/30 scale-105 ring-1 ring-amber-400/50'
                          : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                      aria-label={`Ver foto ${idx + 1}`}
                    >
                      <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-contain p-1 pointer-events-none" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                  {cap.categoria}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
                  {cap.estilo}
                </span>
              </div>

              <h2 className="text-xl font-black text-white font-outfit leading-tight">
                {cap.nombre}
              </h2>

              <p className="text-xs text-slate-400 leading-relaxed">
                {cap.descripcion}
              </p>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Precio Final</span>
                  <span className="text-2xl font-black text-amber-400 font-mono">
                    {formatCOP(cap.precio)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Color</span>
                  <span className="text-xs font-semibold text-white">{cap.color}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lado derecho: Formulario de Pedido (OPCIONAL) */}
          <div className="p-4 sm:p-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white font-outfit">Datos para el Envíos</h3>
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Info className="w-3 h-3" /> Formulario Opcional
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Puedes llenar tus datos para adjuntarlos automáticamente en WhatsApp, o ir directamente sin llenar el formulario.
              </p>

              {/* Formulario */}
              <form onSubmit={(e) => e.preventDefault()} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Ej: Carlos Mendoza"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                      Teléfono / Celular
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="310 123 4567"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                      <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                      Ciudad / Municipio
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="ciudad"
                        value={formData.ciudad}
                        onChange={handleChange}
                        placeholder="Bogotá, Medellín..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                      <Building className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Dirección de Entrega
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      placeholder="Calle 100 # 15-20 Apto 302"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Notas o Preferencias (Opcional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="notas"
                      value={formData.notas}
                      onChange={handleChange}
                      placeholder="Ej: Dejar con portería, llamar antes..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <FileText className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </form>
            </div>

            {/* Opciones de Envío a WhatsApp */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              
              {/* Opción 1: Enviar formulario completo a WhatsApp */}
              <a
                href={linkWithForm}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg text-center ${
                  hasFilledData
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-emerald-500/20 hover:scale-[1.02]'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>
                  {hasFilledData ? 'Enviar Pedido con Datos a WhatsApp' : 'Enviar Pedido a WhatsApp'}
                </span>
              </a>

              {/* Opción 2: Enviar directo sin formulario */}
              <a
                href={linkDirect}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-800 transition-all text-center"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pedir directamente por WhatsApp (Sin Formulario)</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
