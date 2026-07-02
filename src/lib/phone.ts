// Frontend Indian-phone validation that mirrors the backend.
const INDIA_E164 = /^\+91[6-9]\d{9}$/;

export function toIndianE164(raw: string): string | null {
  if (!raw) return null;
  let p = raw.replace(/[\s\-()]/g, '');
  if (p.startsWith('0')) p = p.slice(1);
  if (/^[6-9]\d{9}$/.test(p)) p = '+91' + p;
  if (p.startsWith('91') && p.length === 12) p = '+' + p;
  return INDIA_E164.test(p) ? p : null;
}
