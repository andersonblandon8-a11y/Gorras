import { CapModel } from '../models/capModel.js';

export const getGorras = async (req, res) => {
  try {
    const { categoria, color, estilo, precioMin, precioMax, search } = req.query;
    const gorras = await CapModel.getAll({ categoria, color, estilo, precioMin, precioMax, search });
    res.json(gorras);
  } catch (err) {
    console.error('Error al obtener gorras:', err);
    res.status(500).json({ error: 'Error interno del servidor al consultar gorras.' });
  }
};

export const getGorraById = async (req, res) => {
  try {
    const gorra = await CapModel.getById(req.params.id);
    if (!gorra) {
      return res.status(404).json({ error: 'Gorra no encontrada.' });
    }
    res.json(gorra);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar la gorra.' });
  }
};

export const createGorra = async (req, res) => {
  try {
    const { nombre, descripcion, precio, color, categoria, estilo, imagen_url, imagenes, destacada, stock } = req.body;
    
    if (!nombre || !precio || !color || !categoria || !estilo) {
      return res.status(400).json({ error: 'Campos requeridos faltantes: nombre, precio, color, categoría y estilo son obligatorios.' });
    }

    const imgsList = Array.isArray(imagenes) && imagenes.length > 0 ? imagenes : (imagen_url ? [imagen_url] : []);

    const nuevaGorra = await CapModel.create({
      nombre,
      descripcion: descripcion || '',
      precio: parseFloat(precio),
      color,
      categoria,
      estilo,
      imagen_url: imgsList[0] || imagen_url || 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
      imagenes: imgsList,
      destacada: destacada ? 1 : 0,
      stock: parseInt(stock, 10) || 1
    });

    res.status(201).json(nuevaGorra);
  } catch (err) {
    console.error('Error al crear gorra:', err);
    res.status(500).json({ error: 'Error al guardar la gorra en la base de datos.' });
  }
};

export const updateGorra = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, color, categoria, estilo, imagen_url, imagenes, destacada, stock } = req.body;

    const gorraExistente = await CapModel.getById(id);
    if (!gorraExistente) {
      return res.status(404).json({ error: 'Gorra no encontrada para actualizar.' });
    }

    const result = await CapModel.update(id, {
      nombre: nombre !== undefined ? nombre : gorraExistente.nombre,
      descripcion: descripcion !== undefined ? descripcion : gorraExistente.descripcion,
      precio: precio !== undefined ? parseFloat(precio) : gorraExistente.precio,
      color: color !== undefined ? color : gorraExistente.color,
      categoria: categoria !== undefined ? categoria : gorraExistente.categoria,
      estilo: estilo !== undefined ? estilo : gorraExistente.estilo,
      imagen_url: imagen_url !== undefined ? imagen_url : (Array.isArray(imagenes) && imagenes[0] ? imagenes[0] : gorraExistente.imagen_url),
      imagenes: imagenes !== undefined ? imagenes : gorraExistente.imagenes,
      destacada: destacada !== undefined ? (destacada ? 1 : 0) : gorraExistente.destacada,
      stock: stock !== undefined ? parseInt(stock, 10) : gorraExistente.stock
    });

    res.json(result);
  } catch (err) {
    console.error('Error al actualizar gorra:', err);
    res.status(500).json({ error: 'Error al actualizar la gorra.' });
  }
};

export const deleteGorra = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await CapModel.delete(id);
    res.json({ message: 'Gorra eliminada con éxito', result });
  } catch (err) {
    console.error('Error al eliminar gorra:', err);
    res.status(500).json({ error: 'Error al eliminar la gorra.' });
  }
};

export const getMetadata = async (req, res) => {
  try {
    const meta = await CapModel.getMetadata();
    res.json(meta);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener metadatos de filtros.' });
  }
};
