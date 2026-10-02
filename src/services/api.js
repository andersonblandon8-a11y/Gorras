const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const fetchGorras = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.categoria && filters.categoria !== 'Todas') params.append('categoria', filters.categoria);
    if (filters.color && filters.color !== 'Todos') params.append('color', filters.color);
    if (filters.estilo && filters.estilo !== 'Todos') params.append('estilo', filters.estilo);
    if (filters.precioMax) params.append('precioMax', filters.precioMax);
    if (filters.precioMin) params.append('precioMin', filters.precioMin);
    if (filters.search) params.append('search', filters.search);

    const res = await fetch(`${API_BASE_URL}/caps?${params.toString()}`);
    if (!res.ok) throw new Error('Error al conectar con la API');
    return await res.json();
  } catch (err) {
    console.warn('⚠️ No se pudo conectar al backend API Express. Usando catálogo local temporal:', err);
    return getFallbackGorras(filters);
  }
};

export const fetchSettings = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/settings`);
    if (!res.ok) throw new Error('Error al obtener ajustes');
    return await res.json();
  } catch (err) {
    return {
      whatsapp_phone: '573502522375',
      nombre_tienda: 'CROWN & CAP Store',
      mensaje_bienvenida: '¡Hola! Quisiera consultar sobre el pedido de una gorra.'
    };
  }
};

export const createGorraAPI = async (data) => {
  const res = await fetch(`${API_BASE_URL}/caps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al crear la gorra');
  return await res.json();
};

export const updateGorraAPI = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/caps/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al actualizar la gorra');
  return await res.json();
};

export const deleteGorraAPI = async (id) => {
  const res = await fetch(`${API_BASE_URL}/caps/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Error al eliminar la gorra');
  return await res.json();
};

export const updateSettingsAPI = async (settings) => {
  const res = await fetch(`${API_BASE_URL}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error('Error al actualizar configuración');
  return await res.json();
};

// Fallback de respaldo en caso de que se pruebe en un entorno sin puerto 5000 activo
function getFallbackGorras(filters) {
  let list = [
    {
      id: 1,
      nombre: 'Gorra Adidas Originals 3D Embroidered',
      descripcion: 'Colección especial Adidas con relieve bordado 3D frontal de alta densidad. Disponible en combinaciones Blanco/Rojo, Beige/Dorado, Negro/Blanco y Azul.',
      precio: 85000,
      color: 'Beige',
      categoria: 'Urbana',
      estilo: 'Streetwear',
      imagen_url: '/uploads/media_1790821218187.jpg',
      destacada: 1,
      stock: 15
    },
    {
      id: 2,
      nombre: 'Gorra Chicago White Sox MLB Edition',
      descripcion: 'Icónica gorra Chicago Sox con bordado frontal clásico de las Grandes Ligas. Variedad de tonos verde, rojo, negro, beige y azul rey.',
      precio: 90000,
      color: 'Negro',
      categoria: 'MLB',
      estilo: 'Deportivo',
      imagen_url: '/uploads/media_1790821218251.jpg',
      destacada: 1,
      stock: 20
    },
    {
      id: 3,
      nombre: 'Gorra Pittsburgh Pirates Logo "P"',
      descripcion: 'Edición especial Pittsburgh Pirates con logo frontal "P" en contraste. Acabado premium con vicera plana/curva y broche ajustable.',
      precio: 88000,
      color: 'Negro',
      categoria: 'MLB',
      estilo: 'Urbano',
      imagen_url: '/uploads/media_1790821218290.jpg',
      destacada: 1,
      stock: 12
    },
    {
      id: 4,
      nombre: 'Gorra San Francisco Giants "SF"',
      descripcion: 'Modelo exclusivo San Francisco Giants con el icónico emblema "SF" bordado. Disponible en tonalidades pastel, negro contrastado y rojo.',
      precio: 92000,
      color: 'Azul',
      categoria: 'MLB',
      estilo: 'Streetwear',
      imagen_url: '/uploads/media_1790821218329.jpg',
      destacada: 0,
      stock: 18
    },
    {
      id: 5,
      nombre: 'Gorra Oakland Athletics "A\'s"',
      descripcion: 'Diseño clásico Oakland A\'s con bordado premium tridimensional. Colores Blanco/Dorado, Negro/Crema, Azul Cielo y Rojo.',
      precio: 89000,
      color: 'Verde',
      categoria: 'MLB',
      estilo: 'Deportivo',
      imagen_url: '/uploads/media_1790821218370.jpg',
      destacada: 1,
      stock: 10
    }
  ];

  if (filters.categoria && filters.categoria !== 'Todas') {
    list = list.filter(g => g.categoria === filters.categoria);
  }
  if (filters.color && filters.color !== 'Todos') {
    list = list.filter(g => g.color === filters.color);
  }
  if (filters.estilo && filters.estilo !== 'Todos') {
    list = list.filter(g => g.estilo === filters.estilo);
  }
  if (filters.precioMax) {
    list = list.filter(g => g.precio <= Number(filters.precioMax));
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(g => g.nombre.toLowerCase().includes(q) || g.descripcion.toLowerCase().includes(q));
  }

  return list;
}
