import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { FilterSidebar } from './components/FilterSidebar';
import { CapGrid } from './components/CapGrid';
import { QuickViewModal } from './components/QuickViewModal';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ImageLightbox } from './components/ImageLightbox';
import { Footer } from './components/Footer';
import { fetchGorras, fetchSettings } from './services/api';

export function App() {
  const [gorras, setGorras] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ajustes de la tienda (Teléfono WhatsApp)
  const [phone, setPhone] = useState('573502522375');

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('Todas');
  const [selectedColor, setSelectedColor] = useState('Todos');
  const [selectedEstilo, setSelectedEstilo] = useState('Todos');
  const [precioMax, setPrecioMax] = useState(200000);

  // Modales
  const [selectedCapModal, setSelectedCapModal] = useState(null);
  const [zoomedCap, setZoomedCap] = useState(null);           // Lightbox de imagen ampliada
  const [showAdminLogin, setShowAdminLogin] = useState(false); // Modal login admin
  const [showAdminPanel, setShowAdminPanel] = useState(false); // Panel admin
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const catalogRef = useRef(null);

  // Cargar gorras y ajustes desde la base de datos SQLite
  const loadData = async () => {
    setLoading(true);
    try {
      const [capsData, settingsData] = await Promise.all([
        fetchGorras({
          categoria: selectedCategoria,
          color: selectedColor,
          estilo: selectedEstilo,
          precioMax: precioMax,
          search: searchQuery
        }),
        fetchSettings()
      ]);
      
      setGorras(capsData);
      if (settingsData && settingsData.whatsapp_phone) {
        setPhone(settingsData.whatsapp_phone);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategoria, selectedColor, selectedEstilo, precioMax, searchQuery]);

  const handleResetFilters = () => {
    setSelectedCategoria('Todas');
    setSelectedColor('Todos');
    setSelectedEstilo('Todos');
    setPrecioMax(200000);
    setSearchQuery('');
  };

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Abrir Admin: pide login si no hay sesión activa en esta pestaña
  const handleOpenAdmin = () => {
    const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
    if (isAuth) {
      setShowAdminPanel(true);
    } else {
      setShowAdminLogin(true);
    }
  };

  // Login exitoso: guarda sesión y abre panel
  const handleAdminLoginSuccess = () => {
    setShowAdminLogin(false);
    setShowAdminPanel(true);
  };

  // Cerrar admin y limpiar sesión
  const handleCloseAdmin = () => {
    setShowAdminPanel(false);
    sessionStorage.removeItem('admin_authenticated');
  };

  return (
    <div className="min-h-screen bg-[#08090c] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      
      {/* 1. Navbar con buscador y acceso Admin */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        phone={phone}
        onOpenAdmin={handleOpenAdmin}
        onToggleMobileFilter={() => setMobileFilterOpen(!mobileFilterOpen)}
        totalGorras={gorras.length}
      />

      {/* 2. Hero Section con diseño visual impacto */}
      <HeroBanner onScrollToCatalog={scrollToCatalog} />

      {/* 3. Catálogo Principal con Filtros en vivo */}
      <main ref={catalogRef} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Sidebar Filtros (Desktop) */}
          <div className="hidden lg:block sticky top-24">
            <FilterSidebar
              selectedCategoria={selectedCategoria}
              setSelectedCategoria={setSelectedCategoria}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              selectedEstilo={selectedEstilo}
              setSelectedEstilo={setSelectedEstilo}
              precioMax={precioMax}
              setPrecioMax={setPrecioMax}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Sidebar Filtros (Móvil colapsable) */}
          {mobileFilterOpen && (
            <div className="lg:hidden w-full mb-4">
              <FilterSidebar
                selectedCategoria={selectedCategoria}
                setSelectedCategoria={setSelectedCategoria}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                selectedEstilo={selectedEstilo}
                setSelectedEstilo={setSelectedEstilo}
                precioMax={precioMax}
                setPrecioMax={setPrecioMax}
                onResetFilters={handleResetFilters}
              />
            </div>
          )}

          {/* Grid de Gorras */}
          <CapGrid
            gorras={gorras}
            phone={phone}
            onSelectCap={(cap) => setSelectedCapModal(cap)}
            onZoomImage={(cap) => setZoomedCap(cap)}
            onResetFilters={handleResetFilters}
            loading={loading}
          />

        </div>

      </main>

      {/* 4. Modal Ver Detalle & Formulario Opcional para WhatsApp */}
      {selectedCapModal && (
        <QuickViewModal
          key={`quick-${selectedCapModal.id}-${selectedCapModal.activeImageIndex || 0}`}
          cap={selectedCapModal}
          phone={phone}
          onClose={() => setSelectedCapModal(null)}
          onZoomImage={(cap) => {
            setSelectedCapModal(null);
            setZoomedCap(cap);
          }}
        />
      )}

      {/* 5. Lightbox de imagen ampliada con zoom */}
      {zoomedCap && (
        <ImageLightbox
          key={`zoom-${zoomedCap.id}-${zoomedCap.activeImageIndex || 0}`}
          cap={zoomedCap}
          phone={phone}
          onClose={() => setZoomedCap(null)}
        />
      )}

      {/* 6. Modal de Login para Admin */}
      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* 7. Panel de Administración (solo si está autenticado) */}
      {showAdminPanel && (
        <AdminPanel
          gorras={gorras}
          phone={phone}
          onClose={handleCloseAdmin}
          onRefreshData={loadData}
        />
      )}

      {/* 8. Footer con información de la tienda y copyright */}
      <Footer
        phone={phone}
        onOpenAdmin={handleOpenAdmin}
      />

    </div>
  );
}

export default App;
