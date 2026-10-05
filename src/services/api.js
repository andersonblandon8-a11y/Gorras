import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  supabase?.from
);

// 1. OBTENER GORRAS (Prioridad: Supabase Cloud directo)
export const fetchGorras = async (filters = {}) => {
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('gorras').select('*').order('id', { ascending: false });

      if (filters.categoria && filters.categoria !== 'Todas') {
        query = query.eq('categoria', filters.categoria);
      }
      if (filters.color && filters.color !== 'Todos') {
        query = query.eq('color', filters.color);
      }
      if (filters.estilo && filters.estilo !== 'Todos') {
        query = query.eq('estilo', filters.estilo);
      }
      if (filters.precioMax) {
        query = query.lte('precio', Number(filters.precioMax));
      }
      if (filters.precioMin) {
        query = query.gte('precio', Number(filters.precioMin));
      }
      if (filters.search) {
        query = query.ilike('nombre', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        return data.map(item => {
          let imgs = [];
          if (item.imagenes) {
            try {
              imgs = typeof item.imagenes === 'string' ? JSON.parse(item.imagenes) : item.imagenes;
            } catch {
              imgs = [item.imagenes];
            }
          }
          if (!Array.isArray(imgs) || imgs.length === 0) {
            imgs = item.imagen_url ? [item.imagen_url] : [];
          }
          return {
            ...item,
            imagenes: imgs,
            imagen_url: imgs[0] || item.imagen_url || ''
          };
        });
      }
    } catch (e) {
      console.warn('Fallo consulta a Supabase, intentando endpoint REST local:', e);
    }
  }

  // Respaldo secundario: endpoint express si estuviera disponible
  try {
    const params = new URLSearchParams();
    if (filters.categoria && filters.categoria !== 'Todas') params.append('categoria', filters.categoria);
    if (filters.color && filters.color !== 'Todos') params.append('color', filters.color);
    if (filters.estilo && filters.estilo !== 'Todos') params.append('estilo', filters.estilo);
    if (filters.precioMax) params.append('precioMax', filters.precioMax);
    if (filters.precioMin) params.append('precioMin', filters.precioMin);
    if (filters.search) params.append('search', filters.search);

    const res = await fetch(`${API_BASE_URL}/caps?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    // Silencioso
  }

  return [];
};

// 2. OBTENER CONFIGURACION (WhatsApp)
export const fetchSettings = async () => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('configuracion').select('*');
      if (!error && data && data.length > 0) {
        const configMap = {};
        data.forEach(item => {
          configMap[item.clave] = item.valor;
        });
        return {
          whatsapp_phone: configMap.whatsapp_phone || '573502522375',
          nombre_tienda: configMap.nombre_tienda || 'CROWN & CAP Store',
          mensaje_bienvenida: '¡Hola! Quisiera consultar sobre el pedido de una gorra.'
        };
      }
    } catch (e) {
      console.warn('Fallo lectura configuracion Supabase:', e);
    }
  }

  try {
    const res = await fetch(`${API_BASE_URL}/settings`);
    if (res.ok) return await res.json();
  } catch (err) {
    // fallback
  }

  return {
    whatsapp_phone: '573502522375',
    nombre_tienda: 'CROWN & CAP Store',
    mensaje_bienvenida: '¡Hola! Quisiera consultar sobre el pedido de una gorra.'
  };
};

// 3. CREAR GORRA (Directo en Supabase)
export const createGorraAPI = async (data) => {
  const imgsArray = Array.isArray(data.imagenes) && data.imagenes.length > 0 
    ? data.imagenes 
    : (data.imagen_url ? [data.imagen_url] : []);
  const primaryImg = imgsArray[0] || data.imagen_url || '';

  if (isSupabaseConfigured) {
    const payload = {
      nombre: data.nombre,
      descripcion: data.descripcion || '',
      precio: parseFloat(data.precio),
      color: data.color,
      categoria: data.categoria,
      estilo: data.estilo,
      imagen_url: primaryImg,
      imagenes: imgsArray,
      destacada: data.destacada ? 1 : 0,
      stock: parseInt(data.stock, 10) || 1
    };

    const { data: created, error } = await supabase
      .from('gorras')
      .insert([payload])
      .select()
      .single();

    if (!error && created) {
      return created;
    }
    if (error) {
      console.error('Error insertando en Supabase:', error);
      throw new Error(error.message || 'Error al guardar en Supabase');
    }
  }

  // Fallback REST Express
  const res = await fetch(`${API_BASE_URL}/caps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al crear la gorra');
  return await res.json();
};

// 4. ACTUALIZAR GORRA
export const updateGorraAPI = async (id, data) => {
  const imgsArray = Array.isArray(data.imagenes) ? data.imagenes : (data.imagen_url ? [data.imagen_url] : undefined);
  const primaryImg = imgsArray && imgsArray.length > 0 ? imgsArray[0] : data.imagen_url;

  if (isSupabaseConfigured) {
    const payload = {
      ...(data.nombre !== undefined && { nombre: data.nombre }),
      ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
      ...(data.precio !== undefined && { precio: parseFloat(data.precio) }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.categoria !== undefined && { categoria: data.categoria }),
      ...(data.estilo !== undefined && { estilo: data.estilo }),
      ...(primaryImg !== undefined && { imagen_url: primaryImg }),
      ...(imgsArray !== undefined && { imagenes: imgsArray }),
      ...(data.destacada !== undefined && { destacada: data.destacada ? 1 : 0 }),
      ...(data.stock !== undefined && { stock: parseInt(data.stock, 10) })
    };

    const { data: updated, error } = await supabase
      .from('gorras')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (!error && updated) return updated;
    if (error) throw new Error(error.message);
  }

  const res = await fetch(`${API_BASE_URL}/caps/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al actualizar la gorra');
  return await res.json();
};

// 5. ELIMINAR GORRA
export const deleteGorraAPI = async (id) => {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('gorras').delete().eq('id', id);
    if (!error) return { message: 'Gorra eliminada con éxito' };
    if (error) throw new Error(error.message);
  }

  const res = await fetch(`${API_BASE_URL}/caps/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar la gorra');
  return await res.json();
};

// 6. ACTUALIZAR CONFIGURACION
export const updateSettingsAPI = async (settings) => {
  if (isSupabaseConfigured && settings.whatsapp_phone) {
    await supabase.from('configuracion').upsert({ clave: 'whatsapp_phone', valor: settings.whatsapp_phone });
    return { success: true };
  }

  const res = await fetch(`${API_BASE_URL}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error('Error al actualizar configuración');
  return await res.json();
};

// 7. SUBIR IMÁGENES (Soporta Base64 persistente en Supabase o Storage bucket)
export const uploadImagenesAPI = async (files) => {
  const fileArray = Array.isArray(files) || files instanceof FileList ? Array.from(files) : [files];

  // Opcion 1: Subir a Supabase Storage bucket 'gorras' si existe
  if (isSupabaseConfigured && supabase.storage) {
    const urls = [];
    for (const f of fileArray) {
      const ext = f.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const { data, error } = await supabase.storage.from('gorras').upload(fileName, f);
      
      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from('gorras').getPublicUrl(fileName);
        if (publicUrlData?.publicUrl) {
          urls.push(publicUrlData.publicUrl);
          continue;
        }
      }

      // Si no hay bucket creado en Supabase, convertir a Data URL (Base64) para guardarse 100% permanente en la base de datos
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(f);
      });
      urls.push(base64);
    }
    return { urls, url: urls[0] || '' };
  }

  // Opcion 2: Subida por servidor backend express
  const formData = new FormData();
  fileArray.forEach((f) => formData.append('imagenes', f));

  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Error al subir imágenes');
  const data = await res.json();
  const urls = data.urls || (data.url ? [data.url] : []);
  return { urls, url: urls[0] || '' };
};

export const uploadImagenAPI = uploadImagenesAPI;

// 8. EXPORTAR RESPALDO JSON
export const exportBackupAPI = async () => {
  const gorras = await fetchGorras({});
  const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), gorras }, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `crown_cap_backup_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 9. IMPORTAR RESPALDO JSON
export const importBackupAPI = async (file, clearBefore = true) => {
  const text = await file.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Archivo inválido: debe ser un JSON de respaldo de Crown & Cap');
  }
  const gorras = parsed.gorras ?? (Array.isArray(parsed) ? parsed : null);
  if (!gorras || !Array.isArray(gorras)) {
    throw new Error('El archivo no contiene datos de gorras reconocibles');
  }

  if (isSupabaseConfigured) {
    if (clearBefore) {
      await supabase.from('gorras').delete().neq('id', 0);
    }
    for (const g of gorras) {
      await createGorraAPI(g);
    }
    return { message: `✅ ${gorras.length} gorras restauradas exitosamente en la nube.`, count: gorras.length };
  }

  const res = await fetch(`${API_BASE_URL}/caps/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gorras, clearBefore })
  });
  if (!res.ok) throw new Error('Error al importar el catálogo');
  return await res.json();
};

// 10. ELIMINAR DATOS DE EJEMPLO
export const purgeDemoAPI = async () => {
  const DEMO_NAMES = [
    'Gorra Snapback Dark Crown Black',
    'Gorra Trucker Cyber Neon Emerald',
    'Gorra Minimalist Dad Hat White Sand',
    'Gorra Luxury Edition Gold Stealth',
    'Gorra Vintage Crimson Red Classic',
    'Gorra Sports Speed Blue Navy',
    'Snapback Dark Crown Black',
    'Trucker Cyber Neon Emerald',
    'Minimalist Dad Hat White Sand',
    'Luxury Edition Gold Stealth',
    'Vintage Crimson Red Classic',
    'Sports Speed Blue Navy',
    'Gorra Adidas Originals 3D Embroidered',
    'Gorra Chicago White Sox MLB Edition',
    'Gorra Pittsburgh Pirates Logo "P"',
    'Gorra San Francisco Giants "SF"',
    'Gorra Oakland Athletics "A\'s"'
  ];

  if (isSupabaseConfigured) {
    const { error } = await supabase.from('gorras').delete().in('nombre', DEMO_NAMES);
    if (!error) return { message: '✅ Gorras de ejemplo eliminadas de la base de datos.' };
  }

  const res = await fetch(`${API_BASE_URL}/caps/purge-demo`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al limpiar datos de ejemplo');
  return await res.json();
};

