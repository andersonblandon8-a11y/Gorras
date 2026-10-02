import React, { useState } from 'react';
import { X, MessageSquare, Send, Tag, Palette, CheckCircle2, User, Phone, MapPin, Building, FileText, Info } from 'lucide-react';
import { formatCOP } from '../utils/currencyFormatter';
import { buildWhatsAppLink } from '../utils/whatsappHelper';

export const QuickViewModal = ({ cap, phone, onClose }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    ciudad: '',
    direccion: '',
    notas: ''
  });

  if (!cap) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Enlace con datos del formulario
  const linkWithForm = buildWhatsAppLink(phone, cap, formData);

  // Enlace directo sin formulario
  const linkDirect = buildWhatsAppLink(phone, cap, null);

  const hasFilledData = formData.nombre.trim() !== '' || formData.telefono.trim() !== '' || formData.direccion.trim() !== '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0e1017] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-modal my-8">
        
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 flex items-center justify-center transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Lado izquierdo: Foto y especificaciones */}
          <div className="relative bg-slate-950 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-900 mb-4 border border-slate-800">
              <img
                src={cap.imagen_url}
                alt={cap.nombre}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80';
                }}
              />
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
          <div className="p-6 flex flex-col justify-between space-y-6">
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
