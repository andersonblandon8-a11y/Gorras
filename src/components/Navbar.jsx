import React from 'react';
import { Crown, Search, MessageSquare, ShieldCheck, SlidersHorizontal } from 'lucide-react';

export const Navbar = ({ searchQuery, setSearchQuery, phone, onOpenAdmin, onToggleMobileFilter, totalGorras }) => {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-white/10 bg-[#08090c]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-black font-bold shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Crown className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-1.5 font-outfit">
              CROWN <span className="text-amber-400">&</span> CAP
            </span>
            <span className="text-xs text-slate-400 block tracking-wider uppercase font-medium -mt-1">
              Gorras Exclusivas • Colombia
            </span>
          </div>
        </div>

        {/* Buscador central */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por gorra, estilo o color..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-full py-2.5 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Acciones de Navegación */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Botón Filtros Móvil */}
          <button
            onClick={onToggleMobileFilter}
            className="md:hidden p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 relative"
            title="Filtros"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>

          {/* WhatsApp Direct Link */}
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent('¡Hola! Quisiera obtener información sobre su catálogo de gorras.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-xs font-semibold transition-all"
          >
            <MessageSquare className="w-4 h-4 fill-emerald-400/20" />
            <span>Contactar WhatsApp</span>
          </a>

          {/* Admin Panel Button */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-400/60 text-xs font-semibold transition-all"
            title="Panel de Administración"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Modo Admin</span>
          </button>
        </div>
      </div>

      {/* Buscador móvil */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar gorra, estilo o color..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>
    </header>
  );
};
