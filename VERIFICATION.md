# Verification — 16/11/2026

## Đã chạy

- `node tests/verify.mjs`: PASS. Seed 31 activities / 22 places / 13 restaurants / 10 notes; local thêm/sửa/xóa; từ chối revision cũ; tạo lại adapter sau lưu; export/import roundtrip; reset; từ chối field lạ, ID trùng, reference thiếu; lỗi quota không báo lưu thành công; đường dẫn HTML và ES imports tồn tại.
- JavaScript syntax check với Node; `git diff --check`.
- Trình duyệt in-app trên HTTP local: trang tải Local Mode; đủ 4 ngày; không thấy console error trong log kiểm tra.
- Đổi giờ một bữa sáng, thay sang Mì Quảng Bà Xí, Save thành công, refresh vẫn lưu.
- Tạo địa điểm nhanh từ form activity, lưu vào catalog và gắn timeline; chuyển activity từ ngày 1 sang ngày 3; đổi thứ tự lên; xóa qua confirmation.
- Export JSON từ nút giao diện: file tải xuống; import lại qua file chooser và confirmation: thành công; reset seed local: thành công. Dữ liệu thử đã được reset.
- Filter ngày, ẩn optional (ngày 3 từ 9 xuống 7 mục), tìm “Tuyền Lâm” còn một card, detail modal hiển thị đúng và đóng bằng Escape.
- Desktop 1440×960 và mobile viewport 390×844: kiểm tra hero, timeline, form, trạng thái và không có horizontal overflow ở viewport mobile được đo.
- Hero Hồ Tuyền Lâm tải thành công, có credit; ảnh ngoài viewport lazy load; phần chưa có ảnh dùng gradient ghi rõ. Error handler thay ảnh lỗi bằng fallback.
- Kiểm tra source Firestore Rules: path cố định, default deny, allowed fields, kiểu/độ dài/mảng/tọa độ/revision; collaborative + read-only.

## Chưa xác minh thực tế

- Chưa có Firebase project/config nên chưa kiểm tra realtime hai thiết bị, transaction trên máy chủ, offline khi request đang chạy, hoặc permission thật.
- Firebase CLI/emulator không có trong môi trường; chưa chạy emulator/Rules Playground. Source review không chứng minh rules compile hoặc vận hành đúng; cần kiểm tra theo FIREBASE_SETUP.md trước khi dùng cloud.
- Viewport mobile là kiểm tra responsive trong trình duyệt in-app, không phải kiểm thử trên iPhone/Safari iOS thật.
- Chưa kiểm tra mọi link Maps dẫn tới đúng cơ sở; nhiều cơ sở/địa chỉ chưa chốt theo brief. Không đặt marker hoặc đoán tọa độ.
- Chỉ có 3 ảnh địa danh có nguồn trong catalog ảnh; nhiều địa điểm/quán còn placeholder. Không khẳng định đã có ảnh đầy đủ.
- Chưa chạy trên bản GitHub Pages mới vì chưa commit/push theo yêu cầu. Đã kiểm tra path tương đối ở source và HTTP local; cần tự deploy để kiểm tra bản public.

## Lệnh kiểm tra lại

```sh
node tests/verify.mjs
python3 -m http.server 8000
```

Mở http://localhost:8000. Không cần npm/build. Node 22+ với ES module syntax detection để chạy script kiểm tra.
