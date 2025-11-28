# 🎮 Word Chain Game (Game Nối Từ) - PvE Project

> **Bài tập lớn môn:** Lập trình API  
> **Sinh viên thực hiện:** Vu Tuan Anh  
> **Mã sinh viên:** 221230744

---

## 📖 Giới thiệu (Overview)

**Word Chain Game** là một ứng dụng web Full-stack cho phép người chơi đấu trí nối từ với Máy (Bot) theo thời gian thực. Dự án được xây dựng nhằm minh họa việc thiết kế và triển khai hệ thống **RESTful API** chuẩn mực, kết hợp với cơ sở dữ liệu NoSQL hiệu năng cao.

Dự án không chỉ dừng lại ở logic game thông thường mà còn tích hợp các thuật toán xử lý ngôn ngữ tự nhiên cơ bản và hệ thống quản trị dữ liệu (CRUD).

![Tech Stack Badge](https://img.shields.io/badge/Stack-MERN-blue)
![License Badge](https://img.shields.io/badge/License-MIT-green)

---

## 🌟 Tính năng nổi bật (Key Features)

### 1. Gameplay Thông Minh (PvE)
- **Cơ chế Nối từ Đa ngôn ngữ:** Hỗ trợ cả Tiếng Việt (nối theo từ: *con mèo -> mèo mun*) và Tiếng Anh (nối theo ký tự: *apple -> elephant*).
- **Bot Tự động:** Bot có khả năng phản xạ tức thì, tự động tìm từ trong kho dữ liệu để đáp trả.
- **Anti-Duplicate (Chống lặp):** Hệ thống ghi nhớ các từ đã đánh trong ván, ngăn chặn việc lặp lại từ cũ để câu giờ.
- **🔥 Checkmate System (Chiếu tướng):**
  - Thuật toán tự động rà soát toàn bộ nước đi khả thi tiếp theo.
  - Tuyên bố **THẮNG/THUA ngay lập tức** nếu một bên bị dồn vào thế bí (không còn từ nào trong từ điển để nối).

### 2. Hệ thống Quản trị Từ điển (Dictionary CMS)
Cung cấp bộ công cụ CRUD đầy đủ để quản lý kho dữ liệu ngay trên giao diện:
- **Read (Tra cứu):** Kiểm tra sự tồn tại và thông tin chi tiết của một từ (Method `GET`).
- **Create (Thêm mới):** Nạp thêm từ vựng thủ công vào hệ thống (Method `POST`).
- **Update (Sửa/Upsert):** Cơ chế "Thêm nhanh" khi chơi thua do thiếu từ, hoặc sửa lỗi chính tả (Method `PUT`).
- **Delete (Xóa):** Loại bỏ rác dữ liệu hoặc từ sai (Method `DELETE`).

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### Backend (Server)
- **Core:** Node.js, Express.js.
- **Language:** TypeScript (Type-safe).
- **Database:** MongoDB (Sử dụng Mongoose ODM để mô hình hóa dữ liệu).
- **Tools:** Axios (Data crawling), Nodemon.

### Frontend (Client)
- **Framework:** Next.js 14 (App Router).
- **Styling:** Tailwind CSS (Responsive Design).
- **HTTP Client:** Axios.

---

## 🚀 Hướng dẫn Cài đặt & Chạy (Installation)

Yêu cầu tiên quyết: Máy tính đã cài đặt **Node.js** và **MongoDB**.

### Bước 1: Khởi chạy Backend
Mở một cửa sổ Terminal mới:
`cd server`

## 1. Cài đặt các gói thư viện
`npm install`

## 2. Nạp dữ liệu mẫu (Seed Data)
Script sẽ tự động tải ~40.000 từ chuẩn từ Github và làm sạch dữ liệu
`npm run seed`

## 3. Chạy Server (Mặc định: http://localhost:5000)
`npm run dev`

### Bước 2: Khởi chạy Frontend
Mở một cửa sổ Terminal mới:
`cd client`

## 1. Cài đặt thư viện
`npm install`

## 2. Chạy ứng dụng Client (Mặc định: http://localhost:3000)
`npm run dev`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
