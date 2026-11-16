import { seed } from "./seed.js?v=20261116-2";

export const collections = ["activities", "places", "restaurants", "notes"];
const fields = {
  activities: ["id", "revision", "dayId", "title", "start", "end", "type", "placeId", "description", "notes", "priority", "order", "alternative"],
  places: ["id", "revision", "name", "category", "address", "description", "notes", "images", "imageCredit", "googleMapsUrl", "latitude", "longitude", "priority", "tags", "verificationStatus", "dish"],
  notes: ["id", "revision", "title", "body", "kind"]
};
fields.restaurants = fields.places;
const fail = (message) => {
  throw new Error(`Dữ liệu không hợp lệ: ${message}`);
};
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const string = (value, length, name) => {
  if (typeof value !== "string" || value.length > length) {
    fail(name);
  }
};
const exactKeys = (value, keys, name) => {
  if (!isObject(value) || Object.keys(value).length !== keys.length || !keys.every((key) => Object.hasOwn(value, key))) {
    fail(name);
  }
};
export function safeUrl(value, image = false) {
  if (!value) {
    return "";
  }
  if (typeof value !== "string" || /[\u0000-\u0020\\]/.test(value)) {
    return "";
  }
  if (image && /^(?:\.\/)?assets\/[a-zA-Z0-9_./%-]+$/.test(value) && !value.includes("..")) {
    return value;
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
  } catch {
    return "";
  }
}
export function validateRecord(collection, record) {
  if (!collections.includes(collection)) {
    fail("collection");
  }
  exactKeys(record, fields[collection], collection);
  if (typeof record.id !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(record.id) || !Number.isSafeInteger(record.revision) || record.revision < 1 || record.revision > 1000000000) {
    fail("id hoặc revision");
  }
  if (collection === "activities") {
    string(record.title, 200, "tên hoạt động");
    if (!record.title.trim() || !seed.days.some((day) => day.id === record.dayId)) {
      fail("ngày hoặc tên hoạt động");
    }
    for (const key of ["start", "end"]) {
      string(record[key], 80, key);
    }
    string(record.type, 40, "type");
    string(record.priority, 40, "priority");
    string(record.placeId, 100, "placeId");
    for (const key of ["description", "notes", "alternative"]) {
      string(record[key], 3000, key);
    }
    if (!Number.isFinite(record.order) || record.order < 0 || record.order > 100000) {
      fail("thứ tự");
    }
  } else if (collection === "notes") {
    string(record.title, 200, "tiêu đề ghi chú");
    string(record.body, 6000, "nội dung ghi chú");
    string(record.kind, 40, "kind");
    if (!record.title.trim()) {
      fail("tiêu đề ghi chú trống");
    }
  } else {
    string(record.name, 200, "tên địa điểm");
    if (!record.name.trim()) {
      fail("tên địa điểm trống");
    }
    for (const key of ["category", "priority"]) {
      string(record[key], 40, key);
    }
    string(record.verificationStatus, 80, "trạng thái xác minh");
    string(record.address, 500, "địa chỉ");
    string(record.dish, 500, "món nổi bật");
    string(record.description, 3000, "mô tả");
    string(record.notes, 3000, "ghi chú");
    string(record.imageCredit, 500, "credit ảnh");
    string(record.googleMapsUrl, 1500, "Maps URL");
    if (record.googleMapsUrl && !safeUrl(record.googleMapsUrl)) {
      fail("Maps URL phải dùng HTTPS");
    }
    if (!Array.isArray(record.images) || record.images.length > 3 || !record.images.every((url) => typeof url === "string" && url.length <= 1500 && Boolean(safeUrl(url, true)))) {
      fail("ảnh (tối đa 3 URL HTTPS hoặc assets/...)");
    }
    if (!Array.isArray(record.tags) || record.tags.length > 8 || !record.tags.every((tag) => typeof tag === "string" && tag.length <= 80)) {
      fail("tags");
    }
    if (!((record.latitude === null && record.longitude === null) || (typeof record.latitude === "number" && Number.isFinite(record.latitude) && Math.abs(record.latitude) <= 90 && typeof record.longitude === "number" && Number.isFinite(record.longitude) && Math.abs(record.longitude) <= 180))) {
      fail("tọa độ");
    }
  }
  return record;
}
export function validateBackup(data) {
  exactKeys(data, ["schemaVersion", ...collections], "cấu trúc backup");
  if (data.schemaVersion !== 1) {
    fail("phiên bản hoặc thông tin chuyến đi không khớp");
  }
  const ids = new Set();
  for (const collection of collections) {
    if (!Array.isArray(data[collection]) || data[collection].length > 200) {
      fail(`${collection}: tối đa 200 mục`);
    }
    const ownIds = new Set();
    for (const record of data[collection]) {
      validateRecord(collection, record);
      if (ownIds.has(record.id)) {
        fail(`trùng id ${record.id}`);
      }
      ownIds.add(record.id);
      if (collection === "places" || collection === "restaurants") {
        if (ids.has(record.id)) {
          fail(`trùng id địa điểm/quán ${record.id}`);
        }
        ids.add(record.id);
      }
    }
  }
  if (data.activities.some((activity) => activity.placeId && !ids.has(activity.placeId))) {
    fail("hoạt động tham chiếu địa điểm không tồn tại");
  }
  return data;
}
