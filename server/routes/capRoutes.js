import express from 'express';
import { getGorras, getGorraById, createGorra, updateGorra, deleteGorra, getMetadata, exportBackup, importBackup, purgeDemo } from '../controllers/capController.js';

const router = express.Router();

router.get('/export', exportBackup);
router.post('/import', importBackup);
router.delete('/purge-demo', purgeDemo);
router.get('/', getGorras);
router.get('/metadata', getMetadata);
router.get('/:id', getGorraById);
router.post('/', createGorra);
router.put('/:id', updateGorra);
router.delete('/:id', deleteGorra);

export default router;
