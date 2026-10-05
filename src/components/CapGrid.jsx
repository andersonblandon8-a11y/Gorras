import React from 'react';
import { CapCard } from './CapCard';
import { Sparkles, PackageX, RotateCcw } from 'lucide-react';

export const CapGrid = ({ gorras, phone, onSelectCap, onZoomImage, onResetFilters, loading }) => {
  if (loading) {
    return (
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="glass-card rounded-3xl p-4 animate-pulse space-y-4">
            <div className="aspect-square bg-slate-800/60 rounded-2xl" />
            <div className="h-4 bg-slate-800/80 rounded w-3/4" />
            <div className="h-3 bg-slate-800/60 rounded w-1/2" />
            <div className="h-8 bg-slate-800/90 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (gorras.length === 0) {
    return (
      <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
          <PackageX className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white font-outfit">No se encontraron gorras</h3>
        <p className="text-sm text-slate-400 max-w-md">
          No hay gorras disponibles que coincidan con los filtros seleccionados. Intenta cambiar el precio, color o categoría.
        </p>
        <button
          onClick={onResetFilters}
          className="mt-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restablecer Filtros</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      {/* Encabezado contador de resultados */}
      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/60 pb-3">
        <span className="flex items-center gap-1.5 font-medium">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Mostrando <strong className="text-white">{gorras.length}</strong> gorras exclusivas
        </span>
        <span>Pesos Colombianos ($ COP)</span>
      </div>

      {/* Grid de gorras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {gorras.map((cap) => (
          <CapCard
            key={cap.id}
            cap={cap}
            phone={phone}
            onSelectCap={onSelectCap}
            onZoomImage={onZoomImage}
          />
        ))}
      </div>
    </div>
  );
};
