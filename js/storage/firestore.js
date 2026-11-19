import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, collection, doc, onSnapshot, runTransaction, getDocsFromServer, getDocFromServer } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { collections, clone, seedBackup } from "./local.js?v=20261119-1";
import { validateBackup, validateRecord } from "../data/schema.js?v=20261119-1";

export async function firestoreAdapter(settings, onChange, onStatus) {
  if (!settings.config.projectId || !settings.config.apiKey || !settings.config.appId) {
    throw new Error("Điền Firebase Web Config trong js/firebase-config.js.");
  }
  const db = getFirestore(initializeApp(settings.config));
  const base = "trips/da-lat-2026";
  const meta = doc(db, base + "/control/state");
  let data = { schemaVersion: 1, ...Object.fromEntries(collections.map((name) => [name, []])) };
  const ready = new Set();
  const cached = new Set(collections);
  let busy = false;
  let listenerError = false;
  let online = navigator.onLine;
  const guard = (name) => {
    if (!collections.includes(name)) {
      throw new Error("Loại dữ liệu không hợp lệ.");
    }
  };
  const reference = (name, id) => {
    guard(name);
    if (typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(id)) {
      throw new Error("ID không hợp lệ.");
    }
    return doc(db, base + "/" + name + "/" + id);
  };
  const status = () => {
    if (!online) {
      onStatus({ state: "offline", message: busy ? "Mất kết nối · Thao tác đang chờ máy chủ; chưa được xác nhận" : "Mất kết nối · Dữ liệu đang xem có thể cũ; chưa lưu thay đổi mới" });
    } else if (listenerError) {
      onStatus({ state: "error", message: "Listener cloud bị lỗi. Tải lại trang sau khi kiểm tra rules/kết nối." });
    } else if (cached.size > 0) {
      onStatus({ state: "offline", message: busy ? "Cloud chưa xác nhận kết nối · Thao tác lưu vẫn đang chờ" : "Đang xem bản cache · Chưa xác nhận dữ liệu mới nhất từ cloud" });
    } else if (!busy) {
      onStatus({ state: "saved", message: settings.readOnly ? "Cloud Mode · Chỉ đọc" : "Cloud Mode · Đã đồng bộ" });
    }
  };
  window.addEventListener("online", () => {
    online = true;
    status();
  });
  window.addEventListener("offline", () => {
    online = false;
    status();
  });
  const mutate = async (operation) => {
    if (settings.readOnly) {
      throw new Error("Website đang ở chế độ chỉ đọc.");
    }
    if (!navigator.onLine) {
      throw new Error("Đang offline. Thay đổi chưa được gửi; giữ form và thử lưu lại khi có mạng.");
    }
    if (busy) {
      throw new Error("Một thao tác đang chờ cloud xác nhận. Vui lòng đợi.");
    }
    busy = true;
    onStatus({ state: "saving", message: "Đang chờ Firestore xác nhận…" });
    try {
      await operation();
      busy = false;
      status();
    } catch (error) {
      busy = false;
      onStatus({ state: "error", message: error.message });
      throw error;
    }
  };
  const bump = (transaction, snapshot) => {
    transaction.set(meta, { revision: (snapshot.data()?.revision || 0) + 1, initialized: true });
  };
  const conflict = () => new Error("Nội dung đã được người khác chỉnh sửa. Đóng form, xem bản mới và sửa lại để tránh ghi đè.");

  // The global revision is a small coordination record, not a copy of the trip.
  // Rules require its increment for every write, making bulk restore race-safe.
  const replace = async (backup, onlyEmpty = false) => {
    validateBackup(backup);
    const before = await getDocFromServer(meta);
    const snapshots = await Promise.all(collections.map((name) => getDocsFromServer(collection(db, base + "/" + name))));
    if (onlyEmpty && snapshots.some((snapshot) => !snapshot.empty)) {
      throw new Error("Cloud đã có dữ liệu. Không seed hoặc ghi đè. Hãy xuất bản cloud để sao lưu.");
    }
    const existing = snapshots.flatMap((snapshot, index) => snapshot.docs.map((item) => ({ name: collections[index], id: item.id, record: item.data() })));
    const total = existing.length + collections.reduce((sum, name) => sum + backup[name].length, 0);
    if (total > 400) {
      throw new Error("Bản sao lưu quá lớn cho khôi phục nguyên tử (tổng bản hiện tại và bản nhập tối đa 400). Chưa có thay đổi nào được ghi.");
    }
    await runTransaction(db, async (transaction) => {
      const current = await transaction.get(meta);
      if ((current.data()?.revision || 0) !== (before.data()?.revision || 0)) {
        throw conflict();
      }
      // Read existing records before any write to make revisions authoritative.
      const currentDocs = await Promise.all(existing.map((item) => transaction.get(reference(item.name, item.id))));
      const incoming = new Set(collections.flatMap((name) => backup[name].map((item) => name + "/" + item.id)));
      existing.forEach((item) => {
        if (!incoming.has(item.name + "/" + item.id)) {
          transaction.delete(reference(item.name, item.id));
        }
      });
      collections.forEach((name) => {
        backup[name].forEach((item) => {
          const index = existing.findIndex((old) => old.name === name && old.id === item.id);
          const revision = index < 0 ? 1 : currentDocs[index].data().revision + 1;
          transaction.set(reference(name, item.id), { ...item, revision });
        });
      });
      bump(transaction, current);
    });
  };
  const repo = {
    mode: "cloud",
    readOnly: settings.readOnly,
    get data() {
      return clone(data);
    },
    async save(name, record, expectedRevision = 0) {
      validateRecord(name, { ...record, revision: expectedRevision + 1 });
      const ref = reference(name, record.id);
      return mutate(() => runTransaction(db, async (transaction) => {
        const [current, state] = await Promise.all([transaction.get(ref), transaction.get(meta)]);
        if ((current.data()?.revision || 0) !== expectedRevision) {
          throw conflict();
        }
        transaction.set(ref, { ...clone(record), revision: expectedRevision + 1 });
        bump(transaction, state);
      }));
    },
    async remove(name, id, expectedRevision) {
      const ref = reference(name, id);
      return mutate(() => runTransaction(db, async (transaction) => {
        const [current, state] = await Promise.all([transaction.get(ref), transaction.get(meta)]);
        if (!current.exists() || current.data().revision !== expectedRevision) {
          throw conflict();
        }
        transaction.delete(ref);
        bump(transaction, state);
      }));
    },
    async exportData() {
      // Avoid presenting an offline cache as a current cloud backup.
      const before = await getDocFromServer(meta);
      const snapshots = await Promise.all(collections.map((name) => getDocsFromServer(collection(db, base + "/" + name))));
      const after = await getDocFromServer(meta);
      if ((before.data()?.revision || 0) !== (after.data()?.revision || 0)) {
        throw new Error("Cloud thay đổi trong lúc sao lưu. Vui lòng export lại.");
      }
      return validateBackup({ schemaVersion: 1, ...Object.fromEntries(snapshots.map((snapshot, index) => [collections[index], snapshot.docs.map((item) => item.data())])) });
    },
    async importData(backup) {
      return mutate(() => replace(clone(backup)));
    },
    async resetLocal() {
      throw new Error("Không reset cloud về seed. Dùng import JSON với xác nhận nếu cần khôi phục.");
    },
    async seedCloud() {
      return mutate(() => replace(seedBackup(), true));
    }
  };
  await new Promise((resolve, reject) => {
    let settled = false;
    const stops = [];
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        stops.forEach((stop) => stop());
        reject(new Error("Chưa nhận được dữ liệu từ máy chủ sau 20 giây. Kiểm tra mạng/rules và tải lại trang."));
      }
    }, 20000);
    collections.forEach((name) => {
      const stop = onSnapshot(collection(db, base + "/" + name), { includeMetadataChanges: true }, (snapshot) => {
        try {
          if (snapshot.metadata.fromCache) {
            cached.add(name);
          } else {
            cached.delete(name);
          }
          const records = snapshot.docs.map((item) => {
            const record = item.data();
            validateRecord(name, record);
            if (record.id !== item.id) {
              throw new Error("ID document cloud không khớp.");
            }
            return record;
          });
          // Never announce unacknowledged snapshots as saved.
          if (snapshot.metadata.hasPendingWrites) {
            status();
            return;
          }
          data = { ...data, [name]: records };
          if (!snapshot.metadata.fromCache) {
            ready.add(name);
          }
          if (ready.size === collections.length) {
            onChange(clone(data));
            if (!settled) {
              settled = true;
              clearTimeout(timeout);
              resolve();
            }
            status();
          } else if (snapshot.metadata.fromCache) {
            status();
          }
        } catch (error) {
          listenerError = true;
          onStatus({ state: "error", message: error.message });
          if (!settled) {
            settled = true;
            clearTimeout(timeout);
            stops.forEach((unsubscribe) => unsubscribe());
            reject(error);
          }
        }
      }, (error) => {
        listenerError = true;
        onStatus({ state: "error", message: error.message });
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          stops.forEach((unsubscribe) => unsubscribe());
          reject(error);
        }
      });
      stops.push(stop);
    });
  });
  return repo;
}
