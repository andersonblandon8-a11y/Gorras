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

    // Solo si la base de datos está completamente vacía (0 gorras en total), insertar catálogo inicial
    db.get('SELECT COUNT(*) as count FROM gorras', [], (err, row) => {
      if (!err && row && row.count === 0) {
        console.log('📦 Inicializando catálogo con productos iniciales...');
        const seedGorras = [
          {
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
            nombre: 'Gorra Chicago White Sox MLB Edition',
            descripcion: 'Iconica gorra Chicago Sox con bordado frontal clásico de las Grandes Ligas. Variedad de tonos verde, rojo, negro, beige y azul rey.',
            precio: 90000,
            color: 'Negro',
            categoria: 'MLB',
            estilo: 'Deportivo',
            imagen_url: '/uploads/media_1790821218251.jpg',
            destacada: 1,
            stock: 20
          },
          {
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

        const stmt = db.prepare(`
          INSERT INTO gorras (nombre, descripcion, precio, color, categoria, estilo, imagen_url, imagenes, destacada, stock)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        seedGorras.forEach(g => {
          stmt.run([g.nombre, g.descripcion, g.precio, g.color, g.categoria, g.estilo, g.imagen_url, JSON.stringify([g.imagen_url]), g.destacada, g.stock]);
        });

        stmt.finalize(() => {
          console.log('✅ Catálogo inicial insertado con éxito.');
        });
      }
    });
  });
}

export default db;
