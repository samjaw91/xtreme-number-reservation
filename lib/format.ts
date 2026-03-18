export function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, "").replace(/[^\d+]/g, "");
}

export function makeRequestCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "REQ-";
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function fmtDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ar-LB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
