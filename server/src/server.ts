import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv'; // Import thư viện đọc file .env
import gameRoutes from './routes/gameRoutes';
import wordRoutes from './routes/wordRoutes';

// Kích hoạt dotenv ngay dòng đầu
dotenv.config(); 

const app = express();
app.use(cors());
app.use(express.json());

// Lấy thông tin từ file .env (Nếu không có thì dùng giá trị mặc định sau dấu ||)
const PORT = Number(process.env['PORT']) || 5000;
const MONGO_URI = process.env['MONGO_URI'];

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in .env file');
  process.exit(1);
}

// Kết nối MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Đăng ký Routes
app.use('/api/game', gameRoutes);
app.use('/api/dict', wordRoutes);

app.get('/', (req, res) => {
  res.send('Word Chain API is ready!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});