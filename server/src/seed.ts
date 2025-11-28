import mongoose from 'mongoose';
import axios from 'axios';
import Word from './models/Word';

// Kết nối Localhost
const MONGO_URI = 'mongodb://127.0.0.1:27017/wordchain_game';

// Link RAW chuẩn cho file tudien.txt (đã chỉnh lại cho đúng định dạng GitHub Raw)
const URL_VN = 'https://raw.githubusercontent.com/NNBnh/noi-tu/main/words/words.txt';
// Link Tiếng Anh (Giữ nguyên)
const URL_EN = 'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt';

const seedData = async () => {
  try {
    // 1. Kết nối DB
    await mongoose.connect(MONGO_URI);
    console.log('🔌 Đã kết nối DB. Đang xóa dữ liệu cũ...');
    await Word.deleteMany({}); // Xóa sạch bảng cũ

    // 2. Xử lý Tiếng Việt (File .txt - Mỗi từ 1 dòng)
    console.log('⬇️  Đang tải từ điển Tiếng Việt mới...');
    const resVN = await axios.get(URL_VN);
    
    // Tách file thành từng dòng
    const linesVN = resVN.data.split('\n');
    
    console.log(`⏳ Đang xử lý ${linesVN.length} dòng dữ liệu...`);
    const bulkVN = [];
    const seenVN = new Set<string>(); // Dùng Set để lọc trùng

    for (const line of linesVN) {
      // 1. Làm sạch dòng: Xóa khoảng trắng thừa, chuyển chữ thường
      let cleanWord = line.trim().toLowerCase();
      
      // (Phòng hờ) Nếu dòng có chứa định nghĩa (VD: "mèo : con vật..."), ta chỉ lấy phần từ vựng trước dấu :
      if (cleanWord.includes(':')) {
        cleanWord = cleanWord.split(':')[0].trim();
      }

      if (!cleanWord) continue;

      // 2. Logic lọc: 
      // - Thay dấu gạch dưới _ thành dấu cách (nếu có)
      cleanWord = cleanWord.replace(/_/g, ' ');
      
      const parts = cleanWord.split(' ');

      // CHỈ LẤY TỪ 2 ÂM TIẾT (VD: "con mèo")
      if (parts.length === 2 && !seenVN.has(cleanWord)) {
        seenVN.add(cleanWord); // Đánh dấu đã có

        const startKey = parts[0]; // Lấy tiếng đầu (VD: "con")
        
        bulkVN.push({
          insertOne: {
            document: { 
              text: cleanWord, 
              lang: 'vn', 
              startKey: startKey 
            }
          }
        });
      }
    }
    
    // Ghi vào Database
    if (bulkVN.length > 0) {
        // Chia nhỏ ra để ghi nếu dữ liệu quá lớn (tùy chọn), nhưng với 70k từ thì ghi 1 lần vẫn OK
        await Word.bulkWrite(bulkVN);
        console.log(`✅ Đã nạp thành công ${bulkVN.length} từ Tiếng Việt (2 âm tiết).`);
    } else {
        console.log('⚠️ Không tìm thấy từ nào thỏa mãn điều kiện (Có thể do lỗi định dạng file hoặc link hỏng).');
    }

    // 3. Xử lý Tiếng Anh (Như cũ)
    console.log('⬇️  Đang tải từ điển Tiếng Anh...');
    const resEN = await axios.get(URL_EN);
    const wordsEN = resEN.data.split('\n');

    console.log(`⏳ Đang xử lý dữ liệu Tiếng Anh...`);
    const shortListEN = wordsEN.slice(0, 20000); 
    const bulkEN = [];
    const seenEN = new Set<string>();

    for (const w of shortListEN) {
        const cleanWord = w.trim().toLowerCase();
        if(cleanWord.length > 1 && !seenEN.has(cleanWord)) { 
            seenEN.add(cleanWord);
            bulkEN.push({
                insertOne: {
                    document: { 
                        text: cleanWord, 
                        lang: 'en', 
                        startKey: cleanWord.charAt(0) 
                    }
                }
            });
        }
    }

    if (bulkEN.length > 0) await Word.bulkWrite(bulkEN);
    console.log(`✅ Đã nạp thành công ${bulkEN.length} từ Tiếng Anh.`);

    console.log('🎉 HOÀN TẤT! Database mới đã sẵn sàng.');
    process.exit();
  } catch (error) {
    console.error('❌ Có lỗi xảy ra:', error);
    console.log('💡 Gợi ý: Hãy kiểm tra lại đường truyền mạng hoặc link raw GitHub.');
    process.exit(1);
  }
};

seedData();