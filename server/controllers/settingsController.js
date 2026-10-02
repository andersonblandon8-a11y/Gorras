import { SettingsModel } from '../models/settingsModel.js';

export const getSettings = async (req, res) => {
  try {
    const config = await SettingsModel.getAll();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la configuración de la tienda.' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { whatsapp_phone, nombre_tienda, mensaje_bienvenida } = req.body;
    
    if (whatsapp_phone) await SettingsModel.update('whatsapp_phone', whatsapp_phone);
    if (nombre_tienda) await SettingsModel.update('nombre_tienda', nombre_tienda);
    if (mensaje_bienvenida) await SettingsModel.update('mensaje_bienvenida', mensaje_bienvenida);

    const updatedConfig = await SettingsModel.getAll();
    res.json(updatedConfig);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar configuración.' });
  }
};
