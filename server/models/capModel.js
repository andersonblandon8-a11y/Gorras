import db from '../config/db.js';

export const CapModel = {
  // Obtener todas las gorras con filtros opcionales
  getAll: (filters = {}) => {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM gorras WHERE 1=1';
      const params = [];

      if (filters.categoria && filters.categoria !== 'Todas') {
        sql += ' AND categoria = ?';
        params.push(filters.categoria);
      }

      if (filters.color && filters.color !== 'Todos') {
        sql += ' AND color = ?';
        params.push(filters.color);
      }

      if (filters.estilo && filters.estilo !== 'Todos') {
        sql += ' AND estilo = ?';
        params.push(filters.estilo);
      }

      if (filters.precioMax) {
        sql += ' AND precio <= ?';
        params.push(filters.precioMax);
      }

      if (filters.precioMin) {
        sql += ' AND precio >= ?';
        params.push(filters.precioMin);
      }

      if (filters.search) {
        sql += ' AND (nombre LIKE ? OR descripcion LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      // Ordenar por más recientes por defecto
      sql += ' ORDER BY id DESC';

      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Obtener una gorra por ID
  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM gorras WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // Crear una nueva gorra
  create: (data) => {
    return new Promise((resolve, reject) => {
      const { nombre, descripcion, precio, color, categoria, estilo, imagen_url, destacada = 0, stock = 1 } = data;
      const sql = `
        INSERT INTO gorras (nombre, descripcion, precio, color, categoria, estilo, imagen_url, destacada, stock)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.run(sql, [nombre, descripcion, precio, color, categoria, estilo, imagen_url, destacada ? 1 : 0, stock], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...data });
      });
    });
  },

  // Actualizar una gorra existente
  update: (id, data) => {
    return new Promise((resolve, reject) => {
      const { nombre, descripcion, precio, color, categoria, estilo, imagen_url, destacada, stock } = data;
      const sql = `
        UPDATE gorras
        SET nombre = ?, descripcion = ?, precio = ?, color = ?, categoria = ?, estilo = ?, imagen_url = ?, destacada = ?, stock = ?
        WHERE id = ?
      `;
      db.run(sql, [nombre, descripcion, precio, color, categoria, estilo, imagen_url, destacada ? 1 : 0, stock, id], function(err) {
        if (err) reject(err);
        else resolve({ id, ...data, changes: this.changes });
      });
    });
  },

  // Eliminar una gorra
  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM gorras WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ id, changes: this.changes });
      });
    });
  },

  // Obtener metadatos de categorías, colores y estilos existentes
  getMetadata: () => {
    return new Promise((resolve, reject) => {
      const metadata = {};

      db.all('SELECT DISTINCT categoria FROM gorras', [], (err, categories) => {
        if (err) return reject(err);
        metadata.categorias = categories.map(c => c.categoria);

        db.all('SELECT DISTINCT color FROM gorras', [], (err, colors) => {
          if (err) return reject(err);
          metadata.colores = colors.map(c => c.color);

          db.all('SELECT DISTINCT estilo FROM gorras', [], (err, styles) => {
            if (err) return reject(err);
            metadata.estilos = styles.map(s => s.estilo);
            resolve(metadata);
          });
        });
      });
    });
  }
};
