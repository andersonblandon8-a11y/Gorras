import db from '../config/db.js';

export const SettingsModel = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM configuracion', [], (err, rows) => {
        if (err) reject(err);
        else {
          const config = {};
          rows.forEach(r => { config[r.clave] = r.valor; });
          resolve(config);
        }
      });
    });
  },

  update: (clave, valor) => {
    return new Promise((resolve, reject) => {
      db.run('INSERT OR REPLACE INTO configuracion (clave, valor) VALUES (?, ?)', [clave, valor], function(err) {
        if (err) reject(err);
        else resolve({ clave, valor });
      });
    });
  }
};
