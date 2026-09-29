# HỆ SINH THÁI SỐ DI SẢN MÊ LINH – Me Linh Digital Heritage Ecosystem

## 1. Kiến Trúc Hệ Thống (System Architecture)
- **Frontend SPA**: React 19 + TypeScript + Vite + Tailwind CSS v4 (Responsive đa thiết bị: Desktop Windows/Mac, Máy tính bảng iPad/Android Tablet, Điện thoại Android & iPhone).
- **Backend API & Full-Stack Server**: Node.js + Express (`server.ts`) tích hợp Gemini AI (`@google/genai`), đồng bộ cơ sở dữ liệu JSON bền vững (`data/heritage-production-db.json`) và Google Cloud Firestore (`ai-studio-mlinhsmartherita-e1fdf220-ee5d-4f76-b79c-e38912e33edf`).
- **Xác thực & Phân quyền 4 Cổng (RBAC)**:
  1. **Khách tham quan (Visitor)**: Không cần tài khoản và mật khẩu — đăng ký đặt tour trực tuyến nhận mã đoàn `ML-2026-...` hoặc vào tham quan tự do ngay.
  2. **Học sinh (Student)**: Đăng ký / Đăng nhập nhanh chỉ bằng **Họ và tên + Trường học + Lớp học**.
  3. **Giáo viên (Teacher)**: Tài khoản riêng (Email + Mật khẩu / Google OAuth) để quản lý lớp, giao nhiệm vụ, chấm điểm và xuất báo cáo CSV.
  4. **Quản trị viên (Master Admin)**: Tài khoản mặc định duy nhất `nguyenquang1992vka@gmail.com` (Mật khẩu: `Quang1992@`). Không ai khác có quyền đăng ký hoặc chỉnh sửa hệ thống.

## 2. Cấu Trúc Thư Mục Dự Án
```text
├── data/
│   └── heritage-production-db.json     # Cơ sở dữ liệu bền vững phía Server
├── src/
│   ├── assets/images/                  # Tư liệu ảnh & âm thanh thực tế Đền Hai Bà Trưng
│   ├── components/
│   │   ├── LoginScreen.tsx             # 4 Cổng truy cập (Học sinh, Giáo viên, Admin, Khách tham quan)
│   │   ├── Header.tsx                  # Thanh điều hướng đa thiết bị & Hồ sơ người dùng
│   │   ├── StudentDashboard.tsx        # Cổng Học sinh (Hồ sơ, Bản đồ, 3D, Video, Quiz, Nhiệm vụ, BXH)
│   │   ├── TeacherDashboard.tsx        # Cổng Giáo viên (Quản lý lớp, Giao nhiệm vụ, Xem điểm, Xuất CSV)
│   │   ├── AdminDashboard.tsx          # Trung tâm Quản trị Hệ thống (Dành riêng cho Master Admin)
│   │   ├── TeacherContentCenter.tsx    # Trung tâm Biên tập Di tích & Nội dung (Master Admin)
│   │   ├── VisitorRegistrationPortal.tsx # Cổng Đặt Tour Tham quan Trực tuyến (Không cần mật khẩu)
│   │   ├── DenHaiBaTrungDetailPage.tsx # Chi tiết 12 điểm di tích Đền Hai Bà Trưng (Hồ Bán Nguyệt...)
│   │   ├── InteractiveMap.tsx          # Bản đồ số 360° & Định vị GPS
│   │   ├── ArtifactsGallery.tsx        # Bảo tàng Hiện vật Số 3D
│   │   ├── HeritageQuizModal.tsx       # Đấu trường Quiz Tương tác nhận XP & Huy hiệu
│   │   ├── BadgePassport.tsx           # Hộ chiếu Di sản & Giấy chứng nhận
│   │   └── AIChatBot.tsx               # Trợ lý Di sản AI hướng dẫn thuyết minh
│   ├── services/
│   │   └── heritageDatabase.ts         # Đồng bộ thời gian thực Firestore + REST API
│   ├── firebase.ts                     # Khởi tạo Firebase Auth, Firestore & Storage
│   ├── types.ts                        # Định nghĩa TypeScript Schema toàn hệ thống
│   └── App.tsx                         # Điều phối trung tâm & RBAC
├── firebase-blueprint.json             # Sơ đồ cấu trúc thực thể Firestore
├── firestore.rules                     # Quy tắc bảo mật Cloud Firestore
├── server.ts                           # Máy chủ Express + API + Gemini AI
└── package.json
```

## 3. Hướng Dẫn Chạy Local (Windows / macOS / Linux)
```bash
# 1. Cài đặt dependencies
npm install

# 2. Cấu hình biến môi trường (.env)
cp .env.example .env
# Điền GEMINI_API_KEY vào file .env

# 3. Khởi chạy ứng dụng Full-Stack (Port 3000)
npm run dev
```

## 4. Hướng Dẫn Triển Khai Thực Tế (Firebase Hosting / Cloud Run / Vercel)
```bash
# Build bản Production tối ưu
npm run build

# Khởi chạy Production Server
npm run start
```
- **Link truy cập ứng dụng đang chạy thật**:
  - **Shared Production URL**: `https://ais-pre-g5awhzgsyhvanyu5a6wage-524482195153.asia-southeast1.run.app`
  - **Development App URL**: `https://ais-dev-g5awhzgsyhvanyu5a6wage-524482195153.asia-southeast1.run.app`
