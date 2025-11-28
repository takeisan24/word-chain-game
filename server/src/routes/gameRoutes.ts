import { Router } from 'express';
import { checkWord, botTurn } from '../controllers/gameController';

const router = Router();

// Định nghĩa 2 đường dẫn chính
// POST http://localhost:5000/api/game/check
router.post('/check', checkWord);

// POST http://localhost:5000/api/game/bot-answer
router.post('/bot-answer', botTurn);

export default router;