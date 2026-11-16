# Đà Lạt Trip

Bộ khung website du lịch Đà Lạt. Hiện tại trang chỉ hiển thị placeholder **“Đà Lạt, chúng mình tới đây!”**, chưa có giao diện hoặc lịch trình du lịch hoàn chỉnh.

## Công nghệ

- HTML5, CSS3 và Vanilla JavaScript.
- Không sử dụng framework, npm hoặc bước build.
- CSS responsive cơ bản, sử dụng font hệ thống.

## Cấu trúc project

```text
.
├── index.html           # Trang placeholder
├── css/
│   └── styles.css       # Style responsive cơ bản
├── js/
│   └── app.js           # Điểm khởi đầu cho JavaScript
├── assets/
│   ├── favicon.svg      # Biểu tượng website
│   └── spots/
│       └── .gitkeep     # Giữ thư mục ảnh địa điểm trong Git
├── .gitignore
├── .nojekyll            # Phục vụ file tĩnh, bỏ qua xử lý Jekyll
└── README.md
```

## Chạy tại máy

Mở trực tiếp `index.html` trong trình duyệt. Không cần cài dependency.

## Deploy lên GitHub Pages

1. Đưa các file lên nhánh muốn deploy trong repository `nad27298/da-lat-trip`.
2. Vào **Settings → Pages** của repository.
3. Trong **Build and deployment**, chọn **Deploy from a branch**.
4. Chọn nhánh chứa mã nguồn (ví dụ `main`) và thư mục **/ (root)**, sau đó chọn **Save**.
5. Chờ GitHub Pages deploy xong và mở <https://nad27298.github.io/da-lat-trip/>.

CSS, JavaScript và favicon đều dùng đường dẫn tương đối, tương thích với đường dẫn `/da-lat-trip/` trên GitHub Pages. Khi thêm tài nguyên, tiếp tục dùng đường dẫn tương đối, tránh đường dẫn bắt đầu bằng `/`.
