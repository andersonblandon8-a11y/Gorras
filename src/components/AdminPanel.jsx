import React, { useState, useRef } from 'react';
import { X, Plus, Edit2, Trash2, Save, Phone, Image, Package, Check, Lock, UploadCloud, AlertCircle, Star, Images } from 'lucide-react';
import { formatCOP } from '../utils/currencyFormatter';
import { createGorraAPI, updateGorraAPI, deleteGorraAPI, updateSettingsAPI, uploadImagenesAPI } from '../services/api';

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
    imagen_url: '',
    imagenes: [],
    destacada: false,
    stock: 10
  });

  // Estado para subida de imagen
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [useUrlInput, setUseUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  // Estado para teléfono de WhatsApp
  const [waPhone, setWaPhone] = useState(phone || '573502522375');
  const [savingSettings, setSavingSettings] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Subir múltiples imágenes para nueva gorra
  const handleUploadFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setUploadError('');
    setUploadingImage(true);
    try {
      const result = await uploadImagenesAPI(fileList);
      setNewCap(prev => {
        const updated = [...(prev.imagenes || []), ...result.urls];
        return {
          ...prev,
          imagenes: updated,
          imagen_url: updated[0] || ''
        };
      });
    } catch (err) {
      setUploadError('Error al subir imágenes: ' + err.message);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Quitar una foto de la nueva gorra
  const handleRemoveNewCapImage = (indexToRemove) => {
    setNewCap(prev => {
      const updated = prev.imagenes.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        imagenes: updated,
        imagen_url: updated[0] || ''
      };
    });
  };

  // Fijar una foto como portada (principal)
  const handleSetPrimaryNewCapImage = (indexToPrimary) => {
    setNewCap(prev => {
      const selected = prev.imagenes[indexToPrimary];
      const rest = prev.imagenes.filter((_, idx) => idx !== indexToPrimary);
      const reordered = [selected, ...rest];
      return {
        ...prev,
        imagenes: reordered,
        imagen_url: selected
      };
    });
  };

  // Agregar URL manual a la lista de fotos
  const handleAddCustomUrl = (urlToAdd) => {
    if (!urlToAdd || !urlToAdd.trim()) return;
    setNewCap(prev => {
      const updated = [...(prev.imagenes || []), urlToAdd.trim()];
      return {
        ...prev,
        imagenes: updated,
        imagen_url: updated[0] || ''
      };
    });
    setCustomUrl('');
  };

  // Subir imágenes para gorra en modo edición
  const handleEditUploadFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setUploadingEditImage(true);
    try {
      const result = await uploadImagenesAPI(fileList);
      setEditForm(prev => {
        const currentImgs = Array.isArray(prev.imagenes) ? prev.imagenes : (prev.imagen_url ? [prev.imagen_url] : []);
        const updated = [...currentImgs, ...result.urls];
        return {
          ...prev,
          imagenes: updated,
          imagen_url: updated[0] || ''
        };
      });
    } catch (err) {
      alert('Error al subir imágenes: ' + err.message);
    } finally {
      setUploadingEditImage(false);
      if (editFileInputRef.current) editFileInputRef.current.value = '';
    }
  };

  // Quitar foto en modo edición
  const handleRemoveEditImage = (indexToRemove) => {
    setEditForm(prev => {
      const currentImgs = Array.isArray(prev.imagenes) ? prev.imagenes : (prev.imagen_url ? [prev.imagen_url] : []);
      const updated = currentImgs.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        imagenes: updated,
        imagen_url: updated[0] || ''
      };
    });
  };

  // Fijar foto portada en modo edición
  const handleSetPrimaryEditImage = (indexToPrimary) => {
    setEditForm(prev => {
      const currentImgs = Array.isArray(prev.imagenes) ? prev.imagenes : (prev.imagen_url ? [prev.imagen_url] : []);
      const selected = currentImgs[indexToPrimary];
      const rest = currentImgs.filter((_, idx) => idx !== indexToPrimary);
      const reordered = [selected, ...rest];
      return {
        ...prev,
        imagenes: reordered,
        imagen_url: selected
      };
    });
  };

  // 1. Manejo de Crear Gorra
  const handleCreateCap = async (e) => {
    e.preventDefault();
    if (!newCap.nombre || !newCap.precio) {
      alert('Por favor ingresa el nombre y precio de la gorra.');
      return;
    }
    const hasImages = (newCap.imagenes && newCap.imagenes.length > 0) || newCap.imagen_url;
    if (!hasImages) {
      alert('Por favor sube al menos una imagen para la gorra.');
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
        imagen_url: '',
        imagenes: [],
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
    const capImages = Array.isArray(cap.imagenes) && cap.imagenes.length > 0
      ? cap.imagenes
      : (cap.imagen_url ? [cap.imagen_url] : []);
    setEditForm({ ...cap, imagenes: capImages, imagen_url: capImages[0] || '' });
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

                          {/* Fotos de la gorra en edición (Galería múltiple) */}
                          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                                <Images className="w-3.5 h-3.5 text-amber-400" />
                                <span>Fotos del Producto ({(editForm.imagenes || []).length})</span>
                              </span>

                              <div>
                                <input
                                  ref={editFileInputRef}
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files?.length) handleEditUploadFiles(e.target.files);
                                  }}
                                />
                                <button
                                  type="button"
                                  disabled={uploadingEditImage}
                                  onClick={() => editFileInputRef.current?.click()}
                                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                >
                                  <UploadCloud className="w-3.5 h-3.5" />
                                  <span>{uploadingEditImage ? 'Subiendo fotos...' : '+ Añadir más fotos'}</span>
                                </button>
                              </div>
                            </div>

                            {/* Grid de miniaturas en edición */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                              {(editForm.imagenes || [editForm.imagen_url]).filter(Boolean).map((imgUrl, idx) => (
                                <div
                                  key={idx}
                                  className={`relative group rounded-xl overflow-hidden border p-1.5 bg-slate-900 ${
                                    idx === 0 ? 'border-amber-500 ring-1 ring-amber-500/40' : 'border-slate-800'
                                  }`}
                                >
                                  <img
                                    src={imgUrl}
                                    alt={`Foto ${idx + 1}`}
                                    className="w-full h-20 object-contain rounded-lg bg-slate-950"
                                  />

                                  {/* Badge o botón Portada */}
                                  <div className="mt-1 flex items-center justify-between gap-1">
                                    {idx === 0 ? (
                                      <span className="text-[9px] font-bold bg-amber-500 text-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                        <Star className="w-2.5 h-2.5 fill-black" /> Portada
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleSetPrimaryEditImage(idx)}
                                        className="text-[9px] text-slate-400 hover:text-amber-400 underline truncate"
                                      >
                                        Hacer Portada
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => handleRemoveEditImage(idx)}
                                      className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/20"
                                      title="Eliminar esta foto"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
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

            {/* ── SUBIDA DE MÚLTIPLES IMÁGENES POR ARCHIVO O ENLACE ── */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase flex items-center gap-1.5">
                  <Images className="w-4 h-4 text-amber-400" />
                  <span>Fotos de la Gorra {(newCap.imagenes || []).length > 0 && `(${(newCap.imagenes || []).length})`} *</span>
                </label>
                <button
                  type="button"
                  onClick={() => setUseUrlInput(!useUrlInput)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 underline"
                >
                  {useUrlInput ? '📁 Subir archivos desde tu PC' : '🔗 O ingresar por enlace URL'}
                </button>
              </div>

              {!useUrlInput ? (
                <div className="space-y-3">
                  {/* Grid de miniaturas cargadas si ya hay fotos */}
                  {(newCap.imagenes || []).length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                      {(newCap.imagenes || []).map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className={`relative rounded-xl overflow-hidden border p-1.5 bg-slate-900 group ${
                            idx === 0 ? 'border-amber-500 ring-1 ring-amber-500/40' : 'border-slate-800'
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`Gorra foto ${idx + 1}`}
                            className="w-full h-24 object-contain rounded-lg bg-slate-950"
                          />

                          <div className="mt-1 flex items-center justify-between gap-1">
                            {idx === 0 ? (
                              <span className="text-[9px] font-bold bg-amber-500 text-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-black" /> Portada
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryNewCapImage(idx)}
                                className="text-[9px] text-slate-400 hover:text-amber-400 underline truncate"
                              >
                                Hacer Portada
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveNewCapImage(idx)}
                              className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/20"
                              title="Eliminar esta foto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Zona Drag & Drop / Click para subir una o varias fotos */}
                  <div
                    className={`relative w-full border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
                      uploadingImage
                        ? 'border-amber-500/60 bg-amber-500/5'
                        : (newCap.imagenes || []).length > 0
                        ? 'border-slate-700 hover:border-amber-500/50 bg-slate-900/40 py-4'
                        : 'border-slate-700 hover:border-amber-500/50 bg-slate-900/60 py-8'
                    }`}
                    onClick={() => !uploadingImage && fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const files = e.dataTransfer.files;
                      if (files && files.length > 0) handleUploadFiles(files);
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) handleUploadFiles(files);
                      }}
                    />

                    <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none px-4 text-center">
                      {uploadingImage ? (
                        <>
                          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                          <p className="text-xs text-amber-400 font-semibold">Subiendo fotos al servidor...</p>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-7 h-7 text-amber-400/80" />
                          <p className="text-xs text-slate-200 font-semibold">
                            {(newCap.imagenes || []).length > 0
                              ? '+ Clic o arrastra para añadir más fotos a esta gorra'
                              : 'Haz clic o arrastra 1 o más imágenes aquí (puedes seleccionar varias)'}
                          </p>
                          <p className="text-[11px] text-slate-500">JPG, PNG, WEBP, GIF hasta 10 MB cada una</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Entrada manual por URL */
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCustomUrl(customUrl)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl"
                    >
                      Añadir Foto
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Presets rápidos:</span>
                    <div className="flex gap-1.5">
                      {PRESET_IMAGES.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddCustomUrl(imgUrl)}
                          className="w-6 h-6 rounded-md overflow-hidden border border-slate-700 hover:border-amber-400"
                          title="Añadir preset"
                        >
                          <img src={imgUrl} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lista de fotos añadidas por URL */}
                  {(newCap.imagenes || []).length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                      {(newCap.imagenes || []).map((imgUrl, idx) => (
                        <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-800 p-1 bg-slate-900">
                          <img src={imgUrl} alt={`Preset ${idx}`} className="w-full h-20 object-contain rounded" />
                          <button
                            type="button"
                            onClick={() => handleRemoveNewCapImage(idx)}
                            className="absolute top-2 right-2 p-1 rounded bg-black/80 text-rose-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Error de subida */}
              {uploadError && (
                <div className="mt-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
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
