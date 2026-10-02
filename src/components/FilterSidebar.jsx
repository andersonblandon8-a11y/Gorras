import React from 'react';
import { Filter, RotateCcw, DollarSign, Palette, Tag, Sparkles } from 'lucide-react';
import { formatCOP } from '../utils/currencyFormatter';

const CATEGORIAS = ['Todas', 'Snapback', 'Trucker', 'Dad Hat', 'Luxury', 'Deportiva'];
const COLORES = ['Todos', 'Negro', 'Blanco', 'Rojo', 'Azul', 'Verde', 'Beige', 'Gris', 'Oro'];
const ESTILOS = ['Todos', 'Urbano', 'Vintage', 'Minimalista', 'Streetwear', 'Deportivo'];

export const FilterSidebar = ({
  selectedCategoria,
  setSelectedCategoria,
  selectedColor,
  setSelectedColor,
  selectedEstilo,
  setSelectedEstilo,
  precioMax,
  setPrecioMax,
  onResetFilters
}) => {
  return (
    <aside className="w-full lg:w-72 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md h-fit space-y-7">
      
      {/* Encabezado Filtros */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-white font-bold font-outfit text-lg">
          <Filter className="w-5 h-5 text-amber-400" />
          <span>Filtros</span>
        </div>
        <button
          onClick={onResetFilters}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 transition-colors"
          title="Restablecer Filtros"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Limpiar</span>
        </button>
      </div>

      {/* 1. Filtro por Precio ($ COP) */}
      <div className="space-y-3">
        <label className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-300">
          <span className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-amber-400" />
            Precio Máximo
          </span>
          <span className="text-amber-400 font-mono font-bold text-sm">
            {formatCOP(precioMax)}
          </span>
        </label>
        <input
          type="range"
          min="40000"
          max="200000"
          step="5000"
          value={precioMax}
          onChange={(e) => setPrecioMax(Number(e.target.value))}
          className="w-full accent-amber-400 cursor-pointer bg-slate-800 rounded-lg h-2"
        />
        <div className="flex justify-between text-[11px] text-slate-500 font-mono">
          <span>$ 40.000 COP</span>
          <span>$ 200.000 COP</span>
        </div>
      </div>

      {/* 2. Filtro por Categorías */}
      <div className="space-y-3 border-t border-slate-800/80 pt-5">
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <Tag className="w-4 h-4 text-amber-400" />
          Categoría
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS.map((cat) => {
            const isSelected = selectedCategoria === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategoria(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Filtro por Colores */}
      <div className="space-y-3 border-t border-slate-800/80 pt-5">
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <Palette className="w-4 h-4 text-amber-400" />
          Color
        </label>
        <div className="grid grid-cols-3 gap-2">
          {COLORES.map((col) => {
            const isSelected = selectedColor === col;
            return (
              <button
                key={col}
                onClick={() => setSelectedColor(col)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium text-center truncate transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/50'
                }`}
              >
                {col}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Filtro por Estilos */}
      <div className="space-y-3 border-t border-slate-800/80 pt-5">
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Estilo
        </label>
        <div className="flex flex-wrap gap-2">
          {ESTILOS.map((est) => {
            const isSelected = selectedEstilo === est;
            return (
              <button
                key={est}
                onClick={() => setSelectedEstilo(est)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/50'
                }`}
              >
                {est}
              </button>
            );
          })}
        </div>
      </div>

    </aside>
  );
};
