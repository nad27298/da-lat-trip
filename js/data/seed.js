const maps = (name, address = "") => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${address} Đà Lạt`)}`;
const place = (id, name, category, description, priority = "main", address = "", notes = "Cần xác nhận thông tin trước chuyến đi.", tags = []) => ({
  id, revision: 1, name, category, address, description, notes, images: [], imageCredit: "", googleMapsUrl: maps(name, address), latitude: null, longitude: null, priority, tags, verificationStatus: "needs-confirmation", dish: ""
});

export const days = [
  { id: "day-1", number: 1, date: "2026-12-12", title: "Arrival & Da Lat By Night", route: "Hà Nội → Liên Khương → Charlie Mansion → Trung tâm", summary: "Chạm vào cái lạnh, ăn một bữa ấm và dạo phố đêm.", outfit: "Winter city outfit · áo khoác ấm, giày dễ đi." },
  { id: "day-2", number: 2, date: "2026-12-13", title: "Tea Hills & Korean Vibes", route: "Charlie Mansion → Cầu Đất → Trại Mát → Hùng Vương → Trung tâm", summary: "Đồi chè xanh, một chút Hàn Quốc và bữa tối cả nhóm mong chờ.", outfit: "White, cream, pastel, brown · hợp ảnh đồi chè." },
  { id: "day-3", number: 3, date: "2026-12-14", title: "Pine Forest, Lake & Sunset", route: "Trung tâm → Đống Đa → Hồ Tuyền Lâm → Trung tâm", summary: "Rừng thông, Happy Hill và một buổi chiều thong thả bên hồ.", outfit: "Beige, forest green, burgundy · ấm áp giữa rừng thông." },
  { id: "day-4", number: 4, date: "2026-12-15", title: "Old Train Station & Goodbye", route: "Khách sạn → Ga Đà Lạt → Charlie Mansion → Liên Khương", summary: "Một khung hình vintage trước khi mang ký ức về Hà Nội.", outfit: "Vintage · đồ thoải mái cho chuyến bay về." }
];

const places = [
  place("cau-dat", "Đồi chè Cầu Đất", "nature", "Đồi chè, không gian xanh và chụp ảnh phong cảnh.", "main", "", "Săn mây 04:45–05:00 chỉ khi thời tiết phù hợp và cả nhóm đồng ý.", ["Đồi chè", "Săn mây"]),
  place("persimmon", "Cafe Persimmon", "coffee", "Cafe phong cách Hàn Quốc và vườn hồng.", "main", "", "Kiểm tra tình trạng vườn hồng; nếu không còn đẹp, chọn điểm chụp khác.", ["Hàn Quốc", "Vườn hồng"]),
  place("phong-mien", "Cafe Phong Miên", "coffee", "Chụp ảnh với khung cảnh rừng thông.", "main", "", "Địa điểm đang được nhóm quan tâm; cần xác nhận địa chỉ và giờ phục vụ.", ["Rừng thông"]),
  place("happy-hill", "Happy Hill Coffee", "coffee", "Cảnh hồ, tiểu cảnh và những khung hình của cả nhóm.", "group", "", "Nhóm rất muốn đến: giữ trong lịch chính. Cần kiểm tra giờ mở cửa.", ["Ưu tiên nhóm", "Cảnh hồ"]),
  place("tuyen-lam", "Hồ Tuyền Lâm", "nature", "Ngắm cảnh hồ và tận hưởng buổi chiều yên bình.", "main", "", "16:00–17:15 là khung tham quan dự kiến, không phải dự báo giờ hoàng hôn. Giảm thời gian nếu mưa.", ["Hồ nước", "Buổi chiều"]),
  place("tv-tower", "Tháp truyền hình Đà Lạt", "architecture", "Góc chụp kiến trúc tại khu Đống Đa.", "main", "Khu Đống Đa", "Cần xác nhận góc chụp và lối tiếp cận phù hợp.", ["Check-in"]),
  place("vinaphone", "Tháp VinaPhone", "check-in", "Góc chụp phố đêm khi tháp lên đèn.", "main"),
  place("xuan-huong", "Hồ Xuân Hương", "city", "Đi dạo quanh hồ giữa trung tâm thành phố.", "main"),
  place("night-market", "Chợ đêm Đà Lạt", "city", "Không khí phố đêm, ăn vặt và đi dạo cùng nhau.", "main"),
  place("train-station", "Ga Đà Lạt", "architecture", "Kiến trúc và những khung ảnh phong cách vintage.", "main", "", "Có thể bỏ nếu lịch sáng gấp hoặc giao thông không thuận lợi. Không thêm điểm xa vào ngày về.", ["Vintage"]),
  place("charlie", "Charlie Mansion", "hotel", "Điểm nghỉ ngơi của nhóm trong 3 đêm; khách sạn đã đặt.", "main", "21/2 Yersin", "Giờ nhận/trả phòng cần xác nhận với khách sạn. Không lưu mã đặt phòng hoặc thông tin nhạy cảm."),
  place("linh-phuoc", "Chùa Linh Phước", "architecture", "Điểm ghé thêm trên cung Cầu Đất – Trại Mát.", "optional"),
  place("truc-lam", "Thiền viện Trúc Lâm", "architecture", "Lựa chọn tham quan thêm trong cung Hồ Tuyền Lâm.", "optional", "", "Có thể bỏ để chụp ảnh lâu hơn hoặc nghỉ ngơi."),
  place("tui-mo-to", "Túi Mơ To", "coffee", "Lựa chọn cafe thứ hai trong ngày 2.", "optional", "", "Bỏ nếu mệt; có thể trở về khách sạn nghỉ."),
  place("nguyen-khuyen", "Đường Nguyễn Khuyến", "check-in", "Khu Cam Ly, địa điểm nhóm lưu để chụp ảnh.", "optional", "Khu Cam Ly"),
  place("doc-nha-bo", "Dốc Nhà Bò", "check-in", "Góc chụp ảnh dốc phố Đà Lạt.", "optional"),
  place("hoang-van-thu", "Đường Hoàng Văn Thụ", "city", "Góc nhìn thành phố, phương án ghé thêm.", "optional"),
  place("dong-da-villa", "Biệt thự Đống Đa", "architecture", "Phong cách châu Âu; cần xác nhận địa điểm cụ thể.", "optional"),
  place("suoi-binh-yen", "Suối Bình Yên", "nature", "Lựa chọn ngoài lịch chính.", "optional"),
  place("love-valley", "Thung lũng Tình Yêu", "nature", "Phương án thay thế một phần ngày 2 theo cung Bắc.", "backup", "", "Không tự động ghép vào lịch chính; cân nhắc thời gian di chuyển."),
  place("langbiang-land", "Langbiang Land", "nature", "Khu đồi Măng Lin; phương án thay thế cung Bắc.", "backup", "Khu đồi Măng Lin", "Chỉ thay một phần ngày 2 khi nhóm thống nhất."),
  place("mong-mo", "Đồi Mộng Mơ", "nature", "Phương án thay thế một phần ngày 2 theo cung Bắc.", "backup")
];

const restaurant = (id, name, address, dish, priority, notes) => ({ ...place(id, name, "food", dish, priority, address, notes), dish });
const restaurants = [
  restaurant("tuk-tuk", "Tiệm gà Túk Túk", "39 Trần Đại Nghĩa", "Các món gà", "group", "Một thành viên từng ăn và giới thiệu. Địa chỉ tham khảo, cần xác nhận và đặt bàn cho 6 người."),
  restaurant("banh-can-le", "Bánh căn Lệ", "27/44 Yersin", "Bánh căn", "group", "Món nhóm muốn thử. Địa chỉ do nhóm cung cấp, cần xác nhận."),
  restaurant("banh-uot", "Bánh ướt lòng gà", "Chưa chốt quán", "Bánh ướt lòng gà", "group", "Có nhiều địa chỉ; cả nhóm cần chọn quán sau."),
  restaurant("ba-toa", "Lẩu bò Ba Toa", "29 Hoàng Diệu", "Lẩu bò", "group", "Tên Ba Toa/Boa Toa và cơ sở cụ thể cần xác minh; giữ thông tin tham khảo của nhóm."),
  restaurant("tao-ngo", "Lẩu gà lá é Tao Ngộ", "Chưa chốt chi nhánh", "Lẩu gà lá é", "group", "Có nhiều chi nhánh; cần chọn cơ sở và xác nhận trước khi đi."),
  restaurant("mi-quang", "Mì Quảng Bà Xí", "Lô A29 Mạc Đĩnh Chi", "Mì Quảng", "group", "Món nhóm đề xuất; địa chỉ tham khảo cần xác nhận."),
  restaurant("pho-gia-lam", "Phở Gia Lâm", "30 Ngô Quyền, Cam Ly", "Phở và lẩu", "optional", "Phương án ăn uống thêm; cần xác nhận địa chỉ và giờ phục vụ."),
  restaurant("banh-mi", "Bánh mì 3 đời", "237 Bùi Thị Xuân", "Bánh mì", "backup", "Ăn sáng dự phòng; thông tin nhóm cung cấp chưa xác minh."),
  restaurant("moc-bbq", "Mộc BBQ", "Hẻm 59 Đống Đa", "Cơm trưa / BBQ", "optional", "Nhóm ghi chú trưa có cơm, tối có BBQ, không gian đẹp. Cần xác nhận có phục vụ cơm trưa; nếu không, chọn quán gần đó."),
  restaurant("phan-rang", "Lẩu bò Phan Rang", "29 Quang Trung", "Lẩu bò", "backup", "Phương án thay thế lẩu bò Ba Toa; địa chỉ tham khảo cần xác nhận."),
  restaurant("song-sanh", "Tiệm nướng sông sánh", "36/2 Lê Văn Tám", "Đồ nướng", "backup", "Nhóm lưu ý có thể đông; cân nhắc đặt bàn cho 6 người."),
  restaurant("com-ga", "Cơm gà đa nhân cách", "94 Nguyễn Thị Nghĩa", "Cơm gà", "backup", "Phương án ăn uống thay thế; địa chỉ tham khảo cần xác nhận."),
  restaurant("vi-que", "Cơm niêu Vi Quê", "35–37 Đinh Tiên Hoàng", "Cơm niêu", "backup", "Phương án ăn uống thay thế; địa chỉ tham khảo cần xác nhận.")
];

const activity = (day, order, start, end, title, type, placeId = "", notes = "", alternative = "", description = "") => ({
  id: `d${day}-a${String(order).padStart(2, "0")}`, revision: 1, dayId: `day-${day}`, title, start, end, type, placeId, description, notes, priority: type === "optional" ? "optional" : "main", order: order * 100, alternative
});
const activities = [
  activity(1, 1, "14:30", "", "Bay từ Hà Nội đến Đà Lạt", "transport", "", "Giờ khởi hành đã chốt; chưa có giờ hạ cánh thực tế."),
  activity(1, 2, "Chiều", "", "Đến Liên Khương, về Charlie Mansion", "transport", "charlie", "Xe sân bay chưa chốt; cần xe đủ 6 người và hành lý."),
  activity(1, 3, "17:00", "18:00", "Nhận phòng và nghỉ ngơi", "hotel", "charlie", "Khung dự kiến, phụ thuộc giờ hạ cánh; không phải giờ nhận phòng chắc chắn."),
  activity(1, 4, "18:30", "19:45", "Ăn tối lẩu gà lá é", "food", "tao-ngo", "Chưa chốt chi nhánh.", "Nếu đến muộn hoặc mệt: chỉ ăn tối và dạo chợ đêm."),
  activity(1, 5, "20:00", "20:30", "Tháp VinaPhone lên đèn", "main", "vinaphone"),
  activity(1, 6, "20:30", "21:30", "Dạo chợ đêm và Hồ Xuân Hương", "main", "night-market", "Có thể kết hợp đi dạo Hồ Xuân Hương tùy sức nhóm."),
  activity(1, 7, "Sau 21:30", "", "Trở về khách sạn", "hotel", "charlie"),
  activity(2, 1, "06:45", "07:40", "Ăn sáng Bánh căn Lệ", "food", "banh-can-le"),
  activity(2, 2, "08:30", "10:15", "Đồi chè Cầu Đất", "main", "cau-dat", "Ưu tiên số 1 của ngày.", "Săn mây từ 04:45–05:00 chỉ khi thời tiết phù hợp và cả nhóm đồng ý."),
  activity(2, 3, "10:45", "11:30", "Ghé Chùa Linh Phước", "optional", "linh-phuoc", "Có thể bỏ nếu mệt."),
  activity(2, 4, "12:00", "13:00", "Cơm gọi món khu Hùng Vương", "food", "", "Chưa chốt quán; ưu tiên thuận đường."),
  activity(2, 5, "13:15", "14:45", "Cafe Persimmon", "coffee", "persimmon", "Ưu tiên số 2 của ngày.", "Nếu vườn hồng không còn đẹp, chuyển điểm chụp ảnh khác."),
  activity(2, 6, "15:00", "16:30", "Túi Mơ To hoặc về nghỉ", "optional", "tui-mo-to", "Cafe thứ hai là lựa chọn thêm; bỏ nếu mệt."),
  activity(2, 7, "17:30", "19:00", "Ăn tối Tiệm gà Túk Túk", "food", "tuk-tuk", "Ưu tiên nhóm; một thành viên từng trải nghiệm. Cần xác nhận địa chỉ."),
  activity(2, 8, "Buổi tối", "", "Tự do khám phá thành phố", "optional", "", "Đi dạo hoặc nghỉ ngơi tùy sức."),
  activity(3, 1, "07:30", "08:15", "Ăn sáng bánh ướt lòng gà", "food", "banh-uot", "Chưa chốt quán."),
  activity(3, 2, "08:45", "10:00", "Cafe Phong Miên", "coffee", "phong-mien", "Chụp ảnh rừng thông; điểm ưu tiên của ngày."),
  activity(3, 3, "10:15", "10:45", "Góc chụp tháp truyền hình", "main", "tv-tower", "Khu Đống Đa; cần xác nhận góc chụp."),
  activity(3, 4, "11:15", "12:15", "Ăn trưa Mộc BBQ hoặc quán gần đó", "food", "moc-bbq", "Chỉ chọn nếu có cơm trưa; giờ phục vụ chưa xác nhận.", "Thay bằng quán gần đó nếu Mộc BBQ không phù hợp."),
  activity(3, 5, "12:45", "13:30", "Thiền viện Trúc Lâm", "optional", "truc-lam", "Có thể bỏ để chụp ảnh lâu hơn."),
  activity(3, 6, "14:00", "15:45", "Happy Hill Coffee", "coffee", "happy-hill", "Ưu tiên nhóm: giữ trong lịch chính."),
  activity(3, 7, "16:00", "17:15", "Chiều bên Hồ Tuyền Lâm", "main", "tuyen-lam", "Khung tham quan dự kiến, không phải dự báo hoàng hôn.", "Nếu mưa, giảm thời gian ở hồ và chọn cafe có không gian trong nhà."),
  activity(3, 8, "18:30", "20:00", "Ăn tối lẩu bò Ba Toa", "food", "ba-toa", "Cơ sở và địa chỉ tham khảo cần xác nhận.", "Thay bằng lẩu bò Phan Rang hoặc tiệm nướng."),
  activity(3, 9, "Buổi tối", "", "Nghỉ ngơi hoặc dạo phố", "optional", ""),
  activity(4, 1, "07:30", "08:30", "Ăn sáng gần khách sạn", "food", "", "Chưa chốt quán; ưu tiên gần và nhanh."),
  activity(4, 2, "08:45", "09:45", "Ga Đà Lạt, một khung hình vintage", "main", "train-station", "Không thêm điểm xa trong ngày về.", "Bỏ Ga Đà Lạt nếu lịch sáng quá gấp hoặc giao thông không thuận lợi."),
  activity(4, 3, "10:00", "10:45", "Về khách sạn, chuẩn bị hành lý", "hotel", "charlie"),
  activity(4, 4, "11:00", "", "Trả phòng Charlie Mansion", "hotel", "charlie", "Cần xác nhận giờ trả phòng với khách sạn."),
  activity(4, 5, "11:00", "12:00", "Di chuyển ra sân bay Liên Khương", "transport", "", "Thời gian ước tính; xe chưa chốt. Ưu tiên lịch sân bay, tính thêm dự phòng giao thông."),
  activity(4, 6, "Khoảng 12:00", "", "Có mặt tại sân bay, làm thủ tục", "transport", "", "Mốc dự kiến để có thời gian làm thủ tục."),
  activity(4, 7, "14:30", "", "Bay về Hà Nội", "transport", "", "Giờ khởi hành đã chốt.")
];
const note = (id, title, body, kind) => ({ id, revision: 1, title, body, kind });
export const seed = {
  schemaVersion: 1,
  trip: { title: "DA LAT TRIP 2026", startDate: "2026-12-12", endDate: "2026-12-15", travelers: 6, nights: 3, hotel: "Charlie Mansion · 21/2 Yersin", flightOut: "12/12 · Hà Nội → Đà Lạt · 14:30", flightBack: "15/12 · Đà Lạt → Hà Nội · 14:30" },
  days, activities, places, restaurants,
  notes: [
    note("preparation", "Mang theo một chút ấm áp", "Áo khoác và đồ mặc nhiều lớp\nGiày đi bộ, tất ấm\nÔ hoặc áo mưa gọn\nKem chống nắng\nSạc dự phòng và dung lượng lưu ảnh\nGiấy tờ cần thiết: tự chuẩn bị, không tải lên website", "checklist"),
    note("weather", "Tháng 12, lạnh vừa đủ để gần nhau", "Khí hậu tham khảo theo brief: ban ngày khoảng 20–23°C; sáng sớm và ban đêm khoảng 12–15°C. Đây không phải dự báo cho ngày 12–15/12/2026. Kiểm tra dự báo gần ngày đi; không cố săn mây khi thời tiết không phù hợp.", "weather"),
    note("transport", "Di chuyển cùng nhau", "Dự kiến thuê xe 7 chỗ có tài xế cho 6 thành viên. Ngày 13/12: cung Cầu Đất; ngày 14/12: Đống Đa – Hồ Tuyền Lâm. Ngày 12 và 15/12: xe sân bay đủ 6 người và hành lý. Chưa chốt nhà xe hoặc giá; cần kiểm tra sức chứa hành lý.", "transport"),
    note("outfit-1", "Day 1 · Winter city", days[0].outfit, "outfit"),
    note("outfit-2", "Day 2 · Tea hill tones", days[1].outfit, "outfit"),
    note("outfit-3", "Day 3 · Forest palette", days[2].outfit, "outfit"),
    note("outfit-4", "Day 4 · A little vintage", days[3].outfit, "outfit"),
    note("confirmations", "Cùng xác nhận trước khi đi", "Giờ hạ cánh thực tế; xe sân bay và xe trong thành phố; giá thuê xe; giờ phục vụ các quán; chi nhánh Tao Ngộ; cơ sở lẩu bò Ba Toa; địa chỉ Túk Túk; Mộc BBQ có phục vụ cơm trưa hay không. Cân nhắc đặt bàn 6 người ở Túk Túk và các bữa tối; tiệm nướng có thể đông.", "general"),
    note("flexibility", "Lịch nháp, nhịp đi là của chúng mình", "Mệt thì bỏ Chùa Linh Phước, cafe thứ hai hoặc Thiền viện Trúc Lâm. Ngày đến muộn chỉ ăn tối và chợ đêm. Nếu mưa, chọn cafe trong nhà và giảm thời gian bên hồ. Cung Bắc chỉ là phương án thay một phần ngày 2. Ngày về ưu tiên trả phòng và sân bay.", "general"),
    note("group-notes", "Góc ghi chú của cả nhóm", "Thêm những điều cả nhóm muốn nhớ ở đây. Không ghi thông tin cá nhân nhạy cảm, giấy tờ, mã đặt vé hoặc số điện thoại.", "general")
  ]
};
