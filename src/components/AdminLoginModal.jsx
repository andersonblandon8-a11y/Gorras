import React, { useState } from 'react';
import { X, Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

export const AdminLoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Credenciales de administración
    const validUser = 'admin';
    const validPass = localStorage.getItem('admin_custom_password') || 'admin123';

    if (username.trim().toLowerCase() === validUser && password === validPass) {
      sessionStorage.setItem('admin_authenticated', 'true');
      onLoginSuccess();
      setUsername('');
      setPassword('');
    } else {
      setError('Usuario o contraseña incorrectos. Verifica tus credenciales.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-modal">
      <div className="relative w-full max-w-md bg-[#0e1017] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">
        
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Encabezado */}
        <div className="text-center space-y-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-lg">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white font-outfit">Acceso Administrador</h2>
          <p className="text-xs text-slate-400">
            Ingresa tu usuario y contraseña para administrar el catálogo, precios y WhatsApp.
          </p>
        </div>

        {/* Alerta de Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario de Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Usuario Administrador
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej: admin"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs tracking-wide shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Ingresar al Panel</span>
          </button>
        </form>

        {/* Nota informativa de credenciales por defecto */}
        <div className="mt-6 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 text-center space-y-1">
          <span className="font-semibold text-amber-400 block">Acceso de Seguridad</span>
          <p>Usuario: <strong className="text-white">admin</strong> | Clave inicial: <strong className="text-white">admin123</strong></p>
        </div>

      </div>
    </div>
  );
};
