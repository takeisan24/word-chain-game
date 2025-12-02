import { Request, Response } from 'express';
import Word from '../models/Word';

// 1. GET: Tra cứu thông tin một từ
export const getWordInfo = async (req: Request, res: Response): Promise<void> => {
  try {

    const text = req.params['text']; 
    
    if (!text) {
        res.status(400).json({ found: false, message: 'Thiếu từ khóa cần tra cứu' });
        return;
    }

    const word = await Word.findOne({ text: text.toLowerCase() });

    if (word) {
      res.status(200).json({ found: true, data: word });
    } else {
      res.status(404).json({ found: false, message: 'Từ này chưa có trong từ điển' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Lỗi Server' });
  }
};

// 2. POST: Thêm từ mới
export const addWord = async (req: Request, res: Response): Promise<void> => {
  try {

    const { text, lang } = req.body;
    
    if (!text || !lang) {
        res.status(400).json({ success: false, message: 'Thiếu thông tin text hoặc lang' });
        return;
    }

    const cleanText = (text as string).trim().toLowerCase();

    // Logic tách startKey
    let startKey = '';
    if (lang === 'en') startKey = cleanText.charAt(0);
    else startKey = cleanText.split(' ')[0] || '';

    // Tạo từ mới
    const newWord = new Word({ text: cleanText, lang, startKey });
    await newWord.save();

    res.status(201).json({ success: true, message: `Đã thêm từ "${cleanText}" thành công!` });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'Từ này đã tồn tại rồi!' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// 3. PUT: Sửa từ (Hoặc Thêm nếu chưa có - Upsert)
export const upsertWord = async (req: Request, res: Response): Promise<void> => {
  try {
    // FIX: Dùng ngoặc vuông ['text']
    const text = req.params['text']; 
    const { lang } = req.body;
    
    if (!text || !lang) {
        res.status(400).json({ success: false, message: 'Thiếu thông tin' });
        return;
    }
    
    const cleanText = text.trim().toLowerCase();
    
    let startKey = '';
    if (lang === 'en') startKey = cleanText.charAt(0);
    else startKey = cleanText.split(' ')[0] || '';

    const result = await Word.findOneAndUpdate(
      { text: cleanText },          
      { text: cleanText, lang, startKey }, 
      { new: true, upsert: true }   
    );

    res.status(200).json({ 
      success: true, 
      message: `Đã cập nhật/thêm từ "${cleanText}" vào từ điển.`,
      data: result 
    });

  } catch (error) {
    res.status(500).json({ error: 'Lỗi Server' });
  }
};

// 4. DELETE: Xóa từ sai
export const deleteWord = async (req: Request, res: Response): Promise<void> => {
  try {
    // FIX: Dùng ngoặc vuông ['text']
    const text = req.params['text'];
    
    if (!text) {
        res.status(400).json({ success: false, message: 'Thiếu từ cần xóa' });
        return;
    }

    const deleted = await Word.findOneAndDelete({ text: text.toLowerCase() });

    if (deleted) {
      res.status(200).json({ success: true, message: `Đã xóa từ "${text}" khỏi từ điển.` });
    } else {
      res.status(404).json({ success: false, message: 'Không tìm thấy từ để xóa.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Lỗi Server' });
  }
};