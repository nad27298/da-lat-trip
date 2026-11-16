import { firebaseSettings } from "../firebase-config.js?v=20261116-3";
import { localAdapter } from "./local.js?v=20261116-3";

export async function createRepository(onChange, onStatus) {
  if (!firebaseSettings.enabled) {
    return localAdapter(onChange, onStatus);
  }
  onStatus({ state: "loading", message: "Đang kết nối Firestore…" });
  try {
    const { firestoreAdapter } = await import("./firestore.js?v=20261116-3");
    return await firestoreAdapter(firebaseSettings, onChange, onStatus);
  } catch (error) {
    onStatus({ state: "error", message: "Không kết nối được cloud: " + error.message });
    // Never silently fall back to local data when Cloud Mode is selected.
    throw error;
  }
}
