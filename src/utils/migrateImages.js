/**
 * migrateImages.js
 * Migra las imágenes guardadas como base64 en Supabase DB
 * al bucket de Supabase Storage, y actualiza los registros con la URL del CDN.
 *
 * Uso: importar y llamar a migrateBase64ImagesToStorage() desde el AdminPanel
 */
import { supabase } from '../services/supabase';

const BUCKET = 'gorras-imagenes';

// Convierte un string base64 a Blob
const base64ToBlob = (base64, mimeType = 'image/jpeg') => {
  try {
    const data = base64.includes(',') ? base64.split(',')[1] : base64;
    const byteString = atob(data);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    return new Blob([ab], { type: mimeType });
  } catch {
    return null;
  }
};

// Sube un blob al Storage y devuelve la URL pública
const uploadBlobToStorage = async (blob, gorraId, index) => {
  const fileName = `gorras/migrated_${gorraId}_${index}_${Date.now()}.jpg`;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, blob, { contentType: 'image/jpeg', upsert: false });

  if (error || !data) return null;

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path);

  return urlData?.publicUrl || null;
};

// Verifica si un string es base64 (no URL externa)
const isBase64Image = (str) => {
  if (!str || typeof str !== 'string') return false;
  return str.startsWith('data:image') || (str.length > 500 && !str.startsWith('http'));
};

/**
 * Función principal de migración
 * @param {Function} onProgress - callback(mensaje, porcentaje)
 * @returns {Promise<{migradas: number, errores: number, total: number}>}
 */
export const migrateBase64ImagesToStorage = async (onProgress = () => {}) => {
  onProgress('Cargando gorras desde Supabase...', 0);

  // 1. Obtener todas las gorras
  const { data: gorras, error } = await supabase.from('gorras').select('*');
  if (error) throw new Error('Error al cargar gorras: ' + error.message);

  const gorrasConBase64 = gorras.filter(g => {
    const imgs = Array.isArray(g.imagenes) ? g.imagenes : [];
    return imgs.some(isBase64Image) || isBase64Image(g.imagen_url);
  });

  if (gorrasConBase64.length === 0) {
    onProgress('✅ No hay imágenes base64 que migrar. Todo ya está en Storage.', 100);
    return { migradas: 0, errores: 0, total: 0 };
  }

  onProgress(`Encontradas ${gorrasConBase64.length} gorras con imágenes base64...`, 5);

  let migradas = 0;
  let errores = 0;

  for (let i = 0; i < gorrasConBase64.length; i++) {
    const gorra = gorrasConBase64[i];
    const porcentaje = Math.round(5 + ((i + 1) / gorrasConBase64.length) * 90);
    onProgress(`Migrando: ${gorra.nombre} (${i + 1}/${gorrasConBase64.length})...`, porcentaje);

    try {
      // Migrar el array de imágenes
      let imgs = Array.isArray(gorra.imagenes) ? [...gorra.imagenes] : [];
      
      // Si imagenes está vacío pero hay imagen_url, usar esa
      if (imgs.length === 0 && gorra.imagen_url) {
        imgs = [gorra.imagen_url];
      }

      const nuevasUrls = [];
      for (let j = 0; j < imgs.length; j++) {
        const img = imgs[j];
        if (isBase64Image(img)) {
          const blob = base64ToBlob(img);
          if (!blob) { nuevasUrls.push(img); continue; }
          const url = await uploadBlobToStorage(blob, gorra.id, j);
          nuevasUrls.push(url || img); // fallback: dejar el base64 si falla
        } else {
          nuevasUrls.push(img); // ya es URL externa, no migrar
        }
      }

      // Actualizar en Supabase DB con las nuevas URLs
      const primaryImg = nuevasUrls[0] || gorra.imagen_url || '';
      const { error: updateError } = await supabase
        .from('gorras')
        .update({ imagenes: nuevasUrls, imagen_url: primaryImg })
        .eq('id', gorra.id);

      if (updateError) {
        errores++;
        console.error(`Error actualizando gorra ${gorra.id}:`, updateError.message);
      } else {
        migradas++;
      }
    } catch (err) {
      errores++;
      console.error(`Error migrando gorra ${gorra.id}:`, err);
    }
  }

  onProgress(
    `✅ Migración completada: ${migradas} gorras migradas, ${errores} errores.`,
    100
  );

  return { migradas, errores, total: gorrasConBase64.length };
};
