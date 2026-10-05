import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import './copyImages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'gorras.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos SQLite:', err.message);
  } else {
    console.log('✅ Conectado a la base de datos SQLite en:', dbPath);
    initTables();
  }
});

function initTables() {
  db.serialize(() => {
    // Tabla de Gorras
    db.run(`
      CREATE TABLE IF NOT EXISTS gorras (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        precio REAL NOT NULL,
        color TEXT NOT NULL,
        categoria TEXT NOT NULL,
        estilo TEXT NOT NULL,
        imagen_url TEXT NOT NULL,
        imagenes TEXT,
        destacada INTEGER DEFAULT 0,
        stock INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migración segura si la base de datos ya existía previamente sin la columna 'imagenes'
    db.run(`ALTER TABLE gorras ADD COLUMN imagenes TEXT`, () => {
      // Ignorar error si la columna ya existe
    });

    // Tabla de Configuración de la Tienda
    db.run(`
      CREATE TABLE IF NOT EXISTS configuracion (
        clave TEXT PRIMARY KEY,
        valor TEXT NOT NULL
      )
    `);

    // Configuración por defecto
    db.run(`INSERT OR IGNORE INTO configuracion (clave, valor) VALUES ('whatsapp_phone', '573502522375')`);
    db.run(`INSERT OR IGNORE INTO configuracion (clave, valor) VALUES ('nombre_tienda', 'CROWN & CAP COLOMBIA')`);

    // La base de datos no insertará gorras por defecto; queda lista para los productos reales del usuario.
  });
}

export default db;
