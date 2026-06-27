// Generates a stable anonymous session ID per device, stored in localStorage.
// Used as the identity key in Supabase until auth is added.
export function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  const key = "spirit_session_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}
