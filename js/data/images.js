// Verified Wikimedia Commons photographs. Images are cropped only by CSS.
const lake = {
  url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Tuyen_Lam_Lake_01.jpg/1280px-Tuyen_Lam_Lake_01.jpg",
  credit: "Hồ Tuyền Lâm · Diane Selwyn · Public domain (2011)",
  source: "https://commons.wikimedia.org/wiki/File:Tuyen_Lam_Lake_01.jpg",
  license: "https://creativecommons.org/publicdomain/mark/1.0/"
};

const tea = {
  url: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Che-cau-dat-da-lat.jpg",
  credit: "Đồi chè Cầu Đất · Thebell1992 · CC BY-SA 4.0 (2016), hiển thị cắt khung",
  source: "https://commons.wikimedia.org/wiki/File:Che-cau-dat-da-lat.jpg",
  license: "https://creativecommons.org/licenses/by-sa/4.0/"
};

export const images = {
  hero: lake,
  lake,
  tea,
  places: {
    'cau-dat': tea,
    'linh-phuoc': {
      url: "https://upload.wikimedia.org/wikipedia/commons/1/14/ChuaLinhPhuoc02.jpg",
      credit: "Chùa Linh Phước · Phan Ba · Public domain (2011), hiển thị cắt khung",
      source: "https://commons.wikimedia.org/wiki/File:ChuaLinhPhuoc02.jpg",
      license: "https://creativecommons.org/publicdomain/mark/1.0/"
    },
    'truc-lam': {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/ThienVienTrucLamDaLat_main_building.JPG/1280px-ThienVienTrucLamDaLat_main_building.JPG",
      credit: "Thiền viện Trúc Lâm · Nguyễn Thanh Quang · CC BY-SA 3.0, hiển thị cắt khung",
      source: "https://commons.wikimedia.org/wiki/File:ThienVienTrucLamDaLat_main_building.JPG",
      license: "https://creativecommons.org/licenses/by-sa/3.0/"
    },
    'night-market': {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Dalat_night_market_-_panoramio_%281%29.jpg/1280px-Dalat_night_market_-_panoramio_%281%29.jpg",
      credit: "Chợ đêm Đà Lạt · The Erica Chang · CC BY 3.0 (2010), hiển thị cắt khung",
      source: "https://commons.wikimedia.org/wiki/File:Dalat_night_market_-_panoramio_(1).jpg",
      license: "https://creativecommons.org/licenses/by/3.0/"
    },
    'love-valley': {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Vall%C3%A9e_d%27Amour_panorama.JPG/1280px-Vall%C3%A9e_d%27Amour_panorama.JPG",
      credit: "Thung lũng Tình Yêu · Nguyễn Thanh Quang · CC BY-SA 4.0 (2007), hiển thị cắt khung",
      source: "https://commons.wikimedia.org/wiki/File:Vall%C3%A9e_d%27Amour_panorama.JPG",
      license: "https://creativecommons.org/licenses/by-sa/4.0/"
    }
  },
  station: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Da_Lat_train_station_03.jpg/960px-Da_Lat_train_station_03.jpg",
    credit: "Ga Đà Lạt · Diane Selwyn · Public domain (2011)",
    source: "https://commons.wikimedia.org/wiki/File:Da_Lat_train_station_03.jpg",
    license: "https://creativecommons.org/publicdomain/mark/1.0/"
  },
  city: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/H%E1%BB%93_Xu%C3%A2n_H%C6%B0%C6%A1ng%2C_032016.jpg/1280px-H%E1%BB%93_Xu%C3%A2n_H%C6%B0%C6%A1ng%2C_032016.jpg",
    credit: "Hồ Xuân Hương về đêm · Prenn · CC BY-SA 4.0 (2016), hiển thị cắt khung",
    source: "https://commons.wikimedia.org/wiki/File:H%E1%BB%93_Xu%C3%A2n_H%C6%B0%C6%A1ng,_032016.jpg",
    license: "https://creativecommons.org/licenses/by-sa/4.0/"
  }
};
