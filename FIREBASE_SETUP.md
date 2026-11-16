# Firebase Spark cho DA LAT TRIP 2026

Website chạy đầy đủ trong **Local Mode** khi `enabled: false` ở `js/firebase-config.js`. Dữ liệu chỉ nằm trong localStorage của trình duyệt đó, không đồng bộ sang thiết bị khác. Hãy export JSON trước khi đổi chế độ hoặc xóa dữ liệu trình duyệt.

## 1. Tạo project riêng

1. Mở [Firebase Console](https://console.firebase.google.com/), tạo project riêng cho `da-lat-trip` và giữ plan **Spark**. Không cần Analytics, billing, Storage, Functions hay Authentication.
2. Trong **Build → Firestore Database**, tạo database **Standard**, database ID `(default)`. Chọn region phù hợp trước khi tạo; không chọn test mode mở toàn database.
3. Vào **Project settings → General → Your apps**, đăng ký một Web App. Chỉ lấy **Firebase Web Config** thông thường.
4. Mở `js/firebase-config.js`, điền `apiKey`, `authDomain`, `projectId`, `appId` và đặt `enabled: true`. Giữ `readOnly: false` trong thời gian cộng tác.
5. Không đưa service account JSON, private key, tài khoản, mật khẩu hoặc token quản trị vào repository. Web Config là cấu hình client công khai.

## 2. Publish rules trước khi dùng cloud

1. Trong **Firestore Database → Rules**, thay toàn bộ nội dung bằng `firebase/firestore.rules`.
2. Bấm **Publish**. Rules này chỉ mở read/write cho bốn collection `trips/da-lat-2026/activities`, `places`, `restaurants`, `notes` và document phối hợp `trips/da-lat-2026/control/state`. Mọi path khác bị deny mặc định.
3. Rules kiểm tra allowed fields, kiểu dữ liệu, ID, độ dài chuỗi, số lượng phần tử mảng, tọa độ nếu có và revision. Đây không phải cơ chế xác thực sáu thành viên.
4. Dùng **Rules Playground** kiểm tra: đọc path trip được phép; đọc/ghi `/users/test` bị từ chối; record thiếu trường hoặc field lạ bị từ chối; ghi activity đúng schema nhưng không tăng control revision cùng transaction bị từ chối.

**Public write** nghĩa là bất kỳ ai biết project config cũng có thể sửa/xóa dữ liệu hợp lệ, kể cả ngoài nhóm. Rules giới hạn phạm vi và schema, không ngăn hoàn toàn spam hoặc tiêu hao quota. Không lưu thông tin nhạy cảm. Theo dõi Usage trong Firebase Console.

## 3. Khởi tạo cloud an toàn

1. Đưa file cấu hình đã điền lên GitHub Pages bằng quy trình Git của bạn, rồi mở website qua HTTPS.
2. Website hiển thị **Cloud Mode** và đợi đủ bốn collection từ máy chủ. Không tự lấy localStorage đè cloud và không tự seed.
3. Nếu cloud trống, dùng **Khởi tạo cloud**. Thao tác chỉ dùng seed gốc và chỉ chạy khi cả bốn collection đều trống. Nếu cloud đã có dữ liệu, thao tác bị từ chối.
4. Muốn chuyển bản Local đã chỉnh sang cloud: export JSON trong Local Mode trước; cấu hình Cloud Mode; export cloud nếu đang có dữ liệu; sau đó Import JSON và xác nhận khôi phục.
5. Mở bằng hai trình duyệt/thiết bị. Sửa một activity, chờ trạng thái đã lưu ở thiết bị đầu, kiểm tra thiết bị sau nhận cập nhật và refresh vẫn giữ dữ liệu.

## 4. Đồng bộ và xung đột

- Mỗi activity/place/restaurant/note là một document, không lưu toàn lịch thành document lớn.
- Form giữ revision khi mở. Transaction kiểm tra revision trước khi lưu/xóa. Nếu người khác đã sửa, thao tác báo xung đột; đóng form, xem nội dung mới và mở lại để sửa.
- Mỗi write tăng document `control/state` trong cùng transaction. Document này chỉ chứa revision và cờ initialized; nó giúp seed/import toàn bộ không ghi đè thay đổi xảy ra đồng thời. Tradeoff: các write có thể tranh chấp revision chung, phù hợp nhóm nhỏ, không dành cho tải lớn.
- Chỉ thông báo lưu thành công sau khi transaction được Firestore xác nhận. Không âm thầm chuyển Local Mode nếu cấu hình/kết nối cloud bị lỗi.
- Nếu đã offline trước khi Save, không gửi và giữ form để bạn thử lại. Nếu mất mạng trong khi thao tác đang chạy, trạng thái báo đang chờ; không coi đó là lưu thành công. Transaction có thể thất bại, cần thử lại khi mạng ổn định.
- Listener dùng dữ liệu từ máy chủ để khởi tạo; khi mất mạng, nội dung đã hiển thị có thể cũ. Không có hàng đợi chỉnh sửa offline tự động.

## 5. Backup và khôi phục

- **Export JSON** ở Local Mode xuất bản local; Cloud Mode đọc lại cả bốn collection từ máy chủ. Nếu cloud thay đổi trong lúc export, thao tác yêu cầu thử lại để không đưa ra backup không nhất quán.
- Giữ nhiều bản JSON trên máy riêng, đặt tên theo thời gian. Không có history cloud tự tăng.
- Import kiểm tra schema và tham chiếu trước khi ghi. Import cloud là **thay thế toàn bộ bốn collection**: record không có trong file sẽ bị xóa. Export bản hiện tại trước, đọc cảnh báo và xác nhận bổ sung trên website.
- Khôi phục cloud chạy nguyên tử: thành công toàn bộ hoặc không ghi gì. Nếu có người sửa trong lúc chuẩn bị khôi phục, thao tác báo conflict. Dừng chỉnh sửa nhóm rồi thử lại.
- Giới hạn khôi phục: tổng số document hiện có cộng số document trong file không quá **400**; vượt giới hạn sẽ bị từ chối trước khi ghi. Không chia thành nhiều batch có nguy cơ khôi phục dở dang.
- **Reset local về seed** chỉ áp dụng Local Mode, cần xác nhận; không reset cloud. Muốn cloud về seed, xuất seed từ Local Mode sạch rồi import với các xác nhận khôi phục.

## 6. Chuyển chỉ đọc sau 15/12/2026

1. Export bản cloud cuối cùng.
2. Mở **Firestore Database → Rules** trong Firebase Console.
3. Thay toàn bộ rules bằng `firebase/firestore.readonly.rules` và bấm **Publish**.
4. Trong `js/firebase-config.js`, đặt `readOnly: true` và cập nhật file trên GitHub Pages để giao diện thể hiện chỉ đọc.
5. Kiểm tra từ trình duyệt khác: vẫn xem được lịch, mọi ghi/xóa đều bị rules từ chối, kể cả frontend cũ chưa reload.

Rules **không tự đổi theo ngày**. Bước Publish rules là thao tác quyết định quyền ghi; cờ frontend chỉ điều chỉnh trải nghiệm. Muốn mở lại cộng tác, publish rules collaborative và đặt `readOnly: false`.

## 7. Giới hạn kiểm chứng

Code tích hợp và hai bộ rules được chuẩn bị cho cấu hình này. Chưa có project Firebase thật nên không thể xác nhận realtime, quota, region, permission và kết nối thực tế. Hãy chạy Rules Playground hoặc Firebase Emulator và kiểm tra hai thiết bị trước khi dùng dữ liệu quan trọng. Firestore SDK được tải từ CDN Firebase, chỉ được tải khi bật Cloud Mode.

Tài liệu chính thức: [Transactions](https://firebase.google.com/docs/firestore/manage-data/transactions), [Security Rules fields](https://firebase.google.com/docs/firestore/security/rules-fields), [Realtime listeners](https://firebase.google.com/docs/firestore/query-data/listen).
