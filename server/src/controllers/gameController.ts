import { Request, Response } from 'express';
import Word from '../models/Word';

// Hàm phụ trợ: Lấy key nối từ
const getLinkingKey = (text: string, lang: 'vn' | 'en'): string => {
  const cleanText = text.trim().toLowerCase();
  if (lang === 'en') {
    return cleanText.slice(-1); 
  } else {
    const parts = cleanText.split(' ');
    return parts[parts.length - 1] || ''; 
  }
};

// Hàm phụ trợ MỚI: Kiểm tra xem còn đường đi tiếp không
// Trả về true nếu CÒN từ để nối, false nếu HẾT từ (End Game)
const checkIfNextMovePossible = async (lastWord: string, lang: string, usedWords: string[]): Promise<boolean> => {
  const nextStartKey = getLinkingKey(lastWord, lang as 'vn' | 'en');
  
  // Tìm xem có bất kỳ từ nào:
  // 1. Bắt đầu bằng nextStartKey
  // 2. Chưa bị dùng (nằm ngoài danh sách usedWords)
  const count = await Word.countDocuments({
    startKey: nextStartKey,
    lang: lang,
    text: { $nin: usedWords } // $nin: Not In
  });

  return count > 0;
};

// --- API 1: Người chơi đánh ---
export const checkWord = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentWord, previousWord, lang, usedWords } = req.body;
    const listUsed = Array.isArray(usedWords) ? usedWords : [];

    if (!currentWord || !lang) {
      res.status(400).json({ valid: false, message: 'Thiếu thông tin' });
      return;
    }

    const cleanCurrent = currentWord.trim().toLowerCase();

    // 1. Check trùng
    if (listUsed.includes(cleanCurrent)) {
      res.status(200).json({ valid: false, message: 'Từ này đã được sử dụng rồi!' });
      return;
    }

    // 2. Check từ điển
    const wordFound = await Word.findOne({ text: cleanCurrent, lang });
    if (!wordFound) {
      res.status(200).json({ valid: false, message: 'Từ này không có trong từ điển!' });
      return;
    }

    // 3. Check luật nối từ
    if (previousWord) {
      const requiredStart = getLinkingKey(previousWord, lang);
      let isValid = false;
      if (lang === 'en') isValid = cleanCurrent.startsWith(requiredStart);
      else isValid = cleanCurrent.startsWith(requiredStart + ' ');

      if (!isValid) {
        res.status(200).json({ valid: false, message: `Sai luật! Phải bắt đầu bằng "${requiredStart}"` });
        return;
      }
    }

    // 4. --- LOGIC MỚI: CHECK MATE (Kiểm tra xem Bot có còn đường đỡ không) ---
    // Danh sách đã dùng bao gồm cả từ người chơi vừa đánh
    const newListUsed = [...listUsed, cleanCurrent];
    const canContinue = await checkIfNextMovePossible(cleanCurrent, lang, newListUsed);

    if (!canContinue) {
      // Nếu Bot không còn từ nào để nối -> Người chơi thắng luôn
      res.status(200).json({ 
        valid: true, 
        isEndGame: true, 
        message: 'Tuyệt vời! Bot đã hết đường đỡ. Bạn chiến thắng!' 
      });
    } else {
      // Game tiếp tục
      res.status(200).json({ valid: true, isEndGame: false });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi Server' });
  }
};

// --- API 2: Bot đánh ---
export const botTurn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { previousWord, lang, usedWords } = req.body;
    const listUsed = Array.isArray(usedWords) ? usedWords : [];

    let queryPipeline: any[] = [];

    if (previousWord) {
      const requiredStart = getLinkingKey(previousWord, lang);
      queryPipeline = [
        { $match: { startKey: requiredStart, lang: lang, text: { $nin: listUsed } } },
        { $sample: { size: 1 } }
      ];
    } else {
      queryPipeline = [
        { $match: { lang: lang } },
        { $sample: { size: 1 } }
      ];
    }

    const words = await Word.aggregate(queryPipeline);

    if (words.length > 0) {
      const botWord = words[0].text;
      
      // 5. --- LOGIC MỚI: CHECK MATE (Kiểm tra xem Người chơi còn đường đỡ không) ---
      const newListUsed = [...listUsed, botWord];
      const canContinue = await checkIfNextMovePossible(botWord, lang, newListUsed);

      if (!canContinue) {
        // Người chơi hết đường đỡ -> Bot thắng
        res.status(200).json({ 
          success: true, 
          word: botWord, 
          isEndGame: true,
          message: `Bot ra từ: "${botWord}". Bạn hết đường đỡ rồi! Bot thắng.`
        });
      } else {
        // Game tiếp tục
        res.status(200).json({ success: true, word: botWord, isEndGame: false });
      }

    } else {
      res.status(200).json({ success: false, message: 'Bot hết vốn từ! Bạn thắng.' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi Server' });
  }
};