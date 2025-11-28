import mongoose from 'mongoose';

// Định nghĩa cấu trúc của 1 từ
const WordSchema = new mongoose.Schema({
  text: { 
    type: String, 
    required: true, 
    unique: true // Không được trùng nhau
  },
  lang: { 
    type: String, 
    required: true, 
    enum: ['vn', 'en'] // Chỉ chấp nhận 'vn' hoặc 'en'
  },
  startKey: { type: String, required: true, index: true } // Key để tìm từ nối tiếp
});

// Xuất ra để dùng ở chỗ khác
export default mongoose.model('Word', WordSchema);