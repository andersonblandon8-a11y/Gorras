import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Save, Phone, DollarSign, Image, Package, Check, RefreshCw, Lock, Sparkles } from 'lucide-react';
import { formatCOP } from '../utils/currencyFormatter';
import { createGorraAPI, updateGorraAPI, deleteGorraAPI, updateSettingsAPI } from '../services/api';

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1521369984125-a4ec647d7c67?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80'
];

export const AdminPanel = ({ gorras, phone, onClose, onRefreshData }) => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'add' | 'settings'
  const [editingId, setEditingId] = useState(null);
  
  // Estado para la gorra en edición
  const [editForm, setEditForm] = useState({});

  // Estado para nueva gorra
  const [newCap, setNewCap] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    color: 'Negro',
    categoria: 'Snapback',
    estilo: 'Urbano',
    imagen_url: PRESET_IMAGES[0],
    destacada: false,
    stock: 10
  });

  // Estado para teléfono de WhatsApp
  const [waPhone, setWaPhone] = useState(phone || '573502522375');
  const [savingSettings, setSavingSettings] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Manejo de Crear Gorra
  const handleCreateCap = async (e) => {
    e.preventDefault();
    if (!newCap.nombre || !newCap.precio) {
      alert('Por favor ingresa el nombre y precio de la gorra.');
      return;
    }

    try {
      await createGorraAPI(newCap);
      setSuccessMsg('¡Gorra agregada con éxito a la base de datos!');
      setNewCap({
        nombre: '',
        descripcion: '',
        precio: '',
        color: 'Negro',
        categoria: 'Snapback',
        estilo: 'Urbano',
        imagen_url: PRESET_IMAGES[0],
        destacada: false,
        stock: 10
      });
      onRefreshData();
      setTimeout(() => {
        setSuccessMsg('');
        setActiveTab('list');
      }, 1500);
    } catch (err) {
      alert('Error al crear la gorra: ' + err.message);
    }
  };

  // 2. Iniciar edición
  const handleStartEdit = (cap) => {
    setEditingId(cap.id);
    setEditForm({ ...cap });
  };

  // Guardar edición
  const handleSaveEdit = async (id) => {
    try {
      await updateGorraAPI(id, editForm);
      setEditingId(null);
      setSuccessMsg('Gorra actualizada en la base de datos.');
      onRefreshData();
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err) {
      alert('Error al actualizar gorra: ' + err.message);
    }
  };

  // Eliminar gorra
  const handleDeleteCap = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar la gorra "${nombre}"?`)) {
      try {
        await deleteGorraAPI(id);
        setSuccessMsg('Gorra eliminada.');
        onRefreshData();
        setTimeout(() => setSuccessMsg(''), 2000);
      } catch (err) {
        alert('Error al eliminar gorra: ' + err.message);
      }
    }
  };

  // Guardar configuración WhatsApp
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateSettingsAPI({ whatsapp_phone: waPhone });
      setSuccessMsg('Número de WhatsApp actualizado.');
      onRefreshData();
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err) {
      alert('Error al actualizar número de WhatsApp: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0d0e14] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-modal my-6">
        
        {/* Header Admin */}
        <div className="p-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-outfit">Panel de Administración</h2>
              <p className="text-xs text-slate-400">Gestiona catálogo, precios, inventario y WhatsApp</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensaje de éxito temporal */}
        {successMsg && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-400 text-xs px-6 py-2.5 font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tabs de Navegación Admin */}
        <div className="px-6 pt-4 border-b border-slate-800/60 flex gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'list'
                ? 'bg-[#0d0e14] text-amber-400 border-t border-x border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Ver / Editar Gorras ({gorras.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'add'
                ? 'bg-[#0d0e14] text-amber-400 border-t border-x border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Montar Nueva Gorra</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'settings'
                ? 'bg-[#0d0e14] text-amber-400 border-t border-x border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Ajustes WhatsApp</span>
          </button>
        </div>

        {/* TAB 1: LISTADO Y EDICIÓN DE GORRAS */}
        {activeTab === 'list' && (
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
            {gorras.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No hay gorras registradas en la base de datos.</p>
            ) : (
              <div className="space-y-3">
                {gorras.map((cap) => {
                  const isEditing = editingId === cap.id;

                  return (
                    <div
                      key={cap.id}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      {isEditing ? (
                        /* Modo Edición Edición Inline */
                        <div className="w-full space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[10px] text-slate-400 uppercase">Nombre</label>
                              <input
                                type="text"
                                value={editForm.nombre}
                                onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 uppercase">Precio COP ($)</label>
                              <input
                                type="number"
                                value={editForm.precio}
                                onChange={(e) => setEditForm({ ...editForm, precio: parseFloat(e.target.value) })}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-amber-400 font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 uppercase">Color</label>
                              <input
                                type="text"
                                value={editForm.color}
                                onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] text-slate-400 uppercase">Categoría</label>
                              <input
                                type="text"
                                value={editForm.categoria}
                                onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 uppercase">Estilo</label>
                              <input
                                type="text"
                                value={editForm.estilo}
                                onChange={(e) => setEditForm({ ...editForm, estilo: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleSaveEdit(cap.id)}
                              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>Guardar Cambios</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Vista Normal en Lista */
                        <>
                          <div className="flex items-center gap-3">
                            <img
                              src={cap.imagen_url}
                              alt={cap.nombre}
                              className="w-12 h-12 rounded-xl object-cover bg-slate-950"
                            />
                            <div>
                              <h4 className="text-sm font-bold text-white">{cap.nombre}</h4>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span>{cap.categoria}</span>
                                <span>•</span>
                                <span>{cap.color}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                            <span className="text-base font-bold text-amber-400 font-mono">
                              {formatCOP(cap.precio)}
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleStartEdit(cap)}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCap(cap.id, cap.nombre)}
                                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MONTAR NUEVA GORRA */}
        {activeTab === 'add' && (
          <form onSubmit={handleCreateCap} className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nombre de la Gorra *</label>
                <input
                  type="text"
                  required
                  value={newCap.nombre}
                  onChange={(e) => setNewCap({ ...newCap, nombre: e.target.value })}
                  placeholder="Ej: Gorra Snapback Dark Crown Black"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Precio en COP ($) *</label>
                <input
                  type="number"
                  required
                  step="1000"
                  value={newCap.precio}
                  onChange={(e) => setNewCap({ ...newCap, precio: e.target.value })}
                  placeholder="Ej: 85000"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Color *</label>
                <select
                  value={newCap.color}
                  onChange={(e) => setNewCap({ ...newCap, color: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Negro">Negro</option>
                  <option value="Blanco">Blanco</option>
                  <option value="Rojo">Rojo</option>
                  <option value="Azul">Azul</option>
                  <option value="Verde">Verde</option>
                  <option value="Beige">Beige</option>
                  <option value="Gris">Gris</option>
                  <option value="Oro">Oro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Categoría *</label>
                <select
                  value={newCap.categoria}
                  onChange={(e) => setNewCap({ ...newCap, categoria: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Snapback">Snapback</option>
                  <option value="Trucker">Trucker</option>
                  <option value="Dad Hat">Dad Hat</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Deportiva">Deportiva</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Estilo *</label>
                <select
                  value={newCap.estilo}
                  onChange={(e) => setNewCap({ ...newCap, estilo: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Urbano">Urbano</option>
                  <option value="Streetwear">Streetwear</option>
                  <option value="Vintage">Vintage</option>
                  <option value="Minimalista">Minimalista</option>
                  <option value="Deportivo">Deportivo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Descripción</label>
              <textarea
                rows="2"
                value={newCap.descripcion}
                onChange={(e) => setNewCap({ ...newCap, descripcion: e.target.value })}
                placeholder="Detalles de diseño, visera, broche o bordado..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">URL de la Imagen de la Gorra</label>
              <input
                type="url"
                value={newCap.imagen_url}
                onChange={(e) => setNewCap({ ...newCap, imagen_url: e.target.value })}
                placeholder="https://..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              {/* Presets rápidas */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] text-slate-400">Presets de imágenes:</span>
                <div className="flex gap-1.5">
                  {PRESET_IMAGES.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewCap({ ...newCap, imagen_url: imgUrl })}
                      className="w-6 h-6 rounded-md overflow-hidden border border-slate-700 hover:border-amber-400"
                    >
                      <img src={imgUrl} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Guardar y Publicar Gorra</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: CONFIGURACIÓN WHATSAPP */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Número de WhatsApp para Pedidos (Colombia +57)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={waPhone}
                  onChange={(e) => setWaPhone(e.target.value)}
                  placeholder="573502522375"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-amber-400 font-mono focus:outline-none focus:border-amber-500"
                />
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                A este número llegarán todos los mensajes formateados de las gorras elegidas y los datos de envío del usuario.
              </p>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Save className="w-4 h-4" />
                <span>{savingSettings ? 'Guardando...' : 'Actualizar Número de WhatsApp'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
