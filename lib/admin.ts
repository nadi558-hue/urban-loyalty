// Admin allow-list — only these phone numbers may access /admin.
// Configured via the ADMIN_PHONES env var (comma-separated, any format).

export function normalizePhone(raw: string | null | undefined): string {
  const d = (raw ?? '').replace(/\D/g, '')
  if (d.startsWith('972')) return d
  if (d.startsWith('0')) return '972' + d.slice(1)
  return d
}

export function adminPhones(): string[] {
  return (process.env.ADMIN_PHONES ?? '')
    .split(',')
    .map((p) => normalizePhone(p))
    .filter(Boolean)
}

export function isAdminPhone(phone: string | null | undefined): boolean {
  if (!phone) return false
  return adminPhones().includes(normalizePhone(phone))
}
