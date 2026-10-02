import React from 'react';
import { Crown, MessageSquare, ShieldCheck, Heart } from 'lucide-react';

export const Footer = ({ phone, onOpenAdmin }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-12 pb-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Columna 1: Marca */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                <Crown className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight font-outfit">
                CROWN <span className="text-amber-400">&</span> CAP
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
              Tienda colombiana especializada en gorras exclusivas Snapback, Trucker, Dad Hat y Edición de Lujo. 
              Precios transparentes en Pesos Colombianos ($ COP) y atención directa a WhatsApp.
            </p>
          </div>

          {/* Columna 2: Garantía y Envíos */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white font-outfit uppercase tracking-wider">Atención y Envíos</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>🚚 Envíos a todo el territorio Colombiano</li>
              <li>💬 Pedidos directos vía WhatsApp</li>
              <li>⭐ Calidad bordada garantizada</li>
              <li>🔒 Compra 100% confiable sin intermediarios</li>
            </ul>
          </div>

          {/* Columna 3: Admin & Contacto */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white font-outfit uppercase tracking-wider">Acceso Directo</h4>
            <a
              href={`https://wa.me/${phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold hover:bg-emerald-500/20 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp: +{phone}</span>
            </a>
            <div>
              <button
                onClick={onOpenAdmin}
                className="text-xs text-slate-500 hover:text-amber-400 underline flex items-center gap-1 mt-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Panel de Administración</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer bottom bar */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>© 2026 CROWN & CAP Store. Todos los derechos reservados.</p>
          <div className="flex items-center gap-1">
            <span>Hecho con</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>en Colombia • Moneda: COP ($)</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
