import { Router } from 'express';
import { getWordInfo, addWord, deleteWord, upsertWord } from '../controllers/wordController';

const router = Router();

// GET: Tra cứu
router.get('/:text', getWordInfo);

// POST: Thêm mới
router.post('/', addWord);

// PUT: Sửa hoặc Thêm
router.put('/:text', upsertWord);

// DELETE: Xóa
router.delete('/:text', deleteWord);

export default router;