# DA LAT TRIP 2026

Website lịch trình Đà Lạt 12–15/12/2026 cho 6 người. HTML5, CSS3, Vanilla JavaScript ES Modules; không framework, npm hoặc build step. Chạy trên GitHub Pages tại `/da-lat-trip/`.

## Chạy local

ES Modules cần HTTP server, không mở bằng `file://`:

```sh
python3 -m http.server 8000
```

Mở [localhost:8000](http://localhost:8000). Python chỉ phục vụ file tĩnh để xem local, không phải backend của website.

## Chức năng

- Hero, overview, timeline 4 ngày, gallery, food guide, route Google Maps, outfit và checklist cá nhân.
- Tabs ngày, lọc optional/backup, tìm kiếm và lọc catalog, chi tiết địa điểm.
- Bật **Chỉnh sửa** để thêm/sửa/xóa hoạt động, đổi nhà hàng, đổi ngày và di chuyển lên/xuống.
- Thêm/sửa địa điểm hoặc quán; **+ Vào lịch** có thể dùng cùng địa điểm cho nhiều ngày. Tên/địa chỉ catalog dùng chung.
- Form hoạt động có thể tạo nhanh địa điểm. Địa điểm được lưu trước; nếu lưu hoạt động thất bại, địa điểm vẫn còn trong catalog để chọn lại.
- Ghi chú chung, outfit, thông tin xe có thể sửa. Checklist và hoàn thành hoạt động chỉ lưu riêng từng trình duyệt.
- Xuất/nhập JSON với schema validation, khôi phục local về seed có xác nhận.
- Local Mode mặc định: dữ liệu riêng từng trình duyệt, không đồng bộ qua link chia sẻ.
- Cloud Mode khi tự cấu hình Firebase: realtime, revision conflict, xác nhận lưu từ máy chủ, seed cloud trống và backup/restore.

## Cấu trúc

```text
index.html                     Semantic layout
css/styles.css                 Theme, responsive, reduced motion
js/app.js                      Render, forms, filters, interactions
js/data/seed.js                Lịch, catalog, ghi chú ban đầu
js/data/schema.js              Kiểm tra record và backup JSON
js/data/images.js              Ảnh có nguồn và giấy phép
js/firebase-config.js          Firebase Web Config template (disabled mặc định)
js/storage/local.js            localStorage, revision, cross-tab updates
js/storage/firestore.js        Transactions và realtime listeners
js/storage/repository.js       Chọn adapter, không tự fallback từ cloud sang local
assets/favicon.svg
assets/spots/                  Ảnh local có thể thêm sau
tests/verify.mjs                Kiểm tra dữ liệu và local adapter
firebase/firestore.rules        Collaborative, giới hạn path và schema
firebase/firestore.readonly.rules
FIREBASE_SETUP.md               Setup, backup/restore, read-only
```

## Firebase Spark

Làm theo [FIREBASE_SETUP.md](FIREBASE_SETUP.md). Dùng project riêng, Firestore Standard, Spark. Không cần Authentication, Functions, Storage hoặc service account. Mặc định `enabled: false`; code không tuyên bố cloud đang hoạt động khi chưa cấu hình.

Public write cho phép cả người ngoài sửa dữ liệu nếu biết endpoint. Rules giới hạn path và dữ liệu, không kiểm soát thành viên nhóm hay ngăn hoàn toàn spam/quota. Không lưu thông tin nhạy cảm.

## GitHub Pages

1. Sau khi tự review, đưa mã lên nhánh đang được Pages sử dụng. Agent không commit/push.
2. **Settings → Pages → Deploy from a branch** → nhánh chứa mã → **/ (root)** → **Save**.
3. Chờ deployment hoàn tất. Mở [nad27298.github.io/da-lat-trip](https://nad27298.github.io/da-lat-trip/).

Giữ các thư mục cạnh `index.html`. Đường dẫn CSS/JS/assets đều tương đối. `.nojekyll` bỏ qua Jekyll; không có bước build.

## Sau chuyến đi

Xuất bản sao cloud, publish `firebase/firestore.readonly.rules` trong Firebase Console, rồi đặt `readOnly: true` trong `js/firebase-config.js` và tự deploy cập nhật UI. Chi tiết từng bước ở [FIREBASE_SETUP.md](FIREBASE_SETUP.md). Ngày 15/12 qua đi không tự đổi rules.

## Dữ liệu và ảnh

Lịch là bản nháp từ brief. Chưa xác minh giờ mở cửa, giá, thời gian hạ cánh, xe và nhiều địa chỉ quán. Khung tham quan hồ không phải dự báo hoàng hôn. Không có tọa độ đoán hoặc marker giả; route dùng Google Maps Search/Directions và cần kiểm tra cơ sở thật.

Ảnh mặc định gồm Hồ Tuyền Lâm, ga Đà Lạt, Hồ Xuân Hương, đồi chè Cầu Đất, chùa Linh Phước, Thiền viện Trúc Lâm, chợ đêm và Thung lũng Tình Yêu. Ảnh Wikimedia Commons được ghi nguồn/tác giả/giấy phép trong `js/data/images.js`, hiển thị credit hero và trong chi tiết địa điểm. Không có ảnh phù hợp sẽ hiển thị gradient có nhãn; không dùng ảnh nơi khác gán cho quán. Ảnh bên ngoài cần mạng; font có system/Georgia fallback. Khi thêm ảnh local cần bảo đảm quyền sử dụng và ghi credit.

## Giới hạn vận hành

- localStorage phụ thuộc quyền và dung lượng trình duyệt. Sao lưu JSON trước khi xóa dữ liệu trình duyệt.
- Cloud cần Web Config và rules do chủ project tự triển khai. Không có private credential trong frontend.
- Khi xung đột, form giữ nội dung nhưng không ghi đè: đóng/mở lại để xem revision mới rồi áp dụng chỉnh sửa.
- Khi offline, cloud không nhận lưu mới; form giữ nội dung để thử lại. Không có hàng đợi offline tự động.
- Import cloud thay thế toàn bộ dữ liệu và yêu cầu hai bước xác nhận. Giới hạn 400 tổng document cũ+mới cho một restore nguyên tử; thích hợp chuyến đi nhỏ.
- Seed cloud chỉ dùng bản seed trong source khi cloud trống; localStorage không tự tải lên cloud.
- Không có thư viện map, dependency animation hay analytics. Firebase SDK tải từ CDN chính thức chỉ trong Cloud Mode.

## Kiểm tra kỹ thuật

Không cần cài dependency. Với Node 22+ có thể chạy:

```sh
node tests/verify.mjs
```

Kiểm tra seed/schema, local CRUD, conflict, refresh, JSON roundtrip, lỗi quota và đường dẫn tương đối. Không thay thế kiểm thử trình duyệt hoặc Firestore thực.

Kết quả và giới hạn kiểm thử thực tế: [VERIFICATION.md](VERIFICATION.md).

## Cache busting khi cập nhật GitHub Pages

CSS, JavaScript entry point và toàn bộ import module nội bộ (kể cả dynamic import Firestore) dùng cùng query `?v=<version>`. Query của entry point không tự truyền xuống các ES Modules, nên import nội bộ cũng cần version. Firebase SDK CDN đã có phiên bản cố định trong URL và được giữ nguyên.

Mỗi lần phát hành thay đổi CSS/JS hoặc Firebase config, chạy từ thư mục project:

```sh
python3 scripts/bump-version.py
```

Script tự tăng hậu tố version hiện tại (ví dụ `20261116-1` → `20261116-2`) và đồng bộ CSS, JavaScript entry point cùng mọi import/export module nội bộ trong `js/`, kể cả dynamic import dùng chuỗi literal. Import nội bộ mới chưa có query cũng được bổ sung. URL CDN bên ngoài được giữ nguyên.

Có thể chỉ định version:

```sh
python3 scripts/bump-version.py 20261212-1
```

Script dùng thư viện chuẩn Python 3, tìm project theo vị trí script nên cũng chạy được từ thư mục khác qua đường dẫn tuyệt đối. Không cần npm/build step, không tạo Service Worker, không commit/push. Với import động tính URL bằng biểu thức, cần tự đưa version vào URL; script chỉ xử lý module specifier là chuỗi literal. Chạy script sau khi sửa code và trước khi tự commit/push; cùng bản phát hành vẫn tận dụng cache. Các đường dẫn giữ tương đối, tương thích `/da-lat-trip/`.
