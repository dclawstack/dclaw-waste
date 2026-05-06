const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function auditWasteStream(site_id: string) {
  const res = await fetch(`${API_BASE}/audits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ site_id }),
  });
  if (!res.ok) throw new Error('Failed to audit waste stream');
  return res.json();
}

export async function getBreakdown(auditId: string) {
  const res = await fetch(`${API_BASE}/audits/${auditId}/breakdown`);
  if (!res.ok) throw new Error('Failed to fetch breakdown');
  return res.json();
}
