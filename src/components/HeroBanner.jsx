import React from 'react';
import { Sparkles, Truck, ShieldCheck, Zap, ArrowDown } from 'lucide-react';

export const HeroBanner = ({ onScrollToCatalog }) => {
  return (
    <section className="relative overflow-hidden py-12 md:py-20 border-b border-white/5 bg-gradient-to-b from-slate-950 via-[#0a0c12] to-[#08090c]">
      {/* Elementos decorativos de fondo glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Badge superior */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-6 shadow-md backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Nueva Colección 2026 • Precios en COP ($)</span>
        </div>

        {/* Título Principal */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight font-outfit max-w-4xl mx-auto leading-[1.1]">
          GORRAS DE LUJO <br />
          <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
            URBANAS & EXCLUSIVAS
          </span>
        </h1>

        {/* Subtítulo */}
        <p className="mt-5 text-base sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Explora nuestro catálogo premium, filtra por color, categoría y estilo. 
          Haz tu pedido de forma fácil y rápida redirigiendo a nuestro WhatsApp oficial.
        </p>

        {/* Badges de características */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-300">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/70 border border-slate-800">
            <Truck className="w-4 h-4 text-amber-400" />
            <span>Envíos Rápidos a toda Colombia</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/70 border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Calidad Bordada Premium</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/70 border border-slate-800">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Sin Registro Obligatorio</span>
          </div>
        </div>

        {/* Botón CTA */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={onScrollToCatalog}
            className="group relative px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-sm tracking-wide flex items-center gap-2.5 shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span>Ver Catálogo Completo</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
};
