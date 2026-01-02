export async function validateUnlockCode(licenseKey: string): Promise<{ success: boolean; error?: string }> {
  if (!licenseKey?.trim()) return { success: false, error: "License key required" };
  try {
    const response = await fetch('/api/verify-license', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey: licenseKey.trim() }),
    });
    const data = await response.json();
    if (data.success) localStorage.setItem('pawreader_unlock_code', licenseKey.trim());
    return data;
  } catch {
    return { success: false, error: "Network error" };
  }
}

export function isUnlocked(): boolean {
  return localStorage.getItem('pawreader_unlock_code') !== null;
}
