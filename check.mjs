/**
 * Verifica el estado actual de las imágenes en Supabase
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error(
    'Error: faltan las variables SUPABASE_URL y SUPABASE_SECRET_KEY.'
  );
  process.exit(1);
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SECRET_KEY
);

const { data: gorras, error } = await supabase
  .from('gorras')
  .select('id, nombre, imagen_url, imagenes');

if (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

console.log(`\n📦 ${gorras.length} gorras encontradas:\n`);

for (const g of gorras) {
  let imgs = [];

  try {
    imgs = Array.isArray(g.imagenes)
      ? g.imagenes
      : (
        typeof g.imagenes === 'string'
          ? JSON.parse(g.imagenes)
          : []
      );
  } catch {
    imgs = [];
  }

  const tipo = imgs.length > 0
    ? (
      typeof imgs[0] === 'string' && imgs[0].startsWith('http')
        ? '✅ CDN URL'
        : '❌ BASE64'
    )
    : (
      typeof g.imagen_url === 'string' && g.imagen_url.startsWith('http')
        ? '⚠️ CDN (solo imagen_url)'
        : '❌ sin imagen'
    );

  console.log(`[${g.id}] ${g.nombre}`);
  console.log(`     Tipo: ${tipo}`);

  if (typeof imgs[0] === 'string' && imgs[0].startsWith('http')) {
    console.log(`     URL:  ${imgs[0].substring(0, 90)}...`);
  } else if (imgs[0]) {
    console.log(`     (base64 de ${imgs[0].length} chars)`);
  }

  console.log();
}