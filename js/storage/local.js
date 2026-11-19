import { seed } from "../data/seed.js?v=20261119-1";
import { validateBackup, validateRecord } from "../data/schema.js?v=20261119-1";

export const collections = ["activities", "places", "restaurants", "notes"];
const KEY = "dalat-trip-data-v1";
export const clone = (value) => JSON.parse(JSON.stringify(value));
export const seedBackup = () => Object.fromEntries([
  ["schemaVersion", 1],
  ...collections.map((name) => [name, clone(seed[name])])
]);

export function localAdapter(onChange, onStatus) {
  const stored = localStorage.getItem(KEY);
  let data = stored ? validateBackup(JSON.parse(stored)) : seedBackup();
  const persist = (next) => {
    validateBackup(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    data = next;
    onChange(clone(data));
  };
  const guard = (name) => {
    if (!collections.includes(name)) {
      throw new Error("Loại dữ liệu không hợp lệ.");
    }
  };
  const mutate = async (operation) => {
    onStatus({ state: "saving", message: "Đang lưu trên thiết bị…" });
    try {
      // Read again to catch changes saved by another tab.
      const latest = localStorage.getItem(KEY);
      data = latest ? validateBackup(JSON.parse(latest)) : data;
      persist(operation(clone(data)));
      onStatus({ state: "saved", message: "Đã lưu trên thiết bị này" });
    } catch (error) {
      onStatus({ state: "error", message: error.message });
      throw error;
    }
  };
  const repo = {
    mode: "local",
    get data() {
      return clone(data);
    },
    async save(name, record, expectedRevision = 0) {
      guard(name);
      return mutate((next) => {
        const index = next[name].findIndex((item) => item.id === record.id);
        const current = next[name][index];
        if ((current?.revision || 0) !== expectedRevision) {
          throw new Error("Nội dung đã thay đổi ở tab khác. Đóng form và mở lại trước khi sửa.");
        }
        const saved = { ...clone(record), revision: expectedRevision + 1 };
        validateRecord(name, saved);
        if (index < 0) {
          next[name].push(saved);
        } else {
          next[name][index] = saved;
        }
        return next;
      });
    },
    async remove(name, id, expectedRevision) {
      guard(name);
      return mutate((next) => {
        const current = next[name].find((item) => item.id === id);
        if (!current || current.revision !== expectedRevision) {
          throw new Error("Nội dung đã thay đổi. Hãy mở lại trước khi xóa.");
        }
        next[name] = next[name].filter((item) => item.id !== id);
        return next;
      });
    },
    exportData() {
      return clone(data);
    },
    async importData(backup) {
      const valid = validateBackup(clone(backup));
      return mutate(() => valid);
    },
    async resetLocal() {
      return mutate(() => seedBackup());
    },
    async seedCloud() {
      throw new Error("Firebase chưa được cấu hình. Hiện đang dùng Local Mode.");
    }
  };
  window.addEventListener("storage", (event) => {
    if (event.key === KEY && event.newValue) {
      try {
        data = validateBackup(JSON.parse(event.newValue));
        onChange(clone(data));
      } catch (error) {
        onStatus({ state: "error", message: "Dữ liệu từ tab khác không hợp lệ: " + error.message });
      }
    }
  });
  onChange(clone(data));
  onStatus({ state: "saved", message: "Local Mode · Chỉ lưu trên thiết bị này" });
  return repo;
}
