/**
 * migrate.mjs V2 - Procesa gorra por gorra para evitar timeout
 * en imágenes base64 muy grandes (hasta 5MB)
 * Ejecutar con: node migrate.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SECRET_KEY;
const BUCKET = 'gorras-imagenes';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    '❌ Faltan las variables SUPABASE_URL o SUPABASE_SECRET_KEY en .env'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const isBase64Image = (str) => {
  if (!str || typeof str !== 'string') return false;
  return str.startsWith('data:image') || (str.length > 500 && !str.startsWith('http'));
};

const base64ToBuffer = (base64) => {
  try {
    const data = base64.includes(',') ? base64.split(',')[1] : base64;
    return Buffer.from(data, 'base64');
  } catch {
    return null;
  }
};

const uploadToStorage = async (buffer, gorraId, index) => {
  const fileName = `gorras/migrated_${gorraId}_${index}_${Date.now()}.jpg`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, buffer, {
      contentType: 'image/jpeg',
      upsert: false
    });

  if (error) {
    console.error(
      `    ❌ Error subiendo imagen ${index}:`,
      error.message
    );
    return null;
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path);

  return urlData?.publicUrl || null;
};

async function migrate() {
  console.log('🚀 Iniciando migración V2 (gorra por gorra)...\n');

  // Paso 1: Obtener solo los IDs y nombres
  const { data: ids, error: idsError } = await supabase
    .from('gorras')
    .select('id, nombre')
    .order('id', { ascending: true });

  if (idsError) {
    console.error('Error:', idsError.message);
    process.exit(1);
  }

  console.log(
    `📦 ${ids.length} gorras encontradas. Procesando una por una...\n`
  );

  let migradas = 0;
  let sinCambios = 0;
  let errores = 0;

  for (const { id, nombre } of ids) {
    process.stdout.write(`[${id}] ${nombre}\n`);

    // Paso 2: Traer las imágenes de UNA sola gorra
    const { data: gorra, error: gorraError } = await supabase
      .from('gorras')
      .select('id, imagen_url, imagenes')
      .eq('id', id)
      .single();

    if (gorraError) {
      console.error(
        `  ❌ Error leyendo gorra ${id}:`,
        gorraError.message
      );
      errores++;
      continue;
    }

    // Parsear imágenes
    let imgs = [];

    try {
      imgs = Array.isArray(gorra.imagenes)
        ? gorra.imagenes
        : (
          typeof gorra.imagenes === 'string'
            ? JSON.parse(gorra.imagenes)
            : []
        );
    } catch {
      imgs = [];
    }

    if (imgs.length === 0 && gorra.imagen_url) {
      imgs = [gorra.imagen_url];
    }

    const tieneBase64 = imgs.some(isBase64Image);

    if (!tieneBase64) {
      console.log(`  ⏭️  Ya está en CDN\n`);
      sinCambios++;
      continue;
    }

    console.log(`  ⬆️  Migrando ${imgs.length} imagen(es)...`);

    const nuevasUrls = [];

    for (let i = 0; i < imgs.length; i++) {
      const img = imgs[i];

      if (!isBase64Image(img)) {
        nuevasUrls.push(img);
        continue;
      }

      const buffer = base64ToBuffer(img);

      if (!buffer) {
        nuevasUrls.push(img);
        continue;
      }

      // Pequeña pausa para no saturar
      await new Promise((r) => setTimeout(r, 200));

      const url = await uploadToStorage(buffer, id, i);

      if (url) {
        nuevasUrls.push(url);

        console.log(
          `     ✅ Imagen ${i + 1}/${imgs.length} → CDN`
        );
      } else {
        nuevasUrls.push(img);
        errores++;
      }
    }

    // Actualizar BD con las nuevas URLs
    const primaryImg =
      nuevasUrls.find(
        (u) => typeof u === 'string' && u.startsWith('http')
      ) ||
      nuevasUrls[0] ||
      '';

    const { error: updateError } = await supabase
      .from('gorras')
      .update({
        imagenes: nuevasUrls,
        imagen_url: primaryImg
      })
      .eq('id', id);

    if (updateError) {
      console.error(
        `  ❌ Error actualizando BD:`,
        updateError.message
      );

      errores++;
    } else {
      console.log(
        `  💾 BD actualizada con ${nuevasUrls.filter(
          (u) => typeof u === 'string' && u.startsWith('http')
        ).length
        } URL(s) del CDN`
      );

      migradas++;
    }

    console.log();
  }

  console.log('========================================');
  console.log('✅ MIGRACIÓN V2 COMPLETADA');
  console.log(`   • Migradas al Storage: ${migradas}`);
  console.log(`   • Ya estaban en CDN:   ${sinCambios}`);
  console.log(`   • Errores:             ${errores}`);
  console.log('========================================\n');
}

migrate().catch(console.error);